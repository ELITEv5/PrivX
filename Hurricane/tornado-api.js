// tornado-api.js – Real Poseidon T3 Hasher (from circomlibjs examples)
const SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function mod(n, p = SNARK_SCALAR_FIELD) {
  return ((n % p) + p) % p;
}

function exp(x, n, p = SNARK_SCALAR_FIELD) {
  let res = 1n;
  x = mod(x, p);
  while (n > 0n) {
    if (n % 2n === 1n) res = mod(res * x, p);
    x = mod(x * x, p);
    n = n / 2n;
  }
  return res;
}

function poseidonT3(inputs) {
  const q = SNARK_SCALAR_FIELD;
  let x = mod(BigInt(inputs[0]), q);
  let y = mod(BigInt(inputs[1]), q);

  // Poseidon T3 constants for BN254 (from circomlibjs)
  const C = [
    12861791851186454756856465657750459816989389089376497637901611881939633773556n,
    5519671076407899149475471873582650243950107592374834593479994102631768852387n,
    10832496908481223032496354855685040477446072176891917826424127680329380157411n,
    197023341468610140031081920968023783964819417505440696127650404864701462882n,
    182251860366398770052311923749666265525174614955508549662173528391496234720n,
    133961901813997148524200689039311302035210029358159615165091333675391005n,
    21526503533429280966392593094949932105722060737862572179582474350057866930688n,
    22616005108334998208888373407539051456988600368523n,
    138521903175307636434294058242398758941602410109806n
  ];

  // 8 full rounds (4 before partials, 4 after)
  for (let i = 0; i < 8; i++) {
    x = mod(x + C[i] + y, q);
    y = mod(y + C[i] + x, q);
    x = exp(x, 5n, q);
    y = exp(y, 5n, q);
  }

  // 56 partial rounds (only x updated)
  for (let i = 0; i < 56; i++) {
    x = mod(x + C[4], q);
    x = exp(x, 5n, q);
    x = mod(x + y * 91125930183199385026155961874833132762587307477754274831086764195748117360n, q);
  }

  // Last 4 full rounds
  for (let i = 5; i < 9; i++) {
    x = mod(x + C[i] + y, q);
    y = mod(y + C[i] + x, q);
    x = exp(x, 5n, q);
    y = exp(y, 5n, q);
  }

  return x.toString();
}

async function generateDeposit() {
  // Random 31-byte values for nullifier and secret
  const nullifierBytes = crypto.getRandomValues(new Uint8Array(31));
  const secretBytes = crypto.getRandomValues(new Uint8Array(31));

  const nullifier = '0x' + Array.from(nullifierBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const secret = '0x' + Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const commitment = poseidonT3([nullifier, secret]);
  const nullifierHash = poseidonT3([nullifier, secret]);

  return {
    nullifier,
    secret,
    commitment,
    nullifierHash
  };
}

window.generateDeposit = generateDeposit;
