export const HURRICANE_ABI = [
  {
    "inputs": [
      { "internalType": "bytes", "name": "proof", "type": "bytes" },
      { "internalType": "bytes32[]", "name": "publicSignals", "type": "bytes32[]" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "proof", "type": "bytes" },
      { "internalType": "bytes32[]", "name": "publicSignals", "type": "bytes32[]" },
      { "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
