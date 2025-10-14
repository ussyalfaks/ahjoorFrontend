import { Contract, RpcProvider } from "starknet";
import { ROSCA_ABI } from "../constants/abi";

const CONTRACT_ADDRESS = "0x00e0c135d9d06c4980082181b46c8df69ec9f0a53abec0ce8a6af39b43960ea2";

async function checkOwner() {
  // Try testnet first
  console.log("Checking on Sepolia Testnet...");
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io",
  });

  const contract = new Contract(ROSCA_ABI, CONTRACT_ADDRESS, provider);

  try {
    const owner = await contract.owner();
    console.log("Contract Owner:", owner.toString());
    console.log("\n📋 Copy this address and check if you have access to it in any wallet:");
    console.log("- ArgentX");
    console.log("- Braavos");
    console.log("- Or any other Starknet wallet you used");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkOwner();
