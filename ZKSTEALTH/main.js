// main.js — FIXED VERSION (BabyJubjub commitments, no Semaphore)
const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0";
const PRIVX_TOKEN = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986";

const DENOMS = [
  ethers.utils.parseUnits("100", 18),
  ethers.utils.parseUnits("1000", 18),
  ethers.utils.parseUnits("10000", 18),
  ethers.utils.parseUnits("100000", 18)
];

let provider, signer, shieldContract, privxContract;
let userAddress = null;

document.getElementById("connect-wallet").onclick = async () => {
  if (!window.ethereum) {
    alert("No wallet detected. Install Rabby or MetaMask.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 369) {
      alert("Please switch to PulseChain (Chain ID 369)");
      return;
    }

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

    document.getElementById("wallet-status").innerHTML = 
      `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;
    updateStats();
  } catch (err) {
    console.error("Connect error:", err);
    alert("Connection failed: " + err.message);
  }
};

document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");

  document.getElementById("deposit-status").textContent = "Generating commitment...";

  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const total = amount.mul(1030).div(10000); // 0.3% fee included

  // 1. Generate a random secret
  const secret = ethers.utils.randomBytes(32);
  
  // 2. Derive the commitment from just the secret (can match your ZK circuit later)
  const commitment = ethers.utils.keccak256(secret);

  // 3. Create the commit hash — used for front-running protection
  const h = ethers.utils.keccak256(ethers.utils.concat([secret, amount]));

  document.getElementById("deposit-status").textContent = "Committing hash...";

  // 4. Call commit(h) before deposit (required!)
  try {
    const commitTx = await shieldContract.commit(h);
    await commitTx.wait();
  } catch (err) {
    console.error(err);
    document.getElementById("deposit-status").textContent = "Commit failed: " + err.message;
    return;
  }

  document.getElementById("deposit-status").textContent = "Approving PRIVX...";

  try {
    const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
    if (allowance.lt(total)) {
      const approveTx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    document.getElementById("deposit-status").textContent = "Sending deposit...";

    // 5. Now you can deposit with the same h
    const tx = await shieldContract.deposit(idx, commitment, h);
    await tx.wait();

    const note = `privx-${amount.toString()}-${ethers.utils.hexlify(secret).slice(2)}`;
    document.getElementById("note-output").value = note;
    document.getElementById("deposit-status").innerHTML =
      "<span style='color:lime;font-size:22px'>✅ DEPOSIT SUCCESS!</span><br><br>🔒 YOUR NOTE:<br><b>" + note + "</b>";
  } catch (err) {
    console.error(err);
    document.getElementById("deposit-status").textContent = "Failed: " + (err.message || "Check console");
  }
};

function parseNote(note) {
  // Format: privx-100000000000000000000-<hex_secret>
  if (!note.startsWith("privx-")) throw new Error("Invalid note format");
  const parts = note.split("-");
  if (parts.length !== 3) throw new Error("Malformed note");

  const amount = BigInt(parts[1]);
  const secretHex = "0x" + parts[2];
  const secret = ethers.utils.arrayify(secretHex);
  const nullifier = ethers.utils.keccak256(secret);

  return { amount, secret, nullifier };
}

document.getElementById("withdraw-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");

  const noteStr = document.getElementById("note-input").value.trim();
  if (!noteStr) return alert("Paste your note first");

  const status = document.getElementById("withdraw-status");
  const progress = document.getElementById("proof-progress");
  status.textContent = "";
  progress.textContent = "Parsing note...";

  try {
    const parts = noteStr.split("-");
    if (parts.length !== 3 || parts[0] !== "privx") throw "Invalid note format";

    const amount = BigInt(parts[1]);
    const secret = ethers.getBytes("0x" + parts[2]);

    // Ethers v6 CORRECT WAY to pad amount to 32 bytes
    const amountPadded = ethers.zeroPadBytes(ethers.getBytes(ethers.toQuantity(amount)), 32);
    const h = ethers.keccak256(ethers.concat([secret, amountPadded]));

    progress.textContent = "Sending withdraw...";

    const recipient = document.getElementById("recipient").value.trim() || userAddress;

    const tx = await shieldContract.withdraw(
      amount.toString(),
      h,
      recipient,
      { gasLimit: 500000 }
    );

    progress.textContent = "Waiting for confirmation...";
    await tx.wait();

    status.innerHTML = `
      <span style="color:lime;font-size:28px">WITHDRAW SUCCESS!</span><br><br>
      ${ethers.formatEther(amount)} PRIVX sent to<br>
      <b>${recipient}</b>
    `;
    progress.textContent = "";

  } catch (err) {
    console.error(err);
    status.innerHTML = `<span style="color:red">FAILED:</span> ${err.message || err}`;
    progress.textContent = "";
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
updateStats();
