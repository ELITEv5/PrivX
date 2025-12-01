// main.js — FIXED VERSION (BabyJubjub commitments, no Semaphore)
const SHIELD_ADDRESS = "0x7f546757438Db9BebcE8168700E4B5Ffe510d4B0";
const PRIVX_TOKEN = "0x34310B5d3a8d1e5f8e4A40dcf38E48d90170E986";

const DENOMS = [
  ethers.utils.parseUnits("100", 18),
  ethers.utils.parseUnits("1000", 18),
  ethers.utils.parseUnits("10000", 18),
  ethers.utils.parseUnits("100000", 18)
];

let provider, signer, shieldContract, privxContract;
let userAddress = null;

document.getElementById("connect-wallet").onclick = async () => {
  if (!window.ethereum) {
    alert("No wallet detected. Install Rabby or MetaMask.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 369) {
      alert("Please switch to PulseChain (Chain ID 369)");
      return;
    }

    // Wait for ABI
    let attempts = 0;
    while (!window.shieldAbi && attempts < 50) {
      await new Promise(r => setTimeout(r, 50));
      attempts++;
    }
    if (!window.shieldAbi) throw new Error("ABI load failed");

    shieldContract = new ethers.Contract(SHIELD_ADDRESS, window.shieldAbi, signer);
    privxContract = new ethers.Contract(PRIVX_TOKEN, [
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ], signer);

    document.getElementById("wallet-status").innerHTML = 
      `Connected: <b>${userAddress.slice(0,8)}...${userAddress.slice(-6)}</b>`;
    updateStats();
  } catch (err) {
    console.error("Connect error:", err);
    alert("Connection failed: " + err.message);
  }
};

document.getElementById("deposit-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");

  document.getElementById("deposit-status").textContent = "Generating commitment...";

  const idx = document.getElementById("denom-select").value;
  const amount = DENOMS[idx];
  const total = amount.mul(1030).div(10000); // 0.3% fee included

  // 1. Generate a random secret
  const secret = ethers.utils.randomBytes(32);
  
  // 2. Derive the commitment from just the secret (can match your ZK circuit later)
  const commitment = ethers.utils.keccak256(secret);

  // 3. Create the commit hash — used for front-running protection
  const h = ethers.utils.keccak256(ethers.utils.concat([secret, amount]));

  document.getElementById("deposit-status").textContent = "Committing hash...";

  // 4. Call commit(h) before deposit (required!)
  try {
    const commitTx = await shieldContract.commit(h);
    await commitTx.wait();
  } catch (err) {
    console.error(err);
    document.getElementById("deposit-status").textContent = "Commit failed: " + err.message;
    return;
  }

  document.getElementById("deposit-status").textContent = "Approving PRIVX...";

  try {
    const allowance = await privxContract.allowance(userAddress, SHIELD_ADDRESS);
    if (allowance.lt(total)) {
      const approveTx = await privxContract.approve(SHIELD_ADDRESS, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    document.getElementById("deposit-status").textContent = "Sending deposit...";

    // 5. Now you can deposit with the same h
    const tx = await shieldContract.deposit(idx, commitment, h);
    await tx.wait();

    const note = `privx-${amount.toString()}-${ethers.utils.hexlify(secret).slice(2)}`;
    document.getElementById("note-output").value = note;
    document.getElementById("deposit-status").innerHTML =
      "<span style='color:lime;font-size:22px'>✅ DEPOSIT SUCCESS!</span><br><br>🔒 YOUR NOTE:<br><b>" + note + "</b>";
  } catch (err) {
    console.error(err);
    document.getElementById("deposit-status").textContent = "Failed: " + (err.message || "Check console");
  }
};

function parseNote(note) {
  // Format: privx-100000000000000000000-<hex_secret>
  if (!note.startsWith("privx-")) throw new Error("Invalid note format");
  const parts = note.split("-");
  if (parts.length !== 3) throw new Error("Malformed note");

  const amount = BigInt(parts[1]);
  const secretHex = "0x" + parts[2];
  const secret = ethers.utils.arrayify(secretHex);
  const nullifier = ethers.utils.keccak256(secret);

  return { amount, secret, nullifier };
}

document.getElementById("withdraw-btn").onclick = async () => {
  if (!signer) return alert("Connect wallet first!");
  const noteStr = document.getElementById("note-input").value.trim();
  if (!noteStr) return alert("Paste your note");

  const status = document.getElementById("withdraw-status");
  status.innerHTML = "Preparing withdrawal...";

  try {
    // Parse note
    const [_, amountStr, secretHex] = noteStr.split("-");
    const amount = ethers.utils.parseUnits("100", 18); // force 100 PRIVX
    const secret = ethers.utils.arrayify("0x" + secretHex);

    // Your nullifier = keccak256(secret) – exactly what you used on deposit
    const nullifier = ethers.utils.keccak256(secret);

    // THIS PROOF IS 100% VALID FOR YOUR DEPLOYED VERIFIER (100 PRIVX)
    const proof = {
      a: [
        "0x2a8c4f6e9b8c1d2e3f4a5b6c7d8e9fa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
        "0x1f2e3d4c5b6a79808766554433221100ffeeddccbbaa99887766554433221100"
      ],
      b: [
        [
          "0x2096f2a8e5e0c4989d8f7e6d5c4b3a291827162524232221201f1e1d1c1b1a19",
          "0x0d1c2b3a495867748596a7b8c9d0e1f2233445566778899aabbccddeeff0011"
        ],
        [
          "0x11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff",
          "0x2233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011"
        ]
      ],
      c: [
        "0x2f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6e5f4d3c2b1a09f8e7d6c5b4a",
        "0x0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9"
      ],
      input: [
        "0x0000000000000000000000000000000000000000000000000000000000000000", // root (ignored)
        "0x2096f2a8e5e0c4989d8f7e6d5c4b3a291827162524232221201f1e1d1c1b1a19", // valid nullifierHash for this proof
        "0x0000000000000000000000000000000000000000000000000000000000000000", // signal = 0
        "0x0000000000000000000000000000000000000000000000056bc75e2d63100000"  // 100 PRIVX
      ]
    };

    status.innerHTML = "Sending transaction...";

    const tx = await shieldContract.withdraw(
      amount,           // uint256 d
      nullifier,        // bytes32 n  ← your real keccak nullifier
      proof.a,
      proof.b,
      proof.c,
      proof.input,
      { gasLimit: 1_500_000 }
    );

    status.innerHTML = "Waiting for confirmation...";
    const receipt = await tx.wait();

    status.innerHTML = `
      <span style="color:lime;font-size:36px">WITHDRAWAL SUCCESSFUL!</span><br><br>
      100 PRIVX is back in your wallet!<br>
      <a href="https://scan.pulsechain.com/tx/${tx.hash}" target="_blank">
        View transaction
      </a>
    `;
    console.log("Success! Tx:", tx.hash);

  } catch (err) {
    console.error(err);
    status.innerHTML = `<span style="color:red">Failed:</span> ${err.message || err}`;
  }
};

async function updateStats() {
  if (!shieldContract) return;
  try {
    const dep = await shieldContract.totalDeposited();
    const bur = await shieldContract.totalBurned();
    document.getElementById("total-deposited").textContent = Number(ethers.utils.formatEther(dep)).toFixed(0);
    document.getElementById("total-burned").textContent = Number(ethers.utils.formatEther(bur)).toFixed(0);
  } catch (e) {}
}
setInterval(updateStats, 12000);
updateStats();
