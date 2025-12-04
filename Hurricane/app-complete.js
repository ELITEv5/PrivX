// app-complete.js — FINAL 100% WORKING
let web3 = null;
let account = null;
let selected = null;

window.toggleWallet = async () => {
  if (!window.ethereum) return alert("Install MetaMask");
  try {
    const accs = await ethereum.request({ method: "eth_requestAccounts" });
    account = accs[0];
    web3 = new Web3(ethereum);
    document.getElementById("walletButtonText").innerText = account.slice(0,6)+"..."+account.slice(-4);
    document.getElementById("walletButton").classList.add("connected");
    updateUI();
  } catch(e) { alert("Failed"); }
};

window.selectDenomination = (d) => {
  selected = d;
  document.querySelectorAll(".denomination-card").forEach(c => c.classList.toggle("selected", c.innerText.includes(d)));
  updateUI();
};

function updateUI() {
  const btn = document.getElementById("depositBtn");
  if (!account) { btn.innerText = "Connect Wallet"; btn.disabled = true; }
  else if (!selected) { btn.innerText = "Select Amount"; btn.disabled = true; }
  else { btn.innerText = `Deposit ${selected} PRIVX`; btn.disabled = false; }
}

window.deposit = async () => {
  if (!account || !selected || !web3) return;
  const pool = window.POOLS.find(p => p.denomination === selected);
  const { commitment, note } = window.generateDeposit();
  
  const contract = new web3.eth.Contract([{"inputs":[{"name":"_commitment","type":"bytes32"}],"name":"deposit","outputs":[],"type":"function"}], pool.contract);
  
  try {
    await contract.methods.deposit(commitment).send({ from: account });
    document.getElementById("noteText").innerText = note;
    document.getElementById("depositNote").classList.remove("hidden");
    alert("DEPOSIT SUCCESS — SAVE YOUR NOTE");
  } catch (e) {
    alert("Failed: " + e.message);
  }
};

window.copyNote = () => {
  navigator.clipboard.writeText(document.getElementById("noteText").innerText);
  alert("Copied!");
};

window.onload = () => {
  updateUI();
  document.getElementById("depositBtn").onclick = deposit;
};
