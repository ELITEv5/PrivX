// ✅ Poseidon-style keccak hash for browser (no TS/Node imports)

export function poseidonHash(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(input));

  return crypto.subtle.digest("SHA-256", data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, 
"0")).join("");
    return "0x" + hex;
  });
}

