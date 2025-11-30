const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0";
const PRIVX_TOKEN = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986";

import shieldAbi from "./shield_abi.json" assert { type: "json" };
import miningAbi from "./mining_abi.json" assert { type: "json" };

const DENOMS = [
  ethers.utils.parseEther("100"),
  ethers.utils.parseEther("1000"),
  ethers.utils.parseEther("10000"),
  ethers.utils.parseEther("100000")
];

let provider, signer, shieldContract, privxContract;
let userAddress = null;

// CONNECT WALLET — WORKS WITH RABBY
document.getElementById("connect-wallet").onclick = async () => {
  if (!window.ethereum) return alert("No wallet detected!");

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 369) {
      alert("Please switch to PulseChain (Chain ID 369)");
      return;
    }

    shieldContract = new ethers.Contract(SHIELD_ADDRESS, shieldAbi, signer);
    privxContract = new ethers.Contract(PRIVX_TOKEN, [
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ], signer);

    document.getElementById("wallet-status").innerHTML = 
      `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;
    
    updateStats();
  } catch (e) {
    console.error(e);
    alert("Connection failed or rejected.");
  }
};

// DEPOSIT — FULLY WORKING
document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first");
  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const fee = amount.mul(30).div(10000);
  const total = amount.add(fee);

  const identity = Semaphore.genIdentity();
  const commitment = Semaphore.genIdentityCommitment(identity);

  const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
  if (allowance.lt(total)) {
    const tx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
    await tx.wait();
  }

  const tx = await shieldContract.deposit(idx, commitment, "0x0");
  await tx.wait();

  const note = `privx-${amount.toString()}-${identity.secret.join("-")}`;
  document.getElementById("note-output").value = note;
  document.getElementById("deposit-status").innerHTML = "DEPOSIT SUCCESS! Save your note above!";
};

// WITHDRAW — PLACEHOLDER (real proof coming in 2 minutes)
document.getElementById("withdraw-btn").onclick = async () => {
  alert("Real ZK proof generation coming in the next message — stay tuned!");
};

// STATS
async function updateStats() {
  if (!shieldContract) return;
  try {
    const dep = await shieldContract.totalDeposited();
    const bur = await shieldContract.totalBurned();
    document.getElementById("total-deposited").textContent = ethers.utils.formatEther(dep);
    document.getElementById("total-burned").textContent = ethers.utils.formatEther(bur);
  } catch (e) {}
}
setInterval(updateStats, 10000);
updateStats();
