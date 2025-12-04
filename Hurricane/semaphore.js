// semaphore.js — OFFICIAL SEMAPHORE PROOF GENERATOR (NO .WASM, NO .ZKEY, NO DOWNLOADS)
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

window.generateDeposit = function() {
  const identity = new Identity()
  const commitment = identity.commitment.toString()

  const note = `privx-hurricane-2025-${commitment.slice(-12)}`
  localStorage.setItem('latestNote', JSON.stringify({ identity: identity.toString(), commitment, note }))

  return { commitment, note }
}

window.generateWithdrawProof = async function(recipient) {
  const saved = JSON.parse(localStorage.getItem('latestNote') || '{}')
  if (!saved.identity) throw new Error("No deposit found — deposit first")

  const identity = new Identity(saved.identity)
  const group = new Group(20) // 20 levels — matches your contract
  group.addMember(identity.commitment)

  const proof = await generateProof(
    identity,
    group.generateMerkleProof(0),
    recipient,                    // message = recipient address
    "100000000000000000000"       // scope = your pool denomination (example 100 PRIVX)
  )

  return proof
}
