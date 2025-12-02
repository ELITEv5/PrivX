// app-complete.js – Tiny, beautiful, PRIVX-only
document.getElementById("depositBtn").onclick = async function () {
    if (!window.userAccount) return alert("Connect wallet");
    if (!window.selectedDenomination) return alert("Select amount");

    const pool = window.POOLS.find(p => p.denomination === window.selectedDenomination);
    const amount = pool.amount;

    try {
        const deposit = await generateDeposit();
        const commitment = deposit.commitment;

        const tx = await window.tornadoContract(pool.contract)
            .methods.deposit(commitment)
            .send({ from: window.userAccount, value: 0 });

        const note = `privx-hurricane-${window.selectedDenomination}-${tx.transactionHash.slice(0,10)}-${deposit.nullifierHash.slice(0,10)}`;
        
        document.getElementById("noteText").textContent = note;
        document.getElementById("depositNote").classList.remove("hidden");

        depositTracker.addDeposit({ note, amount: window.selectedDenomination, tx: tx.transactionHash });
        alert("Deposit successful! Save your note.");
    } catch (e) {
        console.error(e);
        alert("Deposit failed: " + e.message);
    }
};
