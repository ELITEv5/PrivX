// fast-stats.js – works on any GitHub Pages site
async function updateFastStats() {
  if (!window.web3 || !window.POOLS || !window.userAccount) {
    setTimeout(updateFastStats, 10000);
    return;
  }

  let totalTVL = 0n;
  let totalDeposits = 0;

  for (const pool of window.POOLS) {
    try {
      const abi = [{"inputs":[],"name":"denomination","outputs":[{"type":"uint256"}],"type":"function"},{"inputs":[],"name":"nextLeafIdx","outputs":[{"type":"uint32"}],"type":"function"}];
      const contract = new web3.eth.Contract(abi, pool.contract);

      const [denom, deposits] = await Promise.all([
        contract.methods.denomination().call(),
        contract.methods.nextLeafIdx().call()
      ]);

      const tvl = BigInt(denom) * BigInt(deposits);
      totalTVL += tvl;
      totalDeposits += Number(deposits);

      // Update UI row
      let row = document.querySelector(`[data-denom="${pool.denomination}"]`);
      if (!row) {
        row = document.createElement('div');
        row.className = 'stat-row';
        row.dataset.denom = pool.denomination;
        row.innerHTML = `<div>${pool.denomination} PRIVX</div><div><span class="deposits">${deposits}</span> deposits · <span class="tvl">0</span> PRIVX</span></div>`;
        document.getElementById('statsContainer')?.appendChild(row);
      }
      row.querySelector('.deposits').textContent = deposits;
      row.querySelector('.tvl').textContent = Number(tvl / 1_000_000_000_000_000_000n).toLocaleString();
    } catch (e) {}
  }

  // Total row
  const totalEl = document.getElementById('totalTVL');
  if (totalEl) totalEl.textContent = Number(totalTVL / 1_000_000_000_000_000_000n).toLocaleString();

  setTimeout(updateFastStats, 30000);
}

updateFastStats();
