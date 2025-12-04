// zk.js — FINAL WORKING SEMAPHORE (CDN VERSION — NO IMPORTS, NO ERRORS)
console.log("zk.js loading...");

// Load Semaphore from CDN (no import needed)
const script = document.createElement('script');
script.type = 'module';
script.textContent = `
  import { Identity } from "https://cdn.jsdelivr.net/npm/@semaphore-protocol/identity@3.20.0/+esm";
  import { Group } from "https://cdn.jsdelivr.net/npm/@semaphore-protocol/group@3.20.0/+esm";
  import { generateProof } from "https://cdn.jsdelivr.net/npm/@semaphore-protocol/proof@3.20.0/+esm";

  window.SemaphoreIdentity = Identity;
  window.SemaphoreGroup = Group;
  window.generateSemaphoreProof = generateProof;

  window.generateDeposit = function() {
    const identity = new Identity();
    const commitment = identity.commitment.toString();
    const note = "privx-" + Date.now() + "-" + commitment.slice(-8);
    localStorage.setItem("hurricane_identity", identity.toString());
    localStorage.setItem("hurricane_note", note);
    return { commitment, note };
  };

  window.generateWithdrawProof = async function(recipient, denomination) {
    const idStr = localStorage.getItem("hurricane_identity");
    if (!idStr) throw new Error("No deposit found");
    const identity = new Identity(idStr);
    const group = new Group(20);
    group.addMember(identity.commitment);
    const scope = BigInt(denomination) * 10n**18n;
    return await generateProof(identity, group.generateMerkleProof(0), recipient, scope);
  };

  console.log("Semaphore loaded!");
`;
document.head.appendChild(script);
