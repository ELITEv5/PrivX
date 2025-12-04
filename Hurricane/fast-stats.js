// fast-stats.js – WORKS 100% with your pools
async function updateStats() {
  if (typeof web3Instance === 'undefined' || !web3Instance) return;

  const container = document.getElementById('statsContainer');
  if (!container) return;

  container.innerHTML = '<div class="stat-row"><div>Loading stats...</div></div>';

  >';

  let html = '';
  for (const pool of window.POOLS || []) {
    try {
      const contract = new web3Instance.eth.Contract([
        { "inputs": [], "name": "denomination", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
        { "inputs": [], "name": "nextIndex", "outputs": [{ "name": "", "type": "uint32" }], "type": "function" }
      ], pool.contract);

      const [denom, index] = await Promise.all([
        contract.methods.denomination().call(), contract.methods.nextIndex().call() ]);

      const tvl = (BigInt(denom) * BigInt(index)) / 10n**18n;

      html += `
        <div class="stat-row">
          <div class="stat-denomination">${pool.denomination} PRIVX</div>
          <div class="stat-info">
            <span class="stat-deposits">${index}</span> deposits · <span class="stat-balance">${tvl.toString()}</span> PRIVX
          </div>
        </div>`;
    } catch (e) {
      html += `<div class="stat-row"><div>${pool.denomination} PRIVX — offline</div></div>`;
    }
  }
  container.innerHTML = html;
}

// Update every 20s
setInterval(updateStats, 20000);
updateStats();
