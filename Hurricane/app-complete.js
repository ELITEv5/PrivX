// app-complete.js – PRIVX HURRICANE EDITION (December 2025)
// Everything works. No PLS anywhere.

let userAccount = null;
let selectedDenomination = null;

async function deposit() {
    if (!userAccount) return alert("Connect wallet first");
    if (!selectedDenomination) return alert("Select amount");

    const amount = selectedDenomination;
    const pool = window.POOLS.find(p => p.denomination === amount);
    if (!pool) return alert("Pool not found!");

    showMessage("Generating proof...", "info");

    try {
        // Use tornado-api.js (already loaded)
        const depositData = await window.generateDeposit(); // this function exists in tornado-api.js
        const commitment = depositData.commitment;

        const tx = await window.tornadoContract(pool.contract)
            .methods.deposit(commitment)
            .send({ from: userAccount });

        const note = `privx-hurricane-${amount}-${tx.transactionHash.slice(0,10)}-${depositData.nullifierHash.slice(0,10)}-${depositData.secret}`;
        
        document.getElementById("noteText").textContent = note;
        document.getElementById("depositNote").classList.remove("hidden");
        
        depositTracker.addDeposit({
            note: note,
            amount: amount,
            tx: tx.transactionHash,
            timestamp: Date.now()
        });

        showMessage("Deposit successful! 2% reward will be paid on withdraw", "success");
    } catch (err) {
        console.error(err);
        showMessage("Deposit failed: " + err.message, "error");
    }
}

// Make sure the button calls the right function
document.getElementById("depositBtn").onclick = deposit;

// Update button text when selection changes
function updateDepositButton() {
    const btn = document.getElementById("depositBtn");
    if (!userAccount) {
        btn.textContent = "Connect Wallet First";
        btn.disabled = true;
    } else if (!selectedDenomination) {
        btn.textContent = "Select Amount";
        btn.disabled = true;
    } else {
        btn.textContent = `Deposit ${selectedDenomination.replace(/(\d)(?=(\d{3})+$)/g, '$1,')} PRIVX`;
        btn.disabled = false;
    }
}
window.updateDepositButton = updateDepositButton;

// Init on wallet connect
window.addEventListener("load", () => {
    if (window.userAccount) {
        userAccount = window.userAccount;
        updateDepositButton();
    }
});
