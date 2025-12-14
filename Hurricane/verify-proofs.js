// ✅ Browser-safe PLONK proof verification using snarkjs

import * as snarkjs from "snarkjs";

/**
 * Verify a PLONK proof with the verification key.
 */
export async function verifyProof(proof, publicSignals, verificationKey) {
  try {
    if (!proof || !publicSignals || !verificationKey) {
      console.error("Missing inputs for verification");
      return false;
    }

    const isValid = await snarkjs.plonk.verify(
      verificationKey,
      publicSignals,
      proof
    );

    console.log("✅ Verification result:", isValid);
    return isValid;
  } catch (err) {
    console.error("❌ Error verifying proof:", err);
    return false;
  }
}

