// fast-stats.js – PRIVX Hurricane Edition
async function updateFastStats() {
  if (!window.web3 || !window.POOLS) return;

  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  let totalTVL = 0;
  let totalDeposits = 0;

  for (let pool of window.POOLS) {
    try {
      const contract = new window.web3.eth.Contract([
        { "constant": true, "inputs": [], "name": "getDenomination", "outputs": [{"name": "", "type": "uint256"}], "type": "function" },
        { "constant": true, "inputs": [], "name": "nextIndex", "outputs": [{"name": "", "type": "uint32"}], "type": "function" }
      ], pool.contract);

      const denomination = await contract.methods.getDenomination().call();
      const deposits = await contract.methods.nextIndex().call();

      const tvl = Number(denomination) * deposits;
      totalTVL += tvl;
      totalDeposits += Number(deposits);

      // Update row for this pool
      const row = document.querySelector(`[data-pool="${pool.denomination}"]`) || createStatRow(pool.denomination);
      row.querySelector('.stat-deposits').textContent = deposits;
      row.querySelector('.stat-balance').textContent = web3.utils.fromWei(tvl.toString(), 'ether') + ' PRIVX';
    } catch (e) {
      console.log(`Stats failed for ${pool.denomination}:`, e);
    }
  }

  // Total row
  const totalRow = document.querySelector('.stat-row.total');
  if (totalRow) {
    totalRow.querySelector('.stat-deposits').textContent = totalDeposits;
    totalRow.querySelector('.stat-balance').textContent = web3.utils.fromWei(totalTVL.toString(), 'ether') + ' PRIVX';
  }

  setTimeout(updateFastStats, 30000); // Refresh every 30s
}

function createStatRow(denom) {
  const row = document.createElement('div');
  row.className = 'stat-row';
  row.dataset.pool = denom;
  row.innerHTML = `
    <div class="stat-denomination">${denom} PRIVX</div>
    <div class="stat-info">
      <span class="stat-deposits">Loading...</span>
      <span class="stat-balance">-</span>
    </div>
  `;
  document.getElementById('statsContainer').appendChild(row);
  return row;
}

// Start on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateFastStats);
} else {
  updateFastStats();
}
