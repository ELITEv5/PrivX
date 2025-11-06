# 🛡️ PrivX Shield Relay — Whitepaper (v1.0)
**An Immutable, Ownerless Privacy Layer for Token Transfers on PulseChain**  
**Dev:** ELITE TEAM6  
**License:** MIT | **Network:** PulseChain  

---

## **Abstract**

The **PrivX Shield Relay** is an immutable and ownerless smart contract designed to enhance privacy and deflationary mechanics within the **PrivX ecosystem**.  
It enables users to deposit and withdraw tokens through a cryptographic relay system that breaks the on-chain traceability of token flows while simultaneously burning a portion of every withdrawal, ensuring long-term token scarcity.

Built natively for **PulseChain**, the Shield Relay is the backbone of the PrivX privacy layer — an autonomous and trustless mechanism that rewards participation, maintains transparency, and supports token value through deflationary pressure.

---

## **1. Overview**

The PrivX Shield Relay provides a **non-custodial privacy mechanism** for the PrivX token (PRIVX).  
Users interact with the relay using **secrets and their keccak256 hashes**, allowing for unlinkable deposits and withdrawals while maintaining full on-chain verifiability.

Each deposit is locked under a **unique hash**, and can only be released by providing the matching **secret** — which acts as the private key for the specific deposit.

When tokens are withdrawn, the relay:
- Destroys **0.3%** of the amount (burned permanently to the PulseChain sink address)
- Allows splitting the remainder between up to **3 recipient wallets**
- Leaves no administrative control or upgrade pathway — **immutable after deployment**

After 7 days, any unclaimed deposits are **burned automatically**, with **5% of the total deposit rewarded** to the user who triggers the burn.

---

## **2. Core Features**

### 🔐 **Privacy Mechanics**
- **Secret-based anonymity:** Deposits are linked only to a hash, not to a wallet.
- **Hash generation:** Users generate a secret (random 32-byte string) and compute `keccak256(secret)` locally.
- **Withdraw logic:** To withdraw, the user reveals the matching secret — reproducing the stored hash on-chain.

### 💸 **Economic Design**
- **0.3% withdrawal fee:** 100% of the fee is sent to the **PulseChain burn sink (0x...0369)**.
- **7-day reclaim window:** If unclaimed, the deposit is burned — but the caller earns a **5% reward**.
- **Deflationary impact:** Every transaction permanently removes PrivX from circulation.

### 🧮 **Deterministic Split Logic**
- Withdrawals can be split between **1, 2, or 3 wallets**.  
- Shares are determined by deterministic randomness derived from the secret.
- Example: 2-wallet split might send **72% / 28%**; 3-wallet could yield **45% / 38% / 17%**.

This pattern creates **natural transaction noise**, increasing obfuscation in on-chain analysis.

---

## **3. Technical Architecture**

| Element | Description |
|----------|--------------|
| **Language** | Solidity ^0.8.20 |
| **Frameworks** | OpenZeppelin SafeERC20 + ReentrancyGuard |
| **Network** | PulseChain |
| **Token** | PrivX (0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986) |
| **Burn Sink** | 0x0000000000000000000000000000000000000369 |
| **Fee** | 0.3% of withdrawal |
| **Reclaim Reward** | 5% to caller if unclaimed after 7 days |
| **Admin** | None — immutable |
| **Upgradeability** | None |
| **Slippage Guard** | Ensures 99.99% minimum deposit integrity |

---

## **4. Lifecycle of a Shielded Transaction**

### Step 1: **Generate Secret & Hash**
Users generate a random 32-byte secret and compute its hash locally:

```bash

node -e "const { ethers } = require('ethers'); const crypto = require('crypto'); 
const s = crypto.randomBytes(32).toString('hex'); 
const h = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['string'], [s])); 
console.log('\n🔐 Secret:', s, '\n🧩 Hash:', h, '\n');"
Step 2: Deposit
Deposit PRIVX tokens to the relay:


deposit(uint256 amount, bytes32 secretHash)
The contract records the amount and timestamp, but not the depositor’s address.

Step 3: Withdraw
Withdraw using your secret and up to 3 recipient wallets:


withdraw(string secret, address[] recipients)
Tokens are distributed in randomized but deterministic patterns.

Step 4: Reclaim (After 7 Days)
If unclaimed, any user may trigger:


reclaim(bytes32 hash)
→ 95% of the amount is burned
→ 5% rewarded to the caller

5. Privacy Model
Feature	Effect on Traceability
Secret-hash locking	Eliminates direct link between depositor & withdrawal wallet
Multi-recipient splitting	Randomizes fund flow patterns
Reclaim/burn delay	Introduces asynchronous transaction timing
No ownership or logging	No admin, registry, or event linking user data
Fixed burn behavior	Ensures consistent on-chain patterning with no selective bias

Estimated linkage probability (v7.2):
≈ 3–5% for 3-wallet split scenarios in active relay pools (>100 users weekly).

6. Security & Audit Design
Built-in Safeguards
Reentrancy Guard: Prevents nested calls or drain exploits.

SafeERC20 Transfers: Protects from non-standard ERC20 behavior.

Slippage Guard: Blocks partial deposits that could signal manipulation.

Immutable Constants: Prevents tampering after deployment.

Non-upgradeable & Ownerless
No admin keys.

No upgrade paths.

Contract is permanently immutable upon deployment.

Reclaim Incentive
The 5% reward ensures community-driven enforcement —
no central agent required to burn expired deposits.

7. Tokenomics Impact
Mechanic	Effect on PrivX
Relay burn fee (0.3%)	Continuous deflationary pressure
Expired deposits burn	Additional long-tail supply reduction
Reclaim rewards	Incentivizes community participation
Transaction obfuscation	Strengthens PrivX’s privacy use case

The Shield Relay acts as both a privacy mixer and deflation engine,
rewarding long-term holders while discouraging on-chain tracing.

8. Future Roadmap
Phase	Upgrade
V8.0	Optional time-based staggered withdrawals (true delays)
V8.1	Integration with external privacy tokens as relay inputs
V9.0	On-chain zk-commitments for full cryptographic anonymity
V10.0	Cross-chain Shield Relays (ETH / Pulse / BSC / Polygon)

9. Disclaimer
PrivX Shield Relay is non-custodial and autonomous.
Use at your own discretion — no one can recover lost secrets, reverse burns, or refund tokens.
This protocol is immutable and not controlled by any individual or organization.

10. Conclusion
The PrivX Shield Relay merges privacy, deflation, and autonomy into a single, immutable on-chain protocol.
By design, it enhances user confidentiality, strengthens token scarcity, and creates a self-sustaining privacy layer native to the PrivX ecosystem.

Its strength lies not in hidden complexity, but in pure, verifiable simplicity.

