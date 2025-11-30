import { ethers } from './ethers.umd.min.js'; // Ethers.js

// Load ABIs
const miningAbi = await (await fetch('mining_abi.json')).json();
const verifierAbi = await (await fetch('verifier_abi.json')).json();
const shieldAbi = await (await fetch('shield_abi.json')).json();

// Contract addresses
const SHIELD_ADDRESS = '0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0';
const VERIFIER_ADDRESS = '0x8E0D3ac4ef407551f0F1C802999bbF0f213219a7';
const MINING_VAULT_ADDRESS = '0x1CA1d59434e62288e9d3d58E64490C1b1bb130F0';
const PRIVX_ADDRESS = '0xYourPrivxTokenAddressHere'; // Replace with actual PRIVX token address

const provider = new ethers.providers.Web3Provider(window.ethereum);
const shieldContract = new ethers.Contract(SHIELD_ADDRESS, shield_abi, provider.getSigner());

document.getElementById('connect-wallet').addEventListener('click', async () => {
  await provider.send("eth_requestAccounts", []);
  const address = await provider.getSigner().getAddress();
  document.getElementById('wallet-status').innerText = `Connected: ${address}`;
  updateStats();
});

document.getElementById('deposit-btn').addEventListener('click', async () => {
  const idx = document.getElementById('denom-select').value;
  // Generate commitment off-chain (use Semaphore JS)
  const commitment = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('your-secret-commitment')); // Replace with Semaphore commitment
  const h = '0x0000000000000000000000000000000000000000000000000000000000000000'; // 0 for no commit
  await shieldContract.deposit(idx, commitment, h);
  document.getElementById('deposit-status').innerText = 'Deposit successful!';
});

document.getElementById('withdraw-btn').addEventListener('click', async () => {
  const n = document.getElementById('nullifier-input').value;
  // Generate ZK proof off-chain (use Semaphore JS)
  const proof = { a: [0,0], b: [[0,0],[0,0]], c: [0,0], p: [0,0,0,0] }; // Replace with real proof
  await shieldContract.withdraw(proof.d, n, proof.a, proof.b, proof.c, proof.p);
  document.getElementById('withdraw-status').innerText = 'Withdraw successful!';
});

async function updateStats() {
  const deposited = await shieldContract.totalDeposited();
  const burned = await shieldContract.totalBurned();
  document.getElementById('total-deposited').innerText = ethers.utils.formatEther(deposited);
  document.getElementById('total-burned').innerText = ethers.utils.formatEther(burned);
}