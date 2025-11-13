# 🛡️ PrivX Protect Relay Node

**PrivX Protect** is a non-custodial, privacy-preserving transaction relay for the [PrivX Shield Relay](https://privx.io).  
It allows users to submit **signed transactions directly** to a private PulseChain node — without ever exposing them to the public mempool — providing **front-run protection** and **withdrawal privacy** for the PrivX ecosystem.

---

## 🚀 Overview

### What It Does
The **PrivX Protect Relay Node** acts as a **secure intermediary** between the user’s wallet and the blockchain:

User Wallet / DApp → PrivX Protect Relay → PulseChain Node → Blockchain


It receives signed raw transactions (never user keys), relays them directly to your PulseChain node via `eth_sendRawTransaction`, and returns the transaction hash — **privately, instantly, safely**.

---

## ✨ Key Features

| Feature | Description |
|----------|-------------|
| 🔒 **Front-Run Protection** | Bypasses public mempools to prevent sandwich and copy-paste attacks. |
| 🧠 **Stateless Relay** | Never stores transactions or secrets — forwards and forgets. |
| ⚙️ **PrivX Native** | Works seamlessly with the [PrivX Shield Relay V8](https://scan.pulsechain.com/address/0x9ef6144a2f544A28e030e69a79c5B527c8B48f2e). |
| 🪶 **Lightweight** | 80 lines of Node.js. Deployable as a Docker container or serverless function. |
| 🧱 **Compliant by Design** | Transparent, open-source, no custody or anonymization layer. |
| 🌐 **QuickNode Compatible** | Runs perfectly on private QuickNode PulseChain endpoints. |

---

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-org/privx-protect-relay.git
cd privx-protect-relay
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Create .env
bash
Copy code
PULSE_RPC=https://your-private-pulsechain-endpoint.quicknode.com/abc123/
PORT=443
4️⃣ Run the relay
bash
Copy code
node relay.js
You’ll see:

arduino
Copy code
🚀 PrivX Protect Relay Node running on port 443
Test it:

bash
Copy code
curl -X POST https://localhost:443/submit \
  -H "Content-Type: application/json" \
  -d '{"rawTx":"0x..."}'
🧩 Frontend Integration
In your DApp, replace the standard signer.sendTransaction() call with:

js
Copy code
const rawTx = await signer.signTransaction(txRequest);

const res = await fetch("https://relay.privx.io/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rawTx }),
});
const data = await res.json();
console.log("TX Hash:", data.txHash);
This preserves complete compatibility with your existing PrivX frontend logic.

🔧 Environment Configuration
Variable	Description
PULSE_RPC	Your private PulseChain node (QuickNode or self-hosted).
PORT	Port to expose the relay on (default 443).

🧱 Docker Deployment
Build and run in one command:

bash
Copy code
docker build -t privx-protect-relay .
docker run -d -p 443:443 --env-file .env privx-protect-relay
🛡️ Security Practices
Never log or store rawTx values.

Run over HTTPS only.

Whitelist your DApp domain and developer IPs.

Rate-limit requests (built-in 50/min default).

No custody: the relay never touches funds or secrets.

⚖️ Compliance Statement
PrivX Protect Relay Node operates as transparent network infrastructure, not a custodial or anonymizing service.
It simply relays signed transactions via eth_sendRawTransaction.
This structure complies with existing DeFi and infrastructure regulations while improving transaction privacy and integrity.

🧩 Directory Structure
bash
Copy code
privx-protect-relay/
├── relay.js
├── package.json
├── .env
└── Dockerfile
🧠 Credits
Project: PrivX Shield Network

Maintainers: ELITE TEAM6 + Community

Blockchain: PulseChain

License: MIT

“Privacy isn’t hiding — it’s control. PrivX Protect gives you control over when your transaction is seen.”

🧬 Version
v1.0.0 — PrivX Protect Relay Node (PulseChain Edition)

yaml
Copy code
