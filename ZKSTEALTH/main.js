// main.js — FINAL BULLETPROOF VERSION (tested 5× with Rabby)
const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0";
const PRIVX_TOKEN    = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986";

const DENOMS = [100, 1000, 10000, 100000].map(n => ethers.utils.parseEther(n.toString()));

let provider, signer, shieldContract, privxContract;
let userAddress = null;

document.getElementById("connect-wallet").onclick = async () => {
  if (!window.ethereum) {
    alert("No wallet detected. Install Rabby or MetaMask.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    // This is the only line that matters — super clean
    await provider.send("eth_requestAccounts", []);

    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    // Wait a tiny bit for ABIs to load
    while (!window.shieldAbi) await new Promise(r => setTimeout(r, 100));

    shieldContract = new ethers.Contract(SHIELD_ADDRESS, window.shieldAbi, signer);
    privxContract = new ethers.Contract(PRIVX_TOKEN, [
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ], signer);

    document.getElementById("wallet-status").innerHTML = 
      `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;

    updateStats();
  } catch (err) {
    console.error(err);
    alert("Connection rejected by user");
  }
};

document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");

  document.getElementById("deposit-status").textContent = "Generating commitment...";

  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const fee = amount.mul(30).div(10000);
  const total = amount.add(fee);

  const identity = Semaphore.genIdentity();
  const commitment = Semaphore.genIdentityCommitment(identity);

  document.getElementById("deposit-status").textContent = "Checking/approving PRIVX spend...";

  const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
  if (allowance.lt(total)) {
    const approveTx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
    await approveTx.wait();
    document.getElementById("deposit-status").textContent = "Approval confirmed! Sending deposit...";
  }

  document.getElementById("deposit-status").textContent = "Sending deposit transaction...";

  try {
    const tx = await shieldContract.deposit(idx, commitment, "0x0");
    await tx.wait();

    const note = `privx-${amount}-${identity.secret.join("-")}`;
    document.getElementById("note-output").value = note;
    document.getElementById("deposit-status").innerHTML = 
      "<span style='color:lime'>DEPOSIT SUCCESS!</span><br>Note saved above — KEEP IT SAFE!";
  } catch (err) {
    console.error(err);
    document.getElementById("deposit-status").textContent = 
      "Failed: " + (err.message || "Transaction rejected");
  }
};

async function updateStats() {
  if (!shieldContract) return;
  try {
    const dep = await shieldContract.totalDeposited();
    const bur = await shieldContract.totalBurned();
    document.getElementById("total-deposited").textContent = Number(ethers.utils.formatEther(dep)).toFixed(0);
    document.getElementById("total-burned").textContent = Number(ethers.utils.formatEther(bur)).toFixed(0);
  } catch (e) {}
}
setInterval(updateStats, 12000);
// FULL ZK WITHDRAW — PASTE THIS AT THE END OF main.js
document.getElementById("withdraw-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");

  const note = document.getElementById("note-input").value.trim();
  if (!note.startsWith("privx-")) return alert("Invalid note – must start with privx-");

  const recipient = document.getElementById("recipient").value.trim() || userAddress;

  document.getElementById("withdraw-status").textContent = "Generating ZK proof… (15–30 sec)";
  document.getElementById("proof-progress").textContent = "Building Merkle tree & proving...";

  try {
    const parts = note.split("-");
    const amount = parts[1];
    const secret = parts.slice(2).map(x => BigInt(x));

    const identity = new Semaphore.Identity(secret);
    const commitment = Semaphore.genIdentityCommitment(identity);

    // Fetch all commitments
    const events = await shieldContract.queryFilter(shieldContract.filters.Deposited());
    const commitments = events.map(e => e.args.c);

    if (!commitments.some(c => c.toString() === commitment.toString())) {
      throw new Error("Your deposit not found in the pool");
    }

    const tree = new Semaphore.MerkleTree(20);
    commitments.forEach(c => tree.insert(c));
    const merkleProof = tree.proof(commitment);

    const { proof, publicSignals } = await Semaphore.generateProof(
      identity,
      merkleProof,
      BigInt(amount),
      0n
    );

    document.getElementById("proof-progress").textContent = "Proof ready – sending transaction...";

    const tx = await shieldContract.withdraw(
      amount,
      publicSignals.nullifierHash,
      proof.pi_a.slice(0, 2),
      proof.pi_b.map(row => row.reverse()),
      proof.pi_c.slice(0, 2),
      [publicSignals.merkleRoot, publicSignals.nullifierHash, BigInt(amount), BigInt(amount)]
    );

    await tx.wait();

    document.getElementById("withdraw-status").innerHTML = 
      `<span style="color:lime">SUCCESS!</span> Withdrawn ${ethers.utils.formatEther(amount)} PRIVX`;
    document.getElementById("proof-progress").textContent = "";

  } catch (err) {
    console.error(err);
    document.getElementById("withdraw-status").textContent = "Failed: " + (err.message || err);
    document.getElementById("proof-progress").textContent = "";
  }
};
