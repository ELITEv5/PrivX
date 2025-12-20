// SPDX-License-Identifier: MIT
pragma circom 2.1.6;

template Switcher() {
    signal input sel; // 0 or 1
    signal input L;
    signal input R;
    signal output outL;
    signal output outR;

    // Ensure sel is boolean (0 or 1)
    sel * (sel - 1) === 0;

    // Compute outL = (1 - sel) * L + sel * R
    signal diff;
    signal oneMinusSel;

    oneMinusSel <== 1 - sel;
    diff <== R - L;
    outL <== L + sel * diff;

    // Compute outR = (1 - sel) * R + sel * L
    outR <== R - sel * diff;
}

