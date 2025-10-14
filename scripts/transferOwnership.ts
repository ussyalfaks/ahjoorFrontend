import { Contract, RpcProvider, Account } from "starknet";
import { ROSCA_ABI } from "../constants/abi";

const CONTRACT_ADDRESS = "0x00e0c135d9d06c4980082181b46c8df69ec9f0a53abec0ce8a6af39b43960ea2";

async function transferOwnership() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io",
  });

  // IMPORTANT: Replace these with your CURRENT owner wallet credentials
  const currentOwnerAddress = "0x0569a08626c39c681118feb54058f48136a351b23f1ede84789c76019dbb056c";
  const currentOwnerPrivateKey = "0x057b48da2269c90f80490b6acaaad5b6fcedbb159c80533f41185d22351947b1"; // ⚠️ NEVER commit this!

  // NEW owner address (the wallet you want to transfer to)
  const newOwnerAddress = "YOUR_NEW_OWNER_ADDRESS_HERE";

  try {
    const account = new Account(provider, currentOwnerAddress, currentOwnerPrivateKey);
    const contract = new Contract(ROSCA_ABI, CONTRACT_ADDRESS, account);

    console.log("Current Owner:", currentOwnerAddress);
    console.log("Transferring ownership to:", newOwnerAddress);

    const result = await contract.transfer_ownership(newOwnerAddress);
    
    console.log("Transaction hash:", result.transaction_hash);
    console.log("Waiting for confirmation...");

    await provider.waitForTransaction(result.transaction_hash);

    console.log("✅ Ownership transferred successfully!");
    
    // Verify
    const owner = await contract.owner();
    console.log("New owner:", owner.toString());

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

transferOwnership();
