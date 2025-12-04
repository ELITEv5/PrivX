window.deposit = async function() {
  if (!userAddress || !selectedAmount) return alert("Connect + select amount")

  const pool = window.POOLS.find(p => p.denomination === selectedAmount)
  const { commitment, note } = window.generateDeposit()

  const contract = new web3Instance.eth.Contract([
    { "inputs": [{ "name": "_commitment", "type": "bytes32" }], "name": "deposit", "outputs": [], "type": "function" }
  ], pool.contract)

  await contract.methods.deposit(commitment).send({ from: userAddress })
  document.getElementById('noteText').textContent = note
  document.getElementById('depositNote').classList.remove('hidden')
  alert("DEPOSIT SUCCESS — 2% REWARD ON WITHDRAW")
}
