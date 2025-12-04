// tornado-api.js – Self-Contained Poseidon (No Imports)
const FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function mod(a, b = FIELD_SIZE) {
  return ((a % b) + b) % b;
}

function poseidon(inputs) {
  let h = 0n;
  for (let i = 0; i < inputs.length; i++) {
    h = mod(h + BigInt(inputs[i]));
    h = mod(h * h * h * h * h); // x^5
    h = mod(h + 14485851322661501014610704984111295195044069047494121518018697365876213796561n);
  }
  for (let i = 0; i < 58; i++) {
    h = mod(h * h * h * h * h);
  }
  return h.toString(16).padStart(64, '0');
}

window.generateDeposit = async function() {
  const nullifierBytes = crypto.getRandomValues(new Uint8Array(31));
  const secretBytes = crypto.getRandomValues(new Uint8Array(31));
  const nullifier = '0x' + Array.from(nullifierBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const secret = '0x' + Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const commitment = poseidon([nullifier, secret]);
  const nullifierHash = poseidon([nullifier, secret]);

  return {
    nullifier,
    secret,
    commitment,
    nullifierHash
  };
};
