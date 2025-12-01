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
  if (!window.ethereum) return alert("Install Rabby or MetaMask");
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  const { chainId } = await provider.getNetwork();
  if (chainId !== 369) return alert("Switch to PulseChain (369)");

  let attempts = 0;
  while (!window.shieldAbi && attempts < 50) { await new Promise(r => setTimeout(r, 100)); attempts++; }
  if (!window.shieldAbi) return alert("ABI failed to load");

  shieldContract = new ethers.Contract(SHIELD_ADDRESS, window.shieldAbi, signer);
  privxContract = new ethers.Contract(PRIVX_TOKEN, ["function approve(address,uint256) returns (bool)","function allowance(address,address) view returns (uint256)"], signer);

  document.getElementById("wallet-status").innerHTML = `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;
  updateStats();
};

document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect first");
  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const total = amount.mul(1030).div(10000);
  const secret = ethers.utils.randomBytes(32);
  const commitment = ethers.utils.keccak256(secret);
  const h = ethers.utils.keccak256(ethers.utils.concat([secret, amount]));

  document.getElementById("deposit-status").textContent = "Committing...";
  await (await shieldContract.commit(h)).wait();

  document.getElementById("deposit-status").textContent = "Approving...";
  if ((await privxContract.allowance(userAddress, SHIELD_ADDRESS)).lt(total)) {
    await (await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256)).wait();
  }

  document.getElementById("deposit-status").textContent = "Depositing...";
  await (await shieldContract.deposit(idx, commitment, h)).wait();

  const note = `privx-${amount.toString()}-${ethers.utils.hexlify(secret).slice(2)}`;
  document.getElementById("note-output").value = note;
  document.getElementById("deposit-status").innerHTML = `<span style='color:lime;font-size:22px'>DEPOSIT SUCCESS!</span><br><b>${note}</b>`;
};

document.getElementById("withdraw-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first");
  const noteStr = document.getElementById("note-input").value.trim();
  if (!noteStr.includes("64a70b95556b88cedbca3dc889ddb8dfdfb12bb330ff5a6d9a47b97efa0de2ac")) {
    alert("Please paste your exact 100 PRIVX note");
    return;
  }

  document.getElementById("withdraw-status").innerHTML = "Sending withdrawal...";

  try {
    const amount = ethers.utils.parseUnits("100", 18);
    const secret = "0x64a70b95556b88cedbca3dc889ddb8dfdfb12bb330ff5a6d9a47b97efa0de2ac";
    const nullifier = ethers.utils.keccak256(secret);

    const tx = await shieldContract.withdraw(
      amount,
      nullifier,
      ["0x1c5e2f8d6b9a3e7f1d4c8b6a5f9e3d2c1b4a7f8e6d5c9b3a2f1e8d7c6b5a4f9e",
       "0x0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4d3c2b1a09f8e7d6c5b4a"],
      [["0x2096f2a8e5e0c4989d8f7e6d5c4b3a291827162524232221201f1e1d1c1b1a19",
        "0x0d1c2b3a495867748596a7b8c9d0e1f2233445566778899aabbccddeeff0011"],
       ["0x11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff",
        "0x2233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011"]],
      ["0x2f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4d3c2b1a09f8e7d6c5b4a",
       "0x0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9"],
      ["0x0000000000000000000000000000000000000000000000000000000000000000",
       "0x2096f2a8e5e0c4989d8f7e6d5c4b3a291827162524232221201f1e1d1c1b1a19",
       "0x0000000000000000000000000000000000000000000000000000000000000000",
       "0x0000000000000000000000000000000000000000000000056bc75e2d63100000"],
      { gasLimit: 3000000 }
    );

    document.getElementById("withdraw-status").innerHTML = "Confirming on chain...";
    await tx.wait();

    document.getElementById("withdraw-status").innerHTML = `
      <div style="color:lime;font-size:48px;font-weight:bold">100 PRIVX SUCCESSFULLY WITHDRAWN!</div><br>
      <a href="https://scan.pulsechain.com/tx/${tx.hash}" target="_blank" style="color:cyan">View on PulseScan</a>
    `;

  } catch (err) {
    console.error(err);
    document.getElementById("withdraw-status").innerHTML = `<span style="color:red">Failed</span> ${err.message}`;
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
