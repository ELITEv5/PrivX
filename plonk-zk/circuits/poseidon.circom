// SPDX-License-Identifier: MIT
pragma circom 2.1.6;

/*───────────────────────────────────────────────
 ░░░  PrivX Poseidon Hasher Circuits ░░░
 Matches deployed Hasher.sol (PoseidonT3x3, PoseidonT3)
───────────────────────────────────────────────*/

template CustomPow5() {
    signal input in;
    signal output out;

    signal x2;
    signal x4;

    x2 <== in * in;
    x4 <== x2 * x2;
    out <== x4 * in;
}

template CustomPoseidonT3x3() {
    signal input inputs[3];
    signal output out;

    var q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    var C[9] = [
        12861791851186454756856465657750459816989389089376497637901611881939633773556,
        5519671076407899149475471873582650243950107592374834593479994102631768852387,
        10832496908481223032496354855685040477446072176891917826424127680329380157411,
        197023341468610140031081920968023783964819417505440696127650404864701462882,
        182251860366398770052311923749666265525174614955508549662173528391496234720,
        133961901813997148524200689039311302035210029358159615165091333675391005,
        21526503533429280966392593094949932105722060737862572179582474350057866930688,
        22616005108334998208888373407539051456988600368523,
        138521903175307636434294058242398758941602410109806
    ];

    var M = 91125930183199385026155961874833132762587307477754274831086764195748117360;

    signal x[69];
    signal y[69];
    signal z[69];

    // Predeclare all per-round intermediates
    signal nx[12];
    signal ny[12];
    signal nz[12];
    signal t[56];
    signal nx2[4];
    signal ny2[4];
    signal nz2[4];

    x[0] <== inputs[0];
    y[0] <== inputs[1];
    z[0] <== inputs[2];

    component powX[68];
    component powY[68];
    component powZ[68];

    // === 8 full rounds ===
    for (var i = 0; i < 8; i++) {
        powX[i] = CustomPow5();
        powY[i] = CustomPow5();
        powZ[i] = CustomPow5();

        nx[i] <== x[i] + C[i] + y[i] + z[i];
        ny[i] <== y[i] + C[i] + x[i] + z[i];
        nz[i] <== z[i] + C[i] + x[i] + y[i];

        powX[i].in <== nx[i];
        powY[i].in <== ny[i];
        powZ[i].in <== nz[i];

        x[i+1] <== powX[i].out;
        y[i+1] <== powY[i].out;
        z[i+1] <== powZ[i].out;
    }

    // === 56 partial rounds (only x updated) ===
    var base = 8;
    for (var i = 0; i < 56; i++) {
        powX[base + i] = CustomPow5();
        powX[base + i].in <== x[base + i] + C[4];
        t[i] <== powX[base + i].out;

        x[base + i + 1] <== t[i] + M * (y[base + i] + z[base + i]);
        y[base + i + 1] <== y[base + i];
        z[base + i + 1] <== z[base + i];
    }

    // === 4 final full rounds ===
    var start = base + 56;
    for (var i = 0; i < 4; i++) {
        var idx = 5 + i;
        powX[start + i] = CustomPow5();
        powY[start + i] = CustomPow5();
        powZ[start + i] = CustomPow5();

        nx2[i] <== x[start + i] + C[idx] + y[start + i] + z[start + i];
        ny2[i] <== y[start + i] + C[idx] + x[start + i] + z[start + i];
        nz2[i] <== z[start + i] + C[idx] + x[start + i] + y[start + i];

        powX[start + i].in <== nx2[i];
        powY[start + i].in <== ny2[i];
        powZ[start + i].in <== nz2[i];

        x[start + i + 1] <== powX[start + i].out;
        y[start + i + 1] <== powY[start + i].out;
        z[start + i + 1] <== powZ[start + i].out;
    }

    out <== x[68];
}

// === Wrappers ===
template CustomPoseidon2() {
    signal input inputs[2];
    signal output out;
    component h = CustomPoseidonT3x3();
    h.inputs[0] <== inputs[0];
    h.inputs[1] <== inputs[1];
    h.inputs[2] <== 0;
    out <== h.out;
}

template CustomPoseidon3() {
    signal input inputs[3];
    signal output out;
    component h = CustomPoseidonT3x3();
    h.inputs[0] <== inputs[0];
    h.inputs[1] <== inputs[1];
    h.inputs[2] <== inputs[2];
    out <== h.out;
}
