pragma circom 2.1.6;

include "poseidon.circom";
include "switcher.circom";

template PrivXMixer(levels) {
    signal input secret;
    signal input nullifier;
    signal input pathIndices[levels];
    signal input siblings[levels];

    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input denomination;

    // Commitment = Poseidon(nullifier, secret)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;

    // Start with commitment
    signal currentHash[levels + 1];
    currentHash[0] <== commitmentHasher.out;

    // Hash levels using Switcher for conditional order
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

    // Enforce computed root matches public root
    root === currentHash[levels];

    // nullifierHash = Poseidon(nullifier, denomination)
    component nfHasher = Poseidon(2);
    nfHasher.inputs[0] <== nullifier;
    nfHasher.inputs[1] <== denomination;
    nullifierHash === nfHasher.out;
}

// Public inputs: root, nullifierHash, denomination
component main { public [root, nullifierHash, denomination] } = 
PrivXMixer(20);
