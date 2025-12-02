// tornado-api.js – Semaphore-powered, PRIVX-only (December 2025)
let wasmFile = "withdraw.wasm";
let zkeyFile = "withdraw_final.zkey";

async function generateDeposit() {
    const nullifier = window.crypto.getRandomValues(new Uint8Array(31));
    const secret = window.crypto.getRandomValues(new Uint8Array(31));

    const { poseidon } = await import("circomlibjs");
    const commitment = poseidon([nullifier, secret]);

    return {
        nullifier: nullifier,
        secret: secret,
        commitment: poseidon.F.toString(commitment),
        nullifierHash: poseidon.F.toString(poseidon([nullifier, secret]))
    };
}

async function generateProof({ commitment, merkleProof, recipient, relayer = 0, fee = 0, refund = 0 }) {
    const { groth16 } = await import("snarkjs");

    const input = {
        root: merkleProof.root,
        nullifierHash: merkleProof.nullifierHash,
        recipient: BigInt(recipient),
        relayer: BigInt(relayer),
        fee: BigInt(fee),
        refund: BigInt(refund),
        nullifier: merkleProof.nullifier,
        secret: merkleProof.secret,
        pathElements: merkleProof.siblings,
        pathIndices: merkleProof.pathIndices
    };

    const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFile);
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map(x => BigInt(x).toString());

    return {
        proof: [argv[0], argv[1], argv[2], argv[3], argv[4], argv[5], argv[6], argv[7]],
        publicSignals: {
            root: publicSignals[0],
            nullifierHash: publicSignals[1],
            recipient: publicSignals[2],
            relayer: publicSignals[3],
            fee: publicSignals[4],
            refund: publicSignals[5]
        }
    };
}

window.generateDeposit = generateDeposit;
window.generateProof = generateProof;
