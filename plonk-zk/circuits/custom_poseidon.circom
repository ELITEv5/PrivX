// SPDX-License-Identifier: MIT
pragma circom 2.1.6;

// Simple power-5 component
template Pow5() {
    signal input in;
    signal output out;

    signal x2;
    signal x4;

    x2 <== in * in;
    x4 <== x2 * x2;
    out <== x4 * in;
}

// Poseidon(2) — for commitments / Merkle hashing
template CustomPoseidon2() {
    signal input inputs[2];
    signal output out;

    signal t1;
    signal t2;
    signal t3;
    signal tmp1;
    signal tmp2;
    component p5[4];

    // Step 1
    t1 <== inputs[0] + inputs[1];
    p5[0] = Pow5();
    p5[0].in <== t1;
    tmp1 <== p5[0].out + inputs[0];

    // Step 2
    p5[1] = Pow5();
    p5[1].in <== tmp1;
    t2 <== p5[1].out + inputs[1];

    // Step 3
    p5[2] = Pow5();
    p5[2].in <== t2;
    tmp2 <== p5[2].out + inputs[0];

    // Step 4
    p5[3] = Pow5();
    p5[3].in <== tmp2;
    out <== p5[3].out + inputs[1];
}

// Poseidon(3) — for nullifier hash (nullifier, denom, 0)
template CustomPoseidon3() {
    signal input inputs[3];
    signal output out;

    signal t1;
    signal t2;
    signal t3;
    signal tmp1;
    signal tmp2;
    component p5[4];

    // Step 1
    t1 <== inputs[0] + inputs[1] + inputs[2];
    p5[0] = Pow5();
    p5[0].in <== t1;
    tmp1 <== p5[0].out + inputs[0];

    // Step 2
    p5[1] = Pow5();
    p5[1].in <== tmp1;
    t2 <== p5[1].out + inputs[1] + inputs[2];

    // Step 3
    p5[2] = Pow5();
    p5[2].in <== t2;
    tmp2 <== p5[2].out + inputs[0];

    // Step 4
    p5[3] = Pow5();
    p5[3].in <== tmp2;
    out <== p5[3].out + inputs[1] + inputs[2];
}

