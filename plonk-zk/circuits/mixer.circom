// SPDX-License-Identifier: MIT
pragma circom 2.1.6;

include "./circomlib/circuits/poseidon.circom";
include "switcher.circom";

// ============================================
// PrivX Mixer (PLONK-compatible)
// ============================================
template PrivXMixer(levels) {
    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathIndices[levels];
    signal input siblings[levels];

    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input denomination;

    // ============================================
    // Commitment = Poseidon2(nullifier, secret)
    // ============================================
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;

    signal currentHash[levels + 1];
    currentHash[0] <== commitmentHasher.out;

    // ============================================
    // Merkle proof path reconstruction
    // ============================================
    component switchers[levels];
    component levelHashers[levels];

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

    // ============================================
    // Nullifier hash = Poseidon3(nullifier, denomination, 0)
    // ============================================
    component nfHasher = Poseidon(3);
    nfHasher.inputs[0] <== nullifier;
    nfHasher.inputs[1] <== denomination;
    nfHasher.inputs[2] <== 0;

    // ============================================
    // Enforce equality constraints (critical)
    // ============================================
    root === currentHash[levels];
    nullifierHash === nfHasher.out;
}

// ============================================
// Main component
// ============================================
component main { public [root, nullifierHash, denomination] } = 
PrivXMixer(20);

