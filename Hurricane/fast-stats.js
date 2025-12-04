// fast-stats.js – Calls Your PRIVX Pools (No 404s)
async function updateFastStats() {
  if (!window.web3 || !window.POOLS) return;

  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  statsContainer.innerHTML = '';

  for (const pool of window.POOLS) {
    try {
      const contract = new web3.eth.Contract([
        { "inputs": [], "name": "denomination", "outputs": [{"type": "uint256"}], "type": "function" },
        { "inputs": [], "name": "nextIndex", "outputs": [{"type": "uint32"}], "type": "function" }
      ], pool.contract);

      const [denomination, deposits] = await Promise.all([
        contract.methods.denomination().call(),
        contract.methods.nextIndex().call()
      ]);

      const tvl = (BigInt(denomination) * BigInt(deposits)) / BigInt(10**18);
      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <div class="stat-denomination">${pool.denomination} PRIVX</div>
        <div class="stat-info">
          <span class="stat-deposits">${deposits}</span> deposits · <span class="stat-balance">${tvl.toString()}</span> PRIVX
        </div>
      `;
      statsContainer.appendChild(row);
    } catch (e) {
      console.log('Stats failed for ' + pool.denomination + ':', e);
    }
  }

  setTimeout(updateFastStats, 30000); // Refresh every 30s
}

// Start on load
updateFastStats();
