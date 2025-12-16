pragma circom 2.1.6;

include "poseidon.circom";
include "switcher.circom";

// ────────────────────────────────────────────────
// Custom Poseidon3 Hasher (matches Solidity + JS PoseidonT3)
// ────────────────────────────────────────────────
template PoseidonT3() {
    signal input a;
    signal input b;
    signal input c;
    signal output out;

    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== a;
    poseidon.inputs[1] <== b;
    poseidon.inputs[2] <== c;

    out <== poseidon.out;
}

// ────────────────────────────────────────────────
// Main Mixer Template
// ────────────────────────────────────────────────
template PrivXMixer(levels) {
    signal input secret;
    signal input nullifier;
    signal input pathIndices[levels];
    signal input siblings[levels];

    signal input root;
    signal input nullifierHash;
    signal input denomination;

    // Commitment = Poseidon(nullifier, secret)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;

    signal currentHash[levels + 1];
    currentHash[0] <== commitmentHasher.out;

    component switchers[levels];
    component levelHashers[levels];

    // Merkle path reconstruction
    for (var i = 0; i < levels; i++) {
        switchers[i] = Switcher();
        switchers[i].sel <== pathIndices[i];
        switchers[i].L <== currentHash[i];
        switchers[i].R <== siblings[i];

        levelHashers[i] = Poseidon(2);
        levelHashers[i].inputs[0] <== switchers[i].outL;
        levelHashers[i].inputs[1] <== switchers[i].outR;

        currentHash[i + 1] <== levelHashers[i].out;
    }

    // Ensure Merkle root matches
    root === currentHash[levels];

    // Nullifier hash = PoseidonT3(nullifier, denomination, 0)
    component nfHasher = PoseidonT3();
    nfHasher.a <== nullifier;
    nfHasher.b <== denomination;
    nfHasher.c <== 0;
    nullifierHash === nfHasher.out;
}

// ────────────────────────────────────────────────
// Main entry point (public signals)
// ────────────────────────────────────────────────
component main { public [root, nullifierHash, denomination] } = PrivXMixer(20);
