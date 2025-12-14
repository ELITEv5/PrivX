// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*───────────────────────────────────────────────────────────────*
 *  P R I V X   H U R R I C A N E   S H I E L D   (POP SERIES)   *
 *───────────────────────────────────────────────────────────────*
 *  • Supports PLONK verifier (24-proof array)
 *  • Integrated Proof-of-Privacy Mining Vault trigger
 *  • Dynamic PRIVX fee split: 80% burn / 20% vault
 *  • Immutable, denomination-specific instances
 *  • Fully compatible with Poseidon Hasher + Mining Vault v14
 *
 *  2025 © ELITE Team6 • PrivX Protocol
 *───────────────────────────────────────────────────────────────*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice PLONK verifier interface
interface IVerifier {
    function verifyProof(
        uint256[24] calldata proof,
        uint256[3] calldata pubSignals
    ) external view returns (bool);
}

/// @notice Poseidon hasher interface
interface IHasher {
    function hash(uint256 left, uint256 right) external pure returns (bytes32);
}

/// @notice Proof-of-Privacy mining vault interface
interface IMiningVault {
    function mineReward(address user, uint256 depositAmt, string calldata action) external;
}

contract PrivX_Hurricane_POP100 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─────────────────────────────────────────────
    // Core linked contracts (immutable)
    // ─────────────────────────────────────────────
    IVerifier public immutable verifier;
    IHasher public immutable hasher;
    IERC20 public immutable token;        // deposit token (PRIVX)
    IERC20 public immutable privxToken;   // fee token (PRIVX)
    IMiningVault public immutable miningVault;
    uint256 public immutable denomination;

    // ─────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────
    uint32 public constant LEVELS = 20;
    uint32 public constant ROOT_HISTORY_SIZE = 100;
    uint256 public constant FEE_BP = 30;           // 0.3%
    uint256 public constant BP_DENOMINATOR = 10_000;

    // ─────────────────────────────────────────────
    // Merkle tree state
    // ─────────────────────────────────────────────
    uint32 public nextIndex = 0;
    bytes32[ROOT_HISTORY_SIZE] public roots;
    uint32 public currentRootIndex = 0;
    bytes32[LEVELS] public filledSubtrees;
    bytes32[LEVELS] public zeros;

    mapping(bytes32 => bool) public nullifierHashes;
    mapping(bytes32 => bool) public commitments;

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────
    event Deposit(bytes32 indexed commitment, uint32 leafIndex, uint256 timestamp);
    event Withdrawal(address indexed to, bytes32 nullifierHash);
    event FeeProcessed(uint256 feeAmount, uint256 burned, uint256 sentToVault);

    // ─────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────
    constructor(
        IVerifier _verifier,
        IHasher _hasher,
        IERC20 _token,
        IERC20 _privxToken,
        uint256 _denomination,
        IMiningVault _vault
    ) {
        require(address(_verifier) != address(0), "Verifier zero");
        require(address(_hasher) != address(0), "Hasher zero");
        require(address(_token) != address(0), "Token zero");
        require(address(_privxToken) != address(0), "PrivX zero");
        require(address(_vault) != address(0), "Vault zero");
        require(_denomination > 0, "Invalid denomination");

        verifier = _verifier;
        hasher = _hasher;
        token = _token;
        privxToken = _privxToken;
        denomination = _denomination;
        miningVault = _vault;

        // Initialize zero hashes and subtrees
        bytes32 current = bytes32(0);
        for (uint32 i = 0; i < LEVELS; i++) {
            zeros[i] = current;
            filledSubtrees[i] = current;
            current = hasher.hash(uint256(current), uint256(current));
        }
        roots[0] = current;
    }

    // ─────────────────────────────────────────────
    // Deposit (shield PRIVX + pay 0.3% fee)
    // ─────────────────────────────────────────────
    function deposit(bytes32 _commitment) external nonReentrant {
        require(!commitments[_commitment], "Commitment exists");
        commitments[_commitment] = true;

        // Handle PRIVX fee (0.3% total → 80% burn / 20% vault)
        uint256 fee = (denomination * FEE_BP) / BP_DENOMINATOR;
        uint256 burnAmt = (fee * 80) / 100;
        uint256 vaultAmt = fee - burnAmt;

        privxToken.safeTransferFrom(msg.sender, address(0xdead), burnAmt);
        privxToken.safeTransferFrom(msg.sender, address(miningVault), vaultAmt);

        // Transfer deposit token to shield
        token.safeTransferFrom(msg.sender, address(this), denomination);

        // Update incremental Merkle tree
        uint32 index = nextIndex;
        bytes32 node = _commitment;

        for (uint32 i = 0; i < LEVELS; i++) {
            if (index % 2 == 0) {
                filledSubtrees[i] = node;
                node = hasher.hash(uint256(node), uint256(zeros[i]));
            } else {
                node = hasher.hash(uint256(filledSubtrees[i]), uint256(node));
            }
            index /= 2;
        }

        nextIndex++;
        currentRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        roots[currentRootIndex] = node;

        emit Deposit(_commitment, nextIndex - 1, block.timestamp);
        emit FeeProcessed(fee, burnAmt, vaultAmt);
    }

    // ─────────────────────────────────────────────
    // Withdraw (with PLONK proof) + reward trigger
    // ─────────────────────────────────────────────
    function withdraw(
        uint256[24] calldata proof,
        uint256[3] calldata pubSignals,  // [root, nullifierHash, denomination]
        address payable recipient
    ) external nonReentrant {
        bytes32 root = bytes32(pubSignals[0]);
        bytes32 nullifierHash = bytes32(pubSignals[1]);
        uint256 denomCheck = pubSignals[2];

        require(isKnownRoot(root), "Invalid Merkle root");
        require(!nullifierHashes[nullifierHash], "Already withdrawn");
        require(denomCheck == denomination, "Denomination mismatch");

        // Verify zero-knowledge proof
        require(verifier.verifyProof(proof, pubSignals), "Invalid proof");

        // Mark nullifier as spent
        nullifierHashes[nullifierHash] = true;

        // Release deposit to recipient
        token.safeTransfer(recipient, denomination);

        // Trigger Proof-of-Privacy mining reward
        miningVault.mineReward(recipient, denomination, "withdraw");

        emit Withdrawal(recipient, nullifierHash);
    }

    // ─────────────────────────────────────────────
    // Utilities
    // ─────────────────────────────────────────────
    function isKnownRoot(bytes32 root) public view returns (bool) {
        for (uint32 i = 0; i < ROOT_HISTORY_SIZE; i++) {
            if (roots[i] == root) return true;
        }
        return false;
    }

    function getLastRoot() public view returns (bytes32) {
        return roots[currentRootIndex];
    }
}
