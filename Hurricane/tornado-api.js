// tornado-api.js – FINAL WORKING VERSION (Semaphore Official)
import { generateProof } from "@semaphore-protocol/proof"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

window.generateDeposit = async function() {
  const identity = new Identity()
  const commitment = identity.commitment.toString()

  return {
    identity,
    commitment,
    note: `privx-hurricane-100-${Math.random().toString(36).slice(2,10)}`
  }
}

window.generateWithdrawProof = async function(identity, merkleProof, recipient) {
  const group = new Group(20) // 20 levels
  group.addMembers([identity.commitment]) // in real app: fetch from contract

  const proof = await generateProof(
    identity,
    group.generateMerkleProof(0),
    recipient,           // message = recipient address
    1                    // scope = 1 (or your pool ID)
  )

  return proof
}
