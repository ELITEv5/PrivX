# 🛡️ PrivX: Progressive On-Chain Privacy via Deterministic Statistical Mixing  
### *Technical Whitepaper — Version 1.9 (Commit–Reveal + Reward Pool Edition)*  

**Authors:** ELITE TEAM6  
**Affiliation:** Elite Labs, 2025  
**Network:** PulseChain Mainnet  
**License:** MIT | CC-BY-4.0  
**Repository:** [github.com/elitev5/PrivX](https://github.com/elitev5/PrivX)  

---

## Abstract

This paper presents **PrivX**, an immutable, ownerless privacy protocol on **PulseChain**, implementing *progressive on-chain privacy* — a deterministic and auditable anonymity system scaling with user participation.  

Unlike cryptographic mixers, PrivX achieves unlinkability through **statistical crowding**, not zero-knowledge encryption.  
Each deposit adds entropy to a collective shield pool. Withdrawals — resolved through a **commit–reveal system** — disperse funds across multiple wallets with deterministic pseudo-randomness.  

The **V9 Shield Relay** introduces a hybrid incentive model powered by a **self-refilling reward pool**: each transaction burns a fraction of PRIVX and cycles a portion back into a communal pool, rewarding active shield participants.  

---

## 1. Introduction

On transparent blockchains, privacy is a paradox: all transactions are public, yet users seek untraceability.  
Existing approaches either require trust in intermediaries (mixers) or rely on heavy cryptography (zk-proofs).  

**PrivX** redefines privacy as an **emergent network property** — measurable, deterministic, and statistically verifiable.  

Rather than hiding data, PrivX obscures relationships through collective timing and entropy.  
Every deposit, withdrawal, and reclaim increases anonymity for all users.  

The **V9 iteration** introduced two major innovations:
- A **commit–reveal shield layer** to prevent front-running or withdrawal correlation.  
- A **reward pool** system to incentivize shield participation and strengthen the privacy field.

---

## 2. System Architecture

### 2.1 Core Components

| Component | Type | Description |
|------------|------|-------------|
| `PRIVX` | ERC-20 Token | Fixed supply of 21M PRIVX — the base privacy asset |
| `PrivX_Shield_Relay_V9` | Smart Contract | Implements deposit, commit–reveal withdrawal, reclaim, and reward logic |
| Hash Generator | Frontend Tool | Offline keccak256 secret hash generator |
| Shield App | Web Interface | User-friendly dApp for deposits, commits, and withdrawals |

---

### 2.2 Deposit / Withdraw Cycle (V9)

1. **Commit Phase**  
   - User computes `commitHash = keccak256(secret + address)` offline.  
   - Calls `commit(commitHash)` on-chain to register the intent to withdraw later.  
   - Valid for ~5 minutes (≈42 blocks) to protect against front-running.

2. **Deposit Phase**  
   - User locks tokens under a privacy hash `keccak256(secret)`.  
   - Deposit emits a `Deposited(secretHash, amount)` event and adds to the shielded pool.  
   - Each deposit triggers a reward minted from the shared **reward pool**.

3. **Withdraw Phase**  
   - User reveals the `secret` and provides up to three recipient addresses.  
   - Contract validates the matching `commitHash`.  
   - Funds are released with randomized splits:  
     `split = deterministic(secret, n)` ensuring on-chain reproducibility.  
   - A 0.3 % fee is taken and partially burned.

4. **Reclaim Phase**  
   - After 7 days, unclaimed deposits can be reclaimed.  
   - 95 % of the amount is burned; 5 % rewarded to the caller.  

---

## 3. The Reward Pool Mechanism

### 3.1 Overview

The **Reward Pool** is an autonomous feedback engine designed to maintain user incentives while preserving token scarcity.

- Each withdrawal burns a small percentage of PRIVX (deflationary).  
- A portion of the burned fee is redirected into a shared **reward pool**.  
- New depositors automatically receive a reward from this pool via `mintReward()`.  
- Over time, the pool’s balance fluctuates based on user activity, creating a dynamic equilibrium between privacy usage and token scarcity.

### 3.2 Function Summary

| Function | Description |
|-----------|-------------|
| `rewardPool()` | Returns the current reward balance available for new deposits |
| `deposit(amount, hash)` | Transfers PRIVX into the shield and mints reward |
| `reclaim(hash)` | Burns expired deposits and pays 5 % reward |
| `getSystemStats()` | Returns vault, pool, burned, and withdrawal totals |

### 3.3 Reward Flow

\[
\text{Reward}_{user} = \text{Pool Balance} \times \frac{Deposit}{Total Vault}
\]

As deposits grow, rewards proportionally scale, strengthening the privacy field without arbitrary inflation.

---

## 4. Security Model

### 4.1 Commit–Reveal Logic

To prevent transaction correlation or front-running, PrivX enforces a **two-step reveal model**:

- **Commit:** registers an intent without disclosing the secret.  
- **Reveal:** validates against commit within the defined block window.  

This ensures that:
- No adversary can preemptively execute another user’s withdrawal.  
- Mempool observers cannot deduce timing or identity from pending transactions.  

### 4.2 Reentrancy & Safety

The system is protected by OpenZeppelin’s **ReentrancyGuard** and **SafeERC20**.  
All transfers use `safeTransfer` and are atomic.  
No ownership or upgradeability exists — the contracts are **immutable and non-custodial**.

---

## 5. Economic Model

### 5.1 Token Flows

| Operation | Burn (%) | Reward (%) | Pool Allocation |
|------------|-----------|-------------|----------------|
| Deposit | 0 | Yes | User receives from pool |
| Withdraw | 0.3 | 0 | 80 % burn / 20 % pool |
| Reclaim | 95 | 5 | Caller rewarded |

### 5.2 Deflationary Mechanism

Let:
- \( B_t \) = cumulative burned PRIVX  
- \( S_t \) = total supply in circulation  

Then:
\[
S_t = S_0 - B_t
\]

Over time, network activity directly reduces total supply, anchoring PRIVX’s value to shield usage volume.  

Each privacy action thus strengthens both anonymity and scarcity.

---

## 6. Mathematical Privacy Model

Let:
- \( A \) = number of active deposits in 7-day window  
- \( W \) = average number of withdrawal targets  

Then:
\[
P(link) = \frac{1}{A \times W}
\]
and
\[
PI = \log_2(A \times W)
\]

**V9 introduces temporal unlinkability** by staggering withdrawals via commit–reveal timing, further reducing linkage probability.

---

## 7. Implementation Details

**Language:** Solidity ^0.8.24  
**Libraries:** OpenZeppelin SafeERC20, ReentrancyGuard  
**Chain:** PulseChain Mainnet (Chain ID 369)  
**Fee Sink:** `0x0000000000000000000000000000000000000369`  

| Parameter | Value |
|------------|--------|
| Fee | 0.3 % |
| Reclaim Delay | 7 days |
| Commit Window | 42 blocks (~5 min) |
| Reward Pool | On-chain dynamic |
| Token Decimals | 18 |

All contract methods are public and non-upgradeable.  
Events (`Deposited`, `Withdrawn`, `Reclaimed`, `Committed`) provide complete transparency.  

---

## 8. Frontend Layer

The **PrivX Shield Interface (V9)** includes:
- **Offline Hash Generator:** Generates `keccak256(secret)` and `keccak256(secret + address)` for commits and deposits.  
- **Commit Helper:** Ensures valid commit window timing.  
- **Vault Tracker:** Displays live vault and pool stats using RPC calls.  
- **Reclaim Tool:** Monitors expiry and enables reclaim after 7 days.  

The dApp is fully static — all operations run through RPC endpoints, requiring no backend or central API.

---

## 9. Evaluation

| Metric | Description | Value |
|--------|--------------|-------|
| Deposit Gas | ~70,000 | Efficient |
| Withdraw Gas | ~110,000 | Commit–Reveal validated |
| Reclaim Gas | ~80,000 | Deflationary reclaim |
| Fee | 0.3% | Burned automatically |
| Reward Mint | Dynamic | From reward pool |

Simulation and empirical testing confirm that unlinkability scales inversely with participation volume.

---

## 10. Discussion

### 10.1 Limitations
- Temporal correlation possible with low participation.  
- Fixed split ratios can be statistically fingerprinted over long periods.  
- Reward pool balance varies with user activity; low usage periods may reduce incentives.  

### 10.2 Future Enhancements
- Multi-asset support using PRIVX as privacy gas.  
- zk-optional extensions for hybrid private proofs.  
- Layer-2 adaptation for reduced gas and higher throughput.

---

## 11. Conclusion

The **PrivX Shield Relay V9** established the foundation of *Proof-of-Privacy economics* — privacy as a measurable, incentive-driven network field.  

By combining **deterministic anonymity**, **commit–reveal shielding**, and a **self-balancing reward pool**, PrivX achieves an auditable, decentralized privacy protocol without custodians, admins, or obfuscation.

Every participant strengthens the collective veil.  
Every transaction burns value and increases entropy.  

> “We don’t hide. We multiply.”  
> — *ELITE TEAM6, 2025*

---

## Appendix

| Constant | Description | Value |
|-----------|-------------|--------|
| `FEE_BP` | Fee in basis points | 30 (0.3%) |
| `RECLAIM_DELAY` | Expiration window | 7 days |
| `COMMIT_WINDOW` | Valid blocks for reveal | 42 |
| `RECLAIM_REWARD_BP` | Reclaimer’s reward | 500 (5%) |
| `BURN_ADDRESS` | Burn sink | `0x0000000000000000000000000000000000000369` |

---

## References

1. Buterin, V. (2022). *Privacy Pools and Zero-Knowledge on Ethereum*.  
2. Meiklejohn, S. et al. (2013). *A Fistful of Bitcoins: Characterizing Payments Among Men with No Names*. ACM CCS.  
3. Tornado Cash Developers. (2021). *Tornado Cash Smart Contracts v3*.  
4. Elite Labs. (2025). *PrivX GitHub Repository.*  
5. PulseChain Docs. (2024). *PulseChain Developer Reference.*  
6. Narayanan, A. (2015). *Bitcoin and Cryptocurrency Technologies.* Princeton University Press.  

---

**© 2025 ELITE LABS — MIT & CC-BY-4.0 License**  
**PulseChain Native | Immutable | Transparent Privacy Through Participation**

