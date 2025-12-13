import * as snarkjs from "snarkjs";
import { CONFIG } from "./config-all-denominations.js";

/**
 * Generate a zkSNARK proof for PrivX using the PLONK proving system.
 * This uses your IPFS-hosted proving key and local wasm circuit.
 */
export async function generateProof(input: any) {
  console.log("🌀 Generating proof...");

  try {
    // 1️⃣ Load the circuit WASM
    const wasmFilePath = "./mixer_js/mixer.wasm";

    // 2️⃣ Fetch the zkey from IPFS
    const response = await fetch(CONFIG.zkeyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch zkey from IPFS: ${response.statusText}`);
    }

    const zkeyBuffer = await response.arrayBuffer();

    // 3️⃣ Generate proof using snarkjs
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      input,
      wasmFilePath,
      new Uint8Array(zkeyBuffer)
    );

    console.log("✅ Proof generated successfully!");
    console.log("📜 Public signals:", publicSignals);

    return { proof, publicSignals };
  } catch (err) {
    console.error("❌ Error generating proof:", err);
    throw err;
  }
}
