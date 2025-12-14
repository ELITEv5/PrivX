// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   P R O O F  O F  P R I V A C Y   M I N I N G   V A U L T  V14   ║
 * ║──────────────────────────────────────────────────────────────────║
 * ║  • Supports up to 4 PrivX Hurricane Shields (100–100k denom)     ║
 * ║  • Single unified emission curve and self-healing reward logic   ║
 * ║  • Dynamic peak-based decay → rewards rise again when refilled   ║
 * ║  • 2% max reward per deposit, 5-min cooldown                     ║
 * ║  • Accepts refills anytime → vault breathes with the ecosystem   ║
 * ║  • Fully immutable after seal()                                  ║
 * ║                                                                  ║
 * ║   2025 Elite Team6 • MIT License                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Proof_of_Privacy_Mining_Vault_V14 {
    using SafeERC20 for IERC20;

    // ─────────────────────────────────────────────
    // Core immutables
    // ─────────────────────────────────────────────
    IERC20 public immutable privx;

    // ─────────────────────────────────────────────
    // One-time configuration (multi-shield support)
    // ─────────────────────────────────────────────
    mapping(address => bool) public authorizedShields;
    address[] public linkedShields;
    bool public isSealed;

    // ─────────────────────────────────────────────
    // Dynamic reward curve (self-healing)
    // ─────────────────────────────────────────────
    uint256 public peakBalance; // historical max balance

    // ─────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────
    uint256 public constant BASE_RATE_BP   = 100;      // 1.00 % when at peak
    uint256 public constant MAX_REWARD_BP  = 200;      // 2.00 % hard cap
    uint256 public constant BP_DENOMINATOR = 10_000;
    uint256 public constant COOLDOWN       = 5 minutes;
    uint8   public constant MAX_SHIELDS    = 4;        // safety cap

    // ─────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────
    uint256 public totalMined;
    mapping(address => uint256) public lastMineTime;

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────
    event RewardDistributed(address indexed user, uint256 reward, uint256 deposit, uint256 totalMined);
    event VaultFunded(address indexed funder, uint256 amount, uint256 newBalance);
    event ShieldLinked(address indexed shield);
    event VaultSealed(address indexed sealer);
    event NewPeakBalance(uint256 peakBalance);

    // ─────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────
    constructor(address _privx) {
        require(_privx != address(0), "PRIVX zero address");
        privx = IERC20(_privx);
    }

    // ─────────────────────────────────────────────
    // Link multiple shields (up to 4)
    // ─────────────────────────────────────────────
    function addShieldRelay(address _shield) external {
        require(!isSealed, "Vault sealed");
        require(_shield != address(0), "Zero address");
        require(!authorizedShields[_shield], "Already linked");
        require(linkedShields.length < MAX_SHIELDS, "Max shields reached");

        authorizedShields[_shield] = true;
        linkedShields.push(_shield);

        emit ShieldLinked(_shield);
    }

    // ─────────────────────────────────────────────
    // Seal forever (no new shields after this)
    // ─────────────────────────────────────────────
    function sealVault() external {
        require(!isSealed, "Already sealed");
        require(linkedShields.length > 0, "No shields linked");

        isSealed = true;

        // Initialize peak if vault already has funds
        uint256 current = privx.balanceOf(address(this));
        if (current > peakBalance) {
            peakBalance = current;
            emit NewPeakBalance(peakBalance);
        }

        emit VaultSealed(msg.sender);
    }

    // ─────────────────────────────────────────────
    // Funding (open forever)
    // ─────────────────────────────────────────────
    function topUp(uint256 amount) external {
        require(amount > 0, "Zero amount");
        privx.safeTransferFrom(msg.sender, address(this), amount);

        uint256 newBal = privx.balanceOf(address(this));

        // Auto-update peak → this is what makes the vault "breathe"
        if (newBal > peakBalance) {
            peakBalance = newBal;
            emit NewPeakBalance(peakBalance);
        }

        emit VaultFunded(msg.sender, amount, newBal);
    }

    // ─────────────────────────────────────────────
    // Core mining function (called by shields)
    // ─────────────────────────────────────────────
    function mineReward(address user, uint256 depositAmt, string memory /*action*/) external {
        require(isSealed, "Vault not sealed");
        require(authorizedShields[msg.sender], "Unauthorized shield");
        require(depositAmt > 0, "Zero deposit");
        require(block.timestamp >= lastMineTime[user] + COOLDOWN, "Cooldown active");

        lastMineTime[user] = block.timestamp;

        uint256 vaultBal = privx.balanceOf(address(this));
        if (vaultBal == 0) return;

        // Reference balance (prevents underflow before first funding)
        uint256 refBalance = peakBalance == 0 ? vaultBal : peakBalance;

        // Quadratic decay curve
        uint256 ratio = (vaultBal * 1e36) / refBalance;
        if (ratio > 1e36) ratio = 1e36;

        uint256 dynamicRateBp = (BASE_RATE_BP * ratio * ratio) / 1e72;
        uint256 reward = (depositAmt * dynamicRateBp) / BP_DENOMINATOR;

        // Hard caps
        uint256 maxReward = (depositAmt * MAX_REWARD_BP) / BP_DENOMINATOR;
        if (reward > maxReward) reward = maxReward;
        if (reward > vaultBal) reward = vaultBal;

        if (reward > 0) {
            totalMined += reward;
            privx.safeTransfer(user, reward);
            emit RewardDistributed(user, reward, depositAmt, totalMined);
        }
    }

    // ─────────────────────────────────────────────
    // View functions
    // ─────────────────────────────────────────────
    function vaultBalance() external view returns (uint256) {
        return privx.balanceOf(address(this));
    }

    function currentRateBp() external view returns (uint256) {
        uint256 vaultBal = privx.balanceOf(address(this));
        if (vaultBal == 0 || peakBalance == 0) return 0;

        uint256 ratio = (vaultBal * 1e36) / peakBalance;
        if (ratio > 1e36) ratio = 1e36;

        return (BASE_RATE_BP * ratio * ratio) / 1e72;
    }

    function timeUntilNextMine(address user) external view returns (uint256) {
        uint256 last = lastMineTime[user];
        if (last == 0) return 0;
        uint256 next = last + COOLDOWN;
        return next > block.timestamp ? next - block.timestamp : 0;
    }

    function getLinkedShields() external view returns (address[] memory) {
        return linkedShields;
    }
}
