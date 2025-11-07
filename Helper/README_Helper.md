# 🛡️ PrivX Shield Relay Helper — v4.1

**Built by ELITE TEAM6 • © Elite Labs • PulseChain Native**  
**License:** MIT  
**Status:** ✅ Fully Functional | 100% On-Chain | No Admin | No API Calls

---

## 🌐 Overview

The **PrivX Shield Relay Helper** is a simple, open-source, on-chain interface that lets users interact directly with the immutable **PrivX Shield Relay (V7.3)**.

No centralized servers.  
No backend logic.  
No tracking.  

Every action — Deposit, Withdraw, Reclaim, or Check — happens **directly on PulseChain**.

> “We don’t hide. We outnumber.”  
> — Elite Labs, 2025

---

## 💡 What It Does

| Action | Description | Who Can Use It |
|--------|--------------|----------------|
| 💰 Deposit | Lock PRIVX tokens with a secret hash | Any wallet |
| 💎 Withdraw | Use your secret within 7 days to withdraw to 1–3 wallets | Secret holder |
| 🔥 Reclaim | After 7 days, anyone can reclaim an expired deposit | Any wallet |
| 🔍 Check | View deposit info by hash (amount, time, claimed/unclaimed) | Anyone |

---

## 🧠 The PrivX Vision

**PrivX isn’t about hiding — it’s about blending.**  
Each user who joins the Shield Relay adds noise, complexity, and privacy for everyone else.

The more people deposit and withdraw, the more difficult it becomes to trace anything on-chain.  
It’s privacy through participation — not obfuscation.

> **We don’t hide. We outnumber.**

---

## ⚙️ Step-by-Step Guide

### 🪙 Step 1 — Deposit PRIVX

1. Go to the [**Hash Generator**](https://elitev5.github.io/PrivX/Hash-Generator/)  
   → Generate a **Secret** and **Hash** pair.  
   → Copy your **Hash** for deposit.

2. In the helper, enter:
   - Deposit amount (e.g. `10`)
   - Your generated `Hash`

3. Click **Approve PRIVX** *(first time only)*.  
   Then click **Deposit**.

**💡 Tip:** Each new deposit requires a new `Hash`, but your approval only needs to be done once.

---

### 💎 Step 2 — Withdraw Funds

1. Within 7 days of deposit, enter:
   - Your `Secret` (UTF-8 string)
   - 1–3 wallet addresses to receive funds

2. Click **Withdraw**.  
   - A 0.3% burn fee applies automatically.  
   - The rest is split across your wallets deterministically.

**⚠️ Security:**  
Anyone with your Secret can withdraw your funds within 7 days.  
Treat it like a private key — never share it publicly.

---

### 🔥 Step 3 — Reclaim Expired Deposits

After 7 days, deposits become public reclaimable.

1. Enter the **Deposit Hash** and click **Reclaim**.  
2. You’ll receive **5% of the deposit as a reward**.  
3. The remaining **95% is burned forever.**

You can also use the **Claim Helper** panel to see *all reclaimable deposits* at once — and reclaim them instantly.

---

### 🔍 Step 4 — Check Deposit Status

Want to verify your deposit?  
Paste your **Deposit Hash** into the *Check Deposit Status* section.

You’ll instantly see:
- Amount locked  
- Deposit date  
- Claimed / Unclaimed status  

Works even without connecting your wallet.

---

## 🧩 Claim Helper (Auto-Discovery)

The **Claim Helper** scans the Shield Relay for all unclaimed deposits that have passed the 7-day window.

- Auto-refreshes every 30 seconds  
- Displays all expired deposit hashes  
- Each hash has:
  - `Copy` button for sharing or recordkeeping  
  - `🔥 Reclaim` button for one-click reward claiming

---

## 🧱 On-Chain Architecture

| Component | Contract Address | Description |
|------------|------------------|-------------|
| **PRIVX Token** | `0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986` | Fixed 21M supply, burnable utility token |
| **Shield Relay V7.3** | `0xccCFA11f70aBf3d32f38D93FEA4d31D5A99E19dA` | Immutable privacy relay (no admin, no upgrades) |

All logic executes on-chain.  
Even this helper runs entirely in your browser — you can verify by saving the page and running offline.

---

## 🧭 Safe-Use Guidelines

- 🪙 **Always back up your Secret** — losing it means losing access to your funds.
- 🕓 **Withdraw within 7 days** — after that, anyone can reclaim.
- 🔥 **Unclaimed deposits** burn 95% permanently, rewarding 5% to the caller.
- 🧩 **No central admin** — the protocol runs autonomously on PulseChain.
- 🧠 **Privacy through participation** — each new user strengthens the whole.

---

## 🛰️ Developer Notes

- Built by **ELITE TEAM6** under **Elite Labs**
- Verified contracts deployed to **PulseChain**
- Written in **Solidity 0.8.20**
- License: **MIT**
- Compatible with **MetaMask, Rabby, Brave Wallet, Frame**, etc.

---

## 💬 Vision Quote

> “In a world of watchers, the strongest move is not to hide — it’s to move in plain sight among millions.”  
>  
> **PrivX. Strength in numbers. Privacy by participation.**

---

## 🔗 Live Interfaces

- 🔐 **Hash Generator:** [elitev5.github.io/PrivX/Hash-Generator](https://elitev5.github.io/PrivX/Hash-Generator/)  
- 🛡️ **Relay Helper:** [elitev5.github.io/PrivX/Helper](https://elitev5.github.io/PrivX/Helper/)  
- 📜 **Contracts:** [View on PulseChainScan](https://scan.pulsechain.com/address/0xccCFA11f70aBf3d32f38D93FEA4d31D5A99E19dA)

---

**© 2025 Elite Labs** — Powered by PulseChain  
*Transparency is privacy. Privacy is power.*
