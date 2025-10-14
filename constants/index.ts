export const CONTRACT_ADDRESS = "0x01ae1f1e2e70b31022e65cbfcae57a4074afb92c96f55c5c2be64d91525e9c20";

// Token addresses on Starknet
export const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const USDC_TOKEN_ADDRESS = "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080";

// Token options for UI
export const TOKEN_OPTIONS = [
  { name: "STRK", address: STRK_TOKEN_ADDRESS, symbol: "STRK", decimals: 18 },
  { name: "USDC", address: USDC_TOKEN_ADDRESS || "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080", symbol: "USDC", decimals: 6 },
] as const;

// Helper to normalize address for comparison (handles different padding)
const normalizeAddress = (address: string): string => {
  try {
    // Convert to BigInt and back to hex to remove leading zeros
    return "0x" + BigInt(address).toString(16).toLowerCase();
  } catch {
    return address.toLowerCase();
  }
};

// Helper to get token info by address
export const getTokenByAddress = (address: string) => {
  const normalizedInput = normalizeAddress(address);
  return TOKEN_OPTIONS.find(
    (token) => normalizeAddress(token.address) === normalizedInput
  ) || { name: "Unknown", symbol: "Unknown", decimals: 18 };
};