import { Contract, RpcProvider, Account } from "starknet";
import { ROSCA_ABI } from "../constants/abi";

const CONTRACT_ADDRESS = "0x00e0c135d9d06c4980082181b46c8df69ec9f0a53abec0ce8a6af39b43960ea2";

// Current owner wallet
const CURRENT_OWNER = "0x0569a08626c39c681118feb54058f48136a351b23f1ede84789c76019dbb056c";

// New owner (your connected wallet)
const NEW_OWNER = "0x06af540afc89e0515e59fcf23678d19eb64e8510166468e2fd598802d976180a";

async function transferOwnership() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io",
  });

  // ⚠️ IMPORTANT: You need the PRIVATE KEY of the current owner wallet
  const currentOwnerPrivateKey = "0x057b48da2269c90f80490b6acaaad5b6fcedbb159c80533f41185d22351947b1";

  try {
    console.log("🔄 Transferring ownership...");
    console.log("From:", CURRENT_OWNER);
    console.log("To:", NEW_OWNER);

    const account = new Account(provider, CURRENT_OWNER, currentOwnerPrivateKey);
    const contract = new Contract(ROSCA_ABI, CONTRACT_ADDRESS, account);

    const result = await contract.transfer_ownership(NEW_OWNER);
    
    console.log("✅ Transaction sent:", result.transaction_hash);
    console.log("Waiting for confirmation...");

    await provider.waitForTransaction(result.transaction_hash);

    console.log("🎉 Ownership transferred successfully!");
    console.log("You can now use your connected wallet to manage the contract.");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

transferOwnership();
