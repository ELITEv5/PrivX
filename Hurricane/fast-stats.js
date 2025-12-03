// fast-stats.js – PRIVX Hurricane Edition (No external APIs)
async function updateFastStats() {
  if (!window.web3 || !window.POOLS) return setTimeout(updateFastStats, 5000);

  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  let totalTVL = 0n;
  let totalDeposits = 0;

  statsContainer.innerHTML = ''; // Clear old stats

  for (const pool of window.POOLS) {
    try {
      const contract = new web3.eth.Contract([
        { "inputs": [], "name": "denomination", "outputs": [{"type": "uint256"}], "type": "function" },
        { "inputs": [], "name": "nextIndex", "outputs": [{"type": "uint32"}], "type": "function" }
      ], pool.contract);

      const [denomStr, deposits] = await Promise.all([
        contract.methods.denomination().call(),
        contract.methods.nextIndex().call()
      ]);

      const denom = BigInt(denomStr);
      const tvl = denom * BigInt(deposits);
      totalTVL += tvl;
      totalDeposits += Number(deposits);

      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <div class="stat-denomination">${pool.denomination} PRIVX</div>
        <div class="stat-info">
          <span class="stat-deposits">${deposits}</span> deposits
          <span class="stat-balance">· ${Number(tvl / 10n**18n).toLocaleString()} PRIVX</span>
        </div>
      `;
      statsContainer.appendChild(row);
    } catch (e) {
      console.log(`Stats failed for ${pool.denomination}:`, e);
    }
  }

  // Total row
  const totalRow = document.createElement('div');
  totalRow.className = 'stat-row total';
  totalRow.innerHTML = `
    <div class="stat-denomination">TOTAL</div>
    <div class="stat-info">
      <span class="stat-deposits">${totalDeposits}</span> deposits
      <span class="stat-balance">· ${Number(totalTVL / 10n**18n).toLocaleString()} PRIVX</span>
    </div>
  `;
  statsContainer.appendChild(totalRow);

  setTimeout(updateFastStats, 30000); // Refresh every 30s
}

// Start on load
updateFastStats();
