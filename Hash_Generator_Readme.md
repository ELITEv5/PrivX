🛡️ PrivX Hash Generator — Official Tool

Live tool: https://elitev5.github.io/PrivX/hash-generator/

Status: ✅ Verified and offline-capable

🔍 Overview

The PrivX Hash Generator allows users to create a Secret and matching Hash pair — the core privacy mechanism used in the PrivX Shield Relay.

All generation happens locally in your browser.
No data ever leaves your computer. You can even download the page and use it offline.

🧭 How It Works

Click “Generate Secret & Hash.”

A random 32-byte secret is created.

Its Keccak-256 hash (keccak256(abi.encode(secret))) is generated exactly as the PrivX smart contract expects.

Use the Hash for deposit.

Paste the Hash into the PrivX deposit field.

The deposit becomes locked and linked to your Secret (which remains private).

Withdraw within 7 days.

Use your Secret to withdraw funds to 1–3 wallet addresses.

A 0.3 % burn fee is applied automatically.

After 7 days (Reclaim phase).

If no withdrawal occurs, anyone can reclaim using the deposit Hash.

95 % is burned 🔥, 5 % is rewarded 💎 to the caller.

The Secret no longer grants access.

⚠️ Safe-Handling Guidelines

Your Secret = Your Access Key.
Anyone with the Secret can withdraw the deposit within 7 days. Treat it like a private key.

Never share your Secret publicly.
If sending funds to another person, share the Secret directly and securely with them.

The Hash is safe to share.
It’s used for deposits and for the public reclaim function after expiration.

Backup locally.
Use the “Save .txt” button to export a local backup of your Secret + Hash.

Offline verification.
You can test this tool without internet access — simply save the page and open it while offline.

📦 Files
File	Purpose
index.html	The offline hash generator
ethers.umd.min.js	Local copy of ethers.js for cryptographic functions
🧠 Smart-Contract Summary
Phase	Who Can Act	Time Limit	Outcome
Withdraw	Secret holder	7 days	Funds distributed (0.3 % burn)
Reclaim	Anyone	After 7 days	95 % burn, 5 % reward
🧩 Open-Source Verification

All logic is viewable in:

index.html

PrivX_Shield_Relay_V73.sol

You can verify that no network calls or external APIs are used.

🧬 Developer Notes

Built by ELITE TEAM6 under Elite Labs.

Licensed under MIT License.

Native to PulseChain; future expansions planned for Base.

🛰 Try it now: elitev5.github.io/PrivX/hash-generator/

🔒 Generate privately. Withdraw securely. Burn beautifully.
