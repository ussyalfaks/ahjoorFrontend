import { Contract, RpcProvider, Account } from "starknet";
import { ROSCA_ABI } from "../constants/abi";

// Contract address
const CONTRACT_ADDRESS = "0x00e0c135d9d06c4980082181b46c8df69ec9f0a53abec0ce8a6af39b43960ea2";

// USDC token address on Starknet
const USDC_TOKEN_ADDRESS = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

async function registerUSDC() {
  try {
    // Setup provider
    const provider = new RpcProvider({
      nodeUrl: "https://starknet-mainnet.public.blastapi.io", // or your preferred RPC
    });

    // IMPORTANT: Replace these with your actual account details
    const accountAddress = "0x0569a08626C39C681118FEb54058F48136a351b23F1EDe84789c76019dBB056C";
    const privateKey = "0x057b48da2269c90f80490b6acaaad5b6fcedbb159c80533f41185d22351947b1";

    const account = new Account(provider, accountAddress, privateKey);

    // Create contract instance
    const contract = new Contract(ROSCA_ABI, CONTRACT_ADDRESS, account);

    console.log("Registering USDC token...");
    console.log("Contract:", CONTRACT_ADDRESS);
    console.log("USDC Address:", USDC_TOKEN_ADDRESS);

    // Call register_token
    const result = await contract.register_token(USDC_TOKEN_ADDRESS);
    
    console.log("Transaction hash:", result.transaction_hash);
    console.log("Waiting for confirmation...");

    // Wait for transaction to be accepted
    await provider.waitForTransaction(result.transaction_hash);

    console.log("✅ USDC token registered successfully!");

    // Verify registration
    const isSupported = await contract.is_token_supported(USDC_TOKEN_ADDRESS);
    console.log("Is USDC supported?", isSupported);

  } catch (error) {
    console.error("❌ Error registering USDC:", error);
    throw error;
  }
}

// Run the script
registerUSDC()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
