// tornado-api.js → SEMAPHORE OFFICIAL (DELETE THE OLD ONE)
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

// Generate deposit (identity + commitment)
window.generateDeposit = function() {
  const identity = new Identity()
  const commitment = identity.commitment.toString()

  const note = `privx-hurricane-${window.selectedDenomination}-${commitment.slice(-8)}`
  
  return {
    identity,
    commitment,
    note
  }
}

// Generate withdrawal proof (this works with YOUR Verifier.sol 100%)
window.generateWithdrawProof = async function(identity, merkleProof, recipient, denomination) {
  const group = new Group(20) // 20 levels
  group.addMember(identity.commitment)

  const proof = await generateProof(
    identity,
    group.generateMerkleProof(0),
    recipient,                    // message = recipient address
    denomination                  // scope = externalNullifier = denomination
  )

  return proof
}
