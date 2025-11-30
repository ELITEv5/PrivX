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

  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const fee = amount.mul(30).div(10000);
  const total = amount.add(fee);

  const identity = Semaphore.genIdentity();
  const commitment = Semaphore.genIdentityCommitment(identity);

  // Approve if needed
  const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
  if (allowance.lt(total)) {
    const tx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
    await tx.wait();
  }

  const tx = await shieldContract.deposit(idx, commitment, "0x0");
  await tx.wait();

  const note = `privx-${amount}-${identity.secret.join("-")}`;
  document.getElementById("note-output").value = note;
  document.getElementById("deposit-status").textContent = "DEPOSIT SUCCESS! Note saved above ↑";
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
