# 🔍 How Privacy Works Under the Hood  
### *The PrivX Model of Transparent Privacy*

---

## 1️⃣ The Big Idea

PrivX doesn’t hide blockchain data.  
It hides **who connects to what**.

Every transaction remains visible.  
But the link between the **depositor** and the **withdrawer** disappears inside the crowd.

Privacy = math + movement.

---

## 2️⃣ Layer One — The Commitment (The “Lock”)

When a user deposits:

deposit(uint256 amount, bytes32 secretHash)

yaml
Copy code

- The contract stores:  
  - `amount`  
  - `timestamp`  
  - `claimed: false`  
- The key field is `secretHash = keccak256(secret)`.

That hash is public — anyone can see it.  
But the **original secret string** is not.

You can think of it like this:

> 💡 *The deposit creates a visible safe. Everyone sees it exists, but no one knows the combination.*

---

## 3️⃣ Layer Two — The Secret (The “Key”)

To withdraw, a user later calls:

withdraw(string secret, address[] recipients)

scss
Copy code

Inside the contract:

bytes32 hash = keccak256(abi.encode(secret));

yaml
Copy code

If that matches an existing deposit, funds unlock.

Then:
- 0.3 % burn fee is processed.  
- Remaining funds split across 1–3 wallets.  
- Deposit marked as claimed.

Because anyone with the secret can withdraw, the blockchain cannot tell:
- who made the deposit,  
- who made the withdrawal,  
- or whether they’re the same entity.

---

## 4️⃣ The Split — Mathematical Noise

Each secret produces unique, deterministic split ratios.

Example:  
_getSplit(secret, 3)
→ [41%, 37%, 22%]

yaml
Copy code

No random number generator, no off-chain oracle — pure hash math.  
Even if someone studies the code, they can’t guess a split without knowing the secret itself.

This scattering of funds makes patterns harder to follow.

---

## 5️⃣ Privacy That Grows

As more users participate, the “crowd” becomes denser.

If  
`A = active deposits`  
`W = avg withdrawal wallets per secret`

then  
\[
P(\text{link}) = \frac{1}{A × W}
\]

Example:  
1 000 daily deposits × 7 days × 2 wallets →  
≈ 14 000 possible connections → **0.007 % trace probability.**

More users = less certainty.

---

## 6️⃣ Transparency vs. Obfuscation

| Stage | Visible | Hidden | What It Does |
|-------|----------|---------|---------------|
| **Deposit** | Hash, amount, timestamp | Secret | Creates the lock |
| **Waiting** | Contract balances | Identity link | Builds entropy |
| **Withdraw** | Recipients, burn | Depositor identity | Breaks the link |

Everyone can audit burns and balances.  
No one can easily connect senders to receivers.

---

## 7️⃣ Why It Matters

- **Auditable:** all transactions stay verifiable on-chain.  
- **Private:** ownership links vanish in statistical noise.  
- **Fair:** no privileged roles, no admin keys.  
- **Scalable:** privacy improves naturally with usage.

---

### ⚡ In One Sentence

> **The hash locks the value.  
> The secret unlocks it.  
> The crowd hides the trail.**

---

© 2025 **ELITE LABS** — authored by **ELITE TEAM6**  
License: CC-BY-4.0

