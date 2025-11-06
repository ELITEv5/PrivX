# 🔍 How Privacy Works Under the Hood
### *Understanding the Two-Layer Privacy Model of PrivX*

---

## 1. The Design Philosophy

PrivX doesn’t hide data; it hides *relationships*.  
All information is recorded transparently on-chain, yet the link between the person who deposits and the one who withdraws becomes statistically invisible.

The protocol achieves this with **two cryptographic layers**:

1. **Commitment Layer** – the `secretHash` created at deposit.  
2. **Obfuscation Layer** – the `secret` revealed only at withdrawal.

---

## 2. The Commitment Layer — *The Anchor*

When a user deposits:

```solidity
deposit(uint256 amount, bytes32 secretHash)
The wallet sends PRIVX tokens to the contract.

The contract stores a record keyed by secretHash = keccak256(secret).

A Deposited(secretHash, amount) event is emitted.

Visible on-chain:
The secretHash (32-byte hash)

The amount

The timestamp

Hidden:
The plaintext secret

Who created that hash

This creates an on-chain safe: everyone sees that it exists, but no one knows who holds the key.

3. The Obfuscation Layer — The Key
When the user later withdraws:

solidity
Copy code
withdraw(string secret, address[] recipients)
The contract recomputes:

solidity
Copy code
bytes32 hash = keccak256(abi.encode(secret));
If that matches a stored deposit, it unlocks the funds.

What happens next:
A 0.3 % burn fee is processed.

The remaining tokens are split deterministically among 1–3 recipient wallets based on pseudo-random ratios derived from the secret.

The deposit is marked claimed.

Hidden from observers:
Who originally deposited.

Whether the withdrawer is the same entity.

Which deposits map to which withdrawals.

4. The Entropy of the Crowd
Privacy doesn’t rely on encryption; it grows from volume and variance.

As deposits accumulate and withdrawals scatter across time:

𝑃
(
link
)
=
1
𝐴
×
𝑊
P(link)= 
A×W
1
​
 
where
A = active deposits in the window,
W = average withdrawal wallets per secret.

Every new user lowers the probability that anyone can link a deposit to a withdrawal.

5. The Split Function — Mathematical Noise
solidity
Copy code
_getSplit(string memory secret, uint256 n)
Produces deterministic, secret-based percentages that divide the withdrawal.
Even though the math is public, the exact result can’t be predicted without knowing the secret.
This spreads each withdrawal across multiple addresses and times, increasing uncertainty.

6. Transparency vs. Obfuscation
Stage	Visible On-Chain	Hidden	Effect
Deposit	Hash, amount, timestamp	Secret	Commitment
Waiting period	Vault balances, events	Identity	Entropy builds
Withdraw	Recipients, burn, reward	Original depositor	Link broken

All funds remain auditable; only the identity link dissolves in the noise of network activity.

7. Why This Matters
Transparency preserved: anyone can audit burns and balances.

Privacy achieved: no direct mapping between depositors and recipients.

Compliance friendly: the ledger is open; the associations are private.

Scalable: privacy strengthens naturally as usage grows.

In One Line
The hash is the anchor.
The secret is the key.
The crowd is the shield.

© 2025 ELITE LABS — authored by ELITE TEAM6
License: CC-BY-4.0

yaml
Copy code

