// app-complete.js – PRIVX Hurricane (with auto-approval)
document.getElementById("depositBtn").onclick = async function () {
    if (!window.userAccount) return alert("Connect wallet first");
    if (!window.selectedDenomination) return alert("Select a denomination");

    const pool = window.POOLS.find(p => p.denomination === window.selectedDenomination);
    if (!pool) return alert("Shield not found for this denomination.");

    const amount = pool.amount;
    const hurricaneAddress = pool.contract;

    try {
        const token = new web3.eth.Contract(PRIVX_ABI, PRIVX_TOKEN);

        // 1️⃣ Check allowance
        const allowance = await token.methods
            .allowance(window.userAccount, hurricaneAddress)
            .call();

        if (BigInt(allowance) < BigInt(amount)) {
            const confirm = confirm(`Approve ${window.selectedDenomination} PRIVX for this Hurricane Shield?`);
            if (!confirm) return;

            // 2️⃣ Request approval
            await token.methods
                .approve(hurricaneAddress, amount)
                .send({ from: window.userAccount });

            alert("Approval confirmed. Proceeding with deposit...");
        }

        // 3️⃣ Generate deposit note and commitment
        const deposit = await generateDeposit();
        const commitment = deposit.commitment;

        // 4️⃣ Send deposit transaction
        const tx = await window.tornadoContract(hurricaneAddress)
            .methods.deposit(commitment)
            .send({ from: window.userAccount });

        // 5️⃣ Build and show private note
        const note = `privx-hurricane-${window.selectedDenomination}-${tx.transactionHash.slice(0,10)}-${deposit.nullifierHash.slice(0,10)}`;
        document.getElementById("noteText").textContent = note;
        document.getElementById("depositNote").classList.remove("hidden");

        depositTracker.addDeposit({
            note,
            amount: window.selectedDenomination,
            tx: tx.transactionHash
        });

        alert("✅ Deposit successful! Save your private note securely.");
    } catch (e) {
        console.error(e);
        alert("Deposit failed: " + (e?.message || e));
    }
};
