"use client";
import "./globals.css";
import { useCallback } from 'react';
import { sepolia, Chain } from '@starknet-react/chains';
import {
  argent,
  braavos,
  StarknetConfig,
  starkscan,
  useInjectedConnectors,
} from '@starknet-react/core';
import { jsonRpcProvider } from '@starknet-react/core';
import { ThemeProvider } from '../components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chains = [sepolia]; // Focus on Sepolia for testing
  const { connectors } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
  });

  const rpc = useCallback((_chain: Chain) => {
    // Use CORS-enabled RPC endpoints only
    const endpoints = [
      'https://starknet-sepolia.public.blastapi.io',
      'https://rpc.sepolia.starknet.io',
      'https://rpc.starknet-testnet.lava.build',
    ].filter(Boolean);

    return {
      nodeUrl: endpoints[Math.floor(Math.random() * endpoints.length)]
    };
  }, []);

  const provider = jsonRpcProvider({ 
    rpc
  });



  return (
    <html>
      <head>
        <title>AhjoorCircle - Decentralized Savings Circles</title>
        <meta name="description" content="Join trusted decentralized savings circles powered by blockchain." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="ahjoor-ui-theme">
          <StarknetConfig
            chains={chains}
            provider={provider}
            connectors={connectors}
            explorer={starkscan}
            autoConnect
          >
            {children}
          </StarknetConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
