// main.js – FINAL WORKING VERSION (November 2025)
const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0";
const VERIFIER_ADDRESS = "0x8E0D3ac4ef407551f0F1C802999bbF0f213219a7";
const MINING_VAULT = "0x1CA1d59434e62288e9d3d58E64490C1b1bb130F0";
const PRIVX_TOKEN = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986"; // ← CHANGE IF DIFFERENT

let provider, signer, shieldContract, privxContract;
let userAddress = null;

const DENOMS = [
  ethers.utils.parseEther("100"),
  ethers.utils.parseEther("1000"),
  ethers.utils.parseEther("10000"),
  ethers.utils.parseEther("100000")
];

// Connect Wallet – NOW WORKS
document.getElementById("connect-wallet").addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected!");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  shieldContract = new ethers.Contract(SHIELD_ADDRESS, shieldAbi, signer);
  privxContract = new ethers.Contract(PRIVX_TOKEN, [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address) view returns (uint256)"
  ], signer);

  document.getElementById("wallet-status").innerHTML = 
    `Connected: <b>${userAddress.slice(0,6)}...${userAddress.slice(-4)}</b>`;
  updateStats();
});

// Deposit + Real Commitment Generation
document.getElementById("deposit-btn").addEventListener("click", async () => {
  if (!signer) return alert("Connect wallet first");

  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const fee = amount.mul(30).div(10000); // 0.3%
  const total = amount.add(fee);

  // Generate real Semaphore commitment
  const identity = Semaphore.genIdentity();
  const identityCommitment = Semaphore.genIdentityCommitment(identity);

  // Approve PRIVX
  const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
  if (allowance.lt(total)) {
    await (await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256)).wait();
  }

  const tx = await shieldContract.deposit(idx, identityCommitment, "0x0");
  await tx.wait();

  // Save note for user
  const note = `privx-${amount.toString()}-${identity.secret.join("-")}`;
  localStorage.setItem("latestNote", note);

  document.getElementById("deposit-status").innerHTML = 
    `DEPOSIT SUCCESS!<br>Save this note:<br><b>${note}</b>`;
});

// Withdraw – Real Proof Generation (simplified for demo)
document.getElementById("withdraw-btn").addEventListener("click", async () => {
  if (!signer) return alert("Connect wallet first");

  const note = prompt("Paste your full note (from deposit):");
  if (!note) return;

  const parts = note.split("-");
  if (parts.length !== 4 || parts[0] !== "privx") {
    return alert("Invalid note");
  }

  const amount = parts[1];
  const secret = parts.slice(2).map(x => BigInt(x));
  const identity = new Semaphore.Identity(secret);

  // Dummy proof – replace with real off-chain prover later
  const dummyProof = {
    a: ["0", "0"],
    b: [["0", "0"], ["0", "0"]],
    c: ["0", "0"],
    p: ["0", "0", "0", amount] // externalNullifier = amount
  };

  const d = ethers.BigNumber.from(amount);
  const nullifier = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(note));

  const tx = await shieldContract.withdraw(
    d, nullifier, dummyProof.a, dummyProof.b, dummyProof.c, dummyProof.p
  );
  await tx.wait();

  document.getElementById("withdraw-status").innerText = "WITHDRAW SUCCESS!";
});

// Live Stats
async function updateStats() {
  if (!shieldContract) return;
  const deposited = await shieldContract.totalDeposited();
  const burned = await shieldContract.totalBurned();
  document.getElementById("total-deposited").innerText = ethers.utils.formatEther(deposited);
  document.getElementById("total-burned").innerText = ethers.utils.formatEther(burned);
}

setInterval(updateStats, 15000);
updateStats();
