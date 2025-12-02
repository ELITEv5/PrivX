// tornado-api.js – Self-contained PRIVX Hurricane Edition (No imports needed)
const SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583n;

function mod(p, n) {
  return ((p % n) + n) % n;
}

function exp(base, exp, mod) {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = mod(result * base, mod);
    exp = exp >> 1n;
    base = mod(base * base, mod);
  }
  return result;
}

function poseidonT3(inputs) {
  const q = SNARK_SCALAR_FIELD;
  let x = BigInt(inputs[0]) % q;
  let y = BigInt(inputs[1]) % q;

  // Poseidon T3 constants (optimized for BN254)
  const c = [
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

  // 8 full rounds
  for (let i = 0; i < 8; i++) {
    x = mod(x + c[i] + y, q);
    y = mod(y + c[i] + x, q);
    x = exp(x, 5n, q);
    y = exp(y, 5n, q);
  }

  // 56 partial rounds
  for (let i = 0; i < 56; i++) {
    x = mod(x + c[4], q);
    x = exp(x, 5n, q);
    x = mod(x + y * 91125930183199385026155961874833132762587307477754274831086764195748117360n, q);
  }

  // Last 4 full rounds
  for (let i = 5; i < 9; i++) {
    x = mod(x + c[i] + y, q);
    y = mod(y + c[i] + x, q);
    x = exp(x, 5n, q);
    y = exp(y, 5n, q);
  }

  return Number(x % q);
}

async function generateDeposit() {
  const nullifier = Math.floor(Math.random() * Number(SNARK_SCALAR_FIELD));
  const secret = Math.floor(Math.random() * Number(SNARK_SCALAR_FIELD));
  const commitment = poseidonT3([nullifier, secret]);
  const nullifierHash = poseidonT3([nullifier, secret]);

  return { nullifier, secret, commitment, nullifierHash };
}

window.generateDeposit = generateDeposit;
