"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, UserCircle2 } from "lucide-react"
import { useState } from "react"
import { useConnect, useAccount, type Connector, useDisconnect } from "@starknet-react/core"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const { connectors, connectAsync } = useConnect()

  const { account, isConnected } = useAccount()

  const handleConnect = async (connector: Connector) => {
    await connectAsync({ connector })
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 group">
          <img 
            src="/logo.png" 
            alt="Ahjoor Logo" 
            className="h-20 w-auto transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg group-hover:drop-shadow-cyan-500/50"
          />
        </div>

        {isConnected && account ? (
          <ProfileBar address={account.address} />
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 transition-all duration-300 rounded-lg font-medium text-white shadow-lg hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 border border-cyan-500/30"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <Dialog.Root open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-xl p-6 shadow-2xl border border-cyan-500/30 shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Connect Wallet
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-red-400 transition-colors duration-200 hover:scale-110">
                  <X />
                </button>
              </Dialog.Close>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              Choose a wallet to continue to your decentralized savings circle.
            </p>

            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600/80 via-blue-600/80 to-purple-600/80 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold transition-all duration-300 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02]"
                >
                  {connector.name}
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </nav>
  )
}

function ProfileBar({ address }: { address: string }) {
  const { disconnect } = useDisconnect()

  return (
    <div className="flex items-center space-x-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-slate-800/80 via-blue-900/80 to-purple-900/80 backdrop-blur-sm shadow-lg">
      <UserCircle2 className="w-5 h-5 text-cyan-400" />
      <span className="text-sm bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-medium">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        onClick={() => disconnect()}
        className="text-sm text-gray-400 hover:text-red-400 transition-colors duration-200 hover:scale-105 px-2 py-1 rounded hover:bg-red-500/10"
      >
        Disconnect
      </button>
    </div>
  )
}
