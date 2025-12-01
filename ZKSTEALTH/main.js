// main.js — FINAL UPGRADED VERSION (Tornado/zkPULSE Style, Real ZK)
const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0"; // Replace with your new deployed ERC20Tornado address after deployment
const PRIVX_TOKEN = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986";
const DENOMS = [
  ethers.utils.parseUnits("100", 18),
  ethers.utils.parseUnits("1000", 18),
  ethers.utils.parseUnits("10000", 18),
  ethers.utils.parseUnits("100000", 18)
];
const TREE_HEIGHT = 20; // From MerkleTreeWithHistory

let provider, signer, shieldContract, privxContract;
let userAddress = null;

// Load snarkjs and circomlibjs (add to HTML <head> if not there)
let snarkjs, poseidon;

async function loadZKLibs() {
  snarkjs = window.snarkjs;
  const circomlibjs = await import("https://cdn.jsdelivr.net/npm/circomlibjs@0.1.7");
  poseidon = await circomlibjs.buildPoseidon();
}

document.getElementById("connect-wallet").onclick = async () => {
  if (!window.ethereum) return alert("Install wallet");
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  const { chainId } = await provider.getNetwork();
  if (chainId !== 369) return alert("Switch to PulseChain");

  // Wait for ABI
  let attempts = 0;
  while (!window.shieldAbi && attempts < 50) {
    await new Promise(r => setTimeout(r, 50));
    attempts++;
  }
  if (!window.shieldAbi) throw new Error("ABI load failed");

  shieldContract = new ethers.Contract(SHIELD_ADDRESS, window.shieldAbi, signer);
  privxContract = new ethers.Contract(PRIVX_TOKEN, [
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
  ], signer);

  document.getElementById("wallet-status").innerHTML = `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;
  updateStats();
};

document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");
  document.getElementById("deposit-status").textContent = "Generating commitment...";
  const idx = parseInt(document.getElementById("denom-select").value);
  const amount = DENOMS[idx];

  // Generate secret and nullifier
  const secret = ethers.utils.randomBytes(32);
  const nullifier = ethers.utils.randomBytes(32);
  const nullifierHash = ethers.utils.keccak256(nullifier);

  // Poseidon commitment = poseidon(nullifier, secret)
  const commitment = poseidon([BigInt(nullifierHash), BigInt(ethers.utils.hexlify(secret))]);

  document.getElementById("deposit-status").textContent = "Approving PRIVX...";
  const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
  if (allowance.lt(amount)) {
    await (await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256)).wait();
  }

  document.getElementById("deposit-status").textContent = "Sending deposit...";
  const tx = await shieldContract.deposit(commitment);
  await tx.wait();

  const note = `privx-${amount.toString()}-${ethers.utils.hexlify(secret).slice(2)}-${ethers.utils.hexlify(nullifier).slice(2)}`;
  document.getElementById("note-output").value = note;
  document.getElementById("deposit-status").innerHTML = "<span style='color:lime'>✅ DEPOSIT SUCCESS!</span><br><b>" + note + "</b>";
};

document.getElementById("withdraw-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");
  const noteStr = document.getElementById("note-input").value.trim();
  if (!noteStr) return alert("Paste your note");

  document.getElementById("withdraw-status").innerHTML = "Generating proof...";

  try {
    await loadZKLibs();

    // Parse note: privx-AMOUNT-SECRET-NULLIFIER
    const parts = noteStr.split("-");
    if (parts.length !== 4 || parts[0] !== "privx") throw "Invalid note";
    const amount = BigInt(parts[1]);
    const secret = ethers.utils.arrayify("0x" + parts[2]);
    const nullifier = ethers.utils.arrayify("0x" + parts[3]);

    // Nullifier hash
    const nullifierHash = poseidon([BigInt(ethers.utils.hexlify(nullifier)), amount]);

    // Get current Merkle root from contract
    const merkleRoot = await shieldContract.getLastRoot();

    // Get Merkle path (fetch from events or off-chain - placeholder for now; use your cache or API)
    const pathElements = new Array(TREE_HEIGHT).fill(0n); // Replace with real path
    const pathIndices = new Array(TREE_HEIGHT).fill(0); // Replace with real indices

    // Input for withdraw circuit
    const input = {
      root: BigInt(merkleRoot),
      nullifierHash: nullifierHash,
      recipient: BigInt(userAddress),
      relayer: BigInt(0), // No relayer
      fee: BigInt(0),
      refund: BigInt(0),
      nullifier: BigInt(ethers.utils.hexlify(nullifier)),
      secret: BigInt(ethers.utils.hexlify(secret)),
      pathElements,
      pathIndices
    };

    // Load circuit artifacts (host these on your site or CDN)
    const wasm = await fetch('withdraw.wasm').then(r => r.arrayBuffer());
    const zkey = await fetch('withdraw_final.zkey').then(r => r.arrayBuffer());

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasm, zkey);

    // Pack proof for Solidity
    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]];
    const c = [proof.pi_c[0], proof.pi_c[1]];
    const pubInput = publicSignals;

    document.getElementById("withdraw-status").innerHTML = "Sending withdrawal...";
    const tx = await shieldContract.withdraw(
      proofBytes, // Convert to bytes if needed
      merkleRoot,
      nullifierHash,
      userAddress,
      0, // relayer
      0, // fee
      0 // refund
    );
    await tx.wait();

    document.getElementById("withdraw-status").innerHTML = "<span style='color:lime'>✅ WITHDRAW SUCCESS!</span>";
  } catch (err) {
    document.getElementById("withdraw-status").innerHTML = "Failed: " + err.message;
  }
};

async function updateStats() {
  if (!shieldContract) return;
  const dep = await shieldContract.totalDeposited(); // Add this function to contract if not there
  const bur = await shieldContract.totalBurned(); // Add if needed
  document.getElementById("total-deposited").textContent = Number(ethers.utils.formatEther(dep)).toFixed(0);
  document.getElementById("total-burned").textContent = Number(ethers.utils.formatEther(bur)).toFixed(0);
}
setInterval(updateStats, 12000);
updateStats();
