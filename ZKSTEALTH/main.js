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
  const total = amount.mul(1030).div(10000);

  // Force wait until circomlib is fully loaded
  for (let i = 0; i < 50; i++) {
    if (window.circomlib?.poseidon && window.circomlib?.babyJub) break;
    await new Promise(r => setTimeout(r, 100));
  }
  if (!window.circomlib?.poseidon) {
    return alert("Crypto library failed to load — hard refresh the page");
  }

  const privKey = circomlib.babyJub.genKeyPair().privKey;
  const pubKey = circomlib.babyJub.prv2pub(privKey);
  const commitment = circomlib.poseidon([privKey, pubKey[0], pubKey[1]]);

  document.getElementById("deposit-status").textContent = "Approving PRIVX...";

  try {
    const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
    if (allowance.lt(total)) {
      const atx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
      document.getElementById("deposit-status").textContent = "→ Confirm approval in Rabby";
      await atx.wait();
    }

    document.getElementById("deposit-status").textContent = "→ Confirm deposit in Rabby";

    const tx = await shieldContract.deposit(
      idx,
      commitment,   // circomlib returns uint256 automatically
      ethers.constants.HashZero
    );

    document.getElementById("deposit-status").textContent = "Waiting for block...";

    await tx.wait();

    const note = `privx-${amount.toString()}-${Array.from(privKey).map(b => b.toString(16).padStart(2,'0')).join('')}`;
    document.getElementById("note-output").value = note;
    document.getElementById("deposit-status").innerHTML = 
      '<span style="color:lime;font-size:20px">DEPOSIT SUCCESS!</span><br><br>YOUR NOTE (SAVE IT):<br><b>' + note + '</b>';

  } catch (e) {
    console.error(e);
    document.getElementById("deposit-status").innerHTML = 
      '<span style="color:red">FAILED:</span> ' + (e.message || e);
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
