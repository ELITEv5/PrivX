// app-complete.js – Self-Contained Deposit/Withdraw (No Imports Needed)
let web3, userAccount, selectedDenomination;

window.toggleWallet = async function() {
  if (!window.ethereum) return alert('Install MetaMask/Rabby');
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    web3 = new Web3(window.ethereum);
    window.web3 = web3;
    window.userAccount = userAccount;
    document.getElementById('walletButtonText').textContent = userAccount.slice(0,6) + '...' + userAccount.slice(-4);
    document.getElementById('walletButton').classList.add('connected');
    alert('Connected to PulseChain! Switch to PulseChain if prompted.');
    if (typeof updateDepositButton === 'function') updateDepositButton();
  } catch (e) {
    alert('Connection failed: ' + e.message);
  }
};

// Deposit function (uses your config — no ZK yet, just commitment)
window.deposit = async function() {
  if (!userAccount) return alert('Connect wallet first');
  if (!selectedDenomination) return alert('Select an amount');

  const pool = window.POOLS.find(p => p.denomination === selectedDenomination);
  if (!pool) return alert('Pool not found');

  try {
    // Simple commitment (real Poseidon later)
    const nullifier = Math.floor(Math.random() * 1e18);
    const secret = Math.floor(Math.random() * 1e18);
    const commitment = `0x${(nullifier * secret).toString(16).padStart(64, '0')}`;

    const contract = new web3.eth.Contract([
      { "inputs": [{"name": "_commitment", "type": "bytes32"}], "name": "deposit", "outputs": [], "type": "function" },
      { "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function" }
    ], pool.contract);

    // Approve PRIVX spending (if needed)
    const privxContract = new web3.eth.Contract([
      { "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function" }
    ], window.PRIVX_TOKEN);

    const amount = web3.utils.toWei(pool.denomination, 'ether');
    await privxContract.methods.approve(pool.contract, amount).send({ from: userAccount });

    // Deposit
    await contract.methods.deposit(commitment).send({ from: userAccount });

    // Save note
    const note = `privx-hurricane-${selectedDenomination}-${commitment.slice(-12)}-${nullifier.toString(16).slice(-12)}`;
    document.getElementById('noteText').textContent = note;
    document.getElementById('depositNote').classList.remove('hidden');
    alert('Deposit successful! Save your note — 2% reward on withdraw.');
  } catch (e) {
    alert('Deposit failed: ' + e.message);
  }
};

// Withdraw stub (real proof later)
window.withdraw = async function() {
  if (!userAccount) return alert('Connect wallet first');
  const note = document.getElementById('withdrawNote').value;
  if (!note) return alert('Paste your note');

  try {
    // Stub — real proof generation here
    alert('Withdraw stub — real ZK proof coming soon! Check console for note parsing.');
    console.log('Parsed note:', note);
  } catch (e) {
    alert('Withdraw failed: ' + e.message);
  }
};

// Update button
window.updateDepositButton = function() {
  const btn = document.getElementById('depositBtn');
  if (!userAccount) {
    btn.textContent = 'Connect Wallet First';
    btn.disabled = true;
  } else if (!selectedDenomination) {
    btn.textContent = 'Select Amount';
    btn.disabled = true;
  } else {
    btn.textContent = `Deposit ${selectedDenomination} PRIVX`;
    btn.disabled = false;
  }
};

// Select denomination
window.selectDenomination = function(denom) {
  selectedDenomination = denom;
  window.selectedDenomination = denom;
  document.querySelectorAll('.denomination-card').forEach(card => {
    card.classList.remove('selected');
    if (card.textContent.includes(denom)) card.classList.add('selected');
  });
  updateDepositButton();
};

// Copy note
window.copyNote = function() {
  const note = document.getElementById('noteText').textContent;
  navigator.clipboard.writeText(note);
  alert('Note copied!');
};

// Auto-init on load
window.addEventListener('load', () => {
  updateDepositButton();
  document.getElementById('depositBtn').onclick = deposit;
  document.getElementById('withdrawBtn').onclick = withdraw;
});
