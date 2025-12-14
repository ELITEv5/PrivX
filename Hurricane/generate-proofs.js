
import * as snarkjs from "snarkjs";
import { buildPoseidon } from "circomlibjs";

export async function generateProof(denomination) {
  console.log("⚙️ Generating PLONK proof for denomination:", denomination);

  // Load circuit
  const wasmFile = "./mixer.wasm";
  const zkeyFile = "./mixer_final.zkey";

  console.log("🌀 Loading PLONK circuit files...");
  const [wasm, zkey] = await Promise.all([
    fetch(wasmFile).then(r => r.arrayBuffer()),
    fetch(zkeyFile).then(r => r.arrayBuffer())
  ]);

  // Prepare inputs
  const poseidon = await buildPoseidon();

  // Random secrets
  const secret = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32)).reduce((a, b) => a + b.toString(16).padStart(2, "0"), ""));
  const nullifier = BigInt("0x" + crypto.getRandomValues(new Uint8Array(32)).reduce((a, b) => a + b.toString(16).padStart(2, "0"), ""));

  const nullifierHash = poseidon.F.toObject(poseidon([nullifier, BigInt(denomination)]));

  // Placeholder tree (for now, single-leaf)
  const root = poseidon.F.toObject(poseidon([secret, nullifier]));
  const levels = 20;
  const pathIndices = Array(levels).fill(0);
  const siblings = Array(levels).fill("0");

  const input = {
    secret: secret.toString(),
    nullifier: nullifier.toString(),
    pathIndices,
    siblings,
    root: root.toString(),
    nullifierHash: nullifierHash.toString(),
    denomination: denomination.toString()
  };

  console.log("📥 Input signals prepared:", input);

  try {
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      input,
      new Uint8Array(wasm),
      new Uint8Array(zkey)
    );

    console.log("✅ Proof generated successfully!");
    console.log({ proof, publicSignals });

    return { proof, publicSignals };
  } catch (err) {
    console.error("❌ Error generating PLONK proof:", err);
    throw err;
  }
}


