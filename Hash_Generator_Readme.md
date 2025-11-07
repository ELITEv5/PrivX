# 🛡️ PrivX Hash Generator — Official Tool

**Live tool:** [https://elitev5.github.io/PrivX/Hash-Generator/](https://elitev5.github.io/PrivX/Hash-Generator/)  
**Status:** ✅ Verified & 100% Offline-Capable

---

## 🔍 Overview

The **PrivX Hash Generator** allows users to create a **Secret** and matching **Hash** pair — the core privacy mechanism used in the **PrivX Shield Relay**.

All generation happens **locally** in your browser.  
No data ever leaves your computer — you can even **download the page** and use it completely **offline**.

---

## 🧭 How It Works

1. **Generate Secret & Hash**  
   - A random 32-byte secret is created.  
   - Its Keccak-256 hash (`keccak256(abi.encode(secret))`) is generated exactly as expected by the PrivX smart contract.

2. **Use the Hash for Deposit**  
   - Paste the generated **Hash** into the PrivX deposit field.  
   - The deposit becomes locked and linked to your private Secret.

3. **Withdraw Within 7 Days**  
   - Use your Secret to withdraw funds to **1–3 wallet addresses**.  
   - A **0.3 % burn fee** is applied automatically.

4. **After 7 Days (Reclaim Phase)**  
   - If no withdrawal occurs, **anyone** can reclaim using the deposit Hash.  
   - **95 % is burned 🔥**, **5 % is rewarded 💎** to the caller.  
   - The Secret no longer grants access after expiration.

---

## ⚠️ Safe-Handling Guidelines

- **Your Secret = Your Access Key**  
  Anyone with the Secret can withdraw the deposit within 7 days. Treat it like a private key.

- **Never share your Secret publicly**  
  If sending funds to another person, share the Secret **directly and securely** with them.

- **The Hash is safe to share**  
  It’s used for deposits and the public reclaim function after expiration.

- **Backup locally**  
  Use the **“Save .txt”** button to export a local backup of your Secret + Hash.

- **Offline verification**  
  You can test this tool without internet access — simply save the page and open it offline.

---

## 📦 File Summary

| File | Purpose |
|------|----------|
| `index.html` | The offline PrivX hash generator interface |
| `ethers.umd.min.js` | Local copy of ethers.js used for cryptographic hashing |

---

## 🧠 Smart-Contract Summary

| Phase | Who Can Act | Time Limit | Outcome |
|-------|--------------|-------------|----------|
| **Withdraw** | Secret holder | 7 days | Funds distributed (0.3 % burn) |
| **Reclaim** | Anyone | After 7 days | 95 % burn / 5 % reward |

---

## 🧩 Open-Source Verification

All logic is publicly viewable in:

- [`index.html`](https://github.com/elitev5/PrivX/tree/main/Hash-Generator)  
- [`PrivX_Shield_Relay_V73.sol`](https://github.com/elitev5/PrivX/blob/main/PrivX_Shield_Relay_V73.sol)

✅ No network calls, tracking scripts, or external APIs are used.

---

## 🧬 Developer Notes

Built by **ELITE TEAM6** under **Elite Labs**.  
Licensed under **MIT License**.  
Native to **PulseChain**; expansion planned for **Base**.

---

## 🛰 Try It Now

👉 [Launch the PrivX Hash Generator](https://elitev5.github.io/PrivX/Hash-Generator/)

---

> 🔒 **Generate privately. Withdraw securely. Burn beautifully.**
