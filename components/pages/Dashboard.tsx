"use client"
import { useEffect, useState } from "react"
import { X, Users, DollarSign, Calendar, Clock, TrendingUp, Wallet } from "lucide-react"
import { ROSCA_ABI } from "@/constants/abi"
import { CONTRACT_ADDRESS, TOKEN_OPTIONS, getTokenByAddress, STRK_TOKEN_ADDRESS } from "@/constants"
import { useContract, useReadContract, useSendTransaction, useAccount } from "@starknet-react/core"
import { shortString, cairo, byteArray } from "starknet"

// Utility function to format STRK amounts from wei
const formatStrkAmount = (weiAmount: string): string => {
  const amount = BigInt(weiAmount)
  // Convert from wei (18 decimals) to STRK
  const strk = Number(amount) / 1e18
  // Format to avoid scientific notation and remove unnecessary decimal places
  return strk < 1 ? strk.toFixed(6).replace(/\.?0+$/, "") : strk.toString()
}

// Duration options for round duration dropdown
const DURATION_OPTIONS = [
  { label: "1 Day", value: 86400 },
  { label: "1 Week", value: 604800 },
  { label: "1 Month (30 days)", value: 2592000 },
] as const

// Utility function to format duration from seconds to user-friendly string
const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  if (days === 1) return "1 Day"
  if (days === 7) return "1 Week"
  if (days === 30) return "1 Month"
  if (days < 7) return `${days} Days`
  if (days % 7 === 0) return `${days / 7} Weeks`
  if (days >= 30) return `${Math.floor(days / 30)} Months`
  return `${days} Days`
}

 // Normalize organizer address to a hex string to safely slice for display
 const formatAddress = (addr: unknown): string => {
   if (typeof addr === "string") return addr
   try {
     const hex = "0x" + BigInt(addr as any).toString(16)
     return hex
   } catch {
     return String(addr)
   }
 }
 
 // Shorten an address safely for display
 const shortAddress = (addr: unknown): string => {
   const s = formatAddress(addr)
   if (!s) return "Unknown"
   return s.length >= 10 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s
 }

type Group = {
  id: string
  name: string
  description: string
  organizer: string
  numParticipants: number
  contributionAmount: string
  roundDuration: number
  currentRound: number
  isCompleted: boolean
  createdAt: number
  lastPayoutTime: number
  tokenAddress: string
}

export default function OverviewPage() {
  const { isConnected, account, address } = useAccount()
  const [groups, setGroups] = useState<Group[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    numParticipants: 2,
    contributionAmount: "",
    roundDuration: 86400, // 1 day in seconds (now a number)
    participantAddresses: [""],
    tokenAddress: STRK_TOKEN_ADDRESS, // Default to STRK
  })
  const { sendAsync } = useSendTransaction({ calls: [] })
  const { contract } = useContract({
    abi: ROSCA_ABI,
    address: CONTRACT_ADDRESS,
  })
  // ERC20 ABI for token approvals (reusable for any token)
  const ERC20_ABI = [
    {
      name: "approve",
      type: "function",
      inputs: [
        { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
        { name: "amount", type: "core::integer::u256" },
      ],
      outputs: [{ type: "core::bool" }],
      state_mutability: "external",
    },
  ] as const
  const { data: groupCount, isFetching } = useReadContract({
    abi: ROSCA_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "get_group_count",
    args: [],
  })

  // Fetch groups when group count changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!contract || !groupCount) return
      
      // If wallet is not connected, show no groups
      if (!isConnected || !address) {
        setGroups([])
        return
      }
      
      const count = Number(groupCount)
      const fetchedGroups = []
      for (let i = 1; i <= count; i++) {
        try {
          const groupInfo = await contract.get_group_info(i)
          
          // Check if the connected wallet is a participant of this group
          const isParticipant = await contract.is_participant(i, address)
          
          // Only show groups where the connected wallet is a member
          if (!isParticipant) {
            continue
          }
          
          // Try to decode ByteArray - check if it's already a string or needs conversion
          let name = "Unknown Group"
          let description = "No description"
          
          try {
            // If it's already a string, use it directly
            if (typeof groupInfo.name === 'string') {
              name = groupInfo.name
            } else if (groupInfo.name && typeof groupInfo.name === 'object') {
              // If it's a ByteArray object, convert it
              name = byteArray.stringFromByteArray(groupInfo.name)
            }
          } catch (e) {
            console.warn(`Could not decode name for group ${i}:`, e)
          }
          
          try {
            // If it's already a string, use it directly
            if (typeof groupInfo.description === 'string') {
              description = groupInfo.description
            } else if (groupInfo.description && typeof groupInfo.description === 'object') {
              // If it's a ByteArray object, convert it
              description = byteArray.stringFromByteArray(groupInfo.description)
            }
          } catch (e) {
            console.warn(`Could not decode description for group ${i}:`, e)
          }
          
          fetchedGroups.push({
            id: i.toString(),
            name,
            description,
            organizer: formatAddress(groupInfo.organizer),
            numParticipants: Number(groupInfo.num_participants),
            contributionAmount: groupInfo.contribution_amount.toString(),
            roundDuration: Number(groupInfo.round_duration),
            currentRound: Number(groupInfo.current_round),
            isCompleted: groupInfo.is_completed,
            createdAt: Number(groupInfo.created_at),
            lastPayoutTime: Number(groupInfo.last_payout_time),
            tokenAddress: formatAddress(groupInfo.token_address),
          })
        } catch (error) {
          console.error(`Error fetching group ${i}:`, error)
          // Skip corrupted groups
        }
      }
      setGroups(fetchedGroups)
    }
    fetchGroups()
  }, [contract, groupCount, isConnected, address])

  const createGroup = async () => {
    if (!contract) return
    // Validate form data
    if (!formData.name.trim()) {
      alert("Please enter a group name")
      return
    }
    if (!formData.description.trim()) {
      alert("Please enter a group description")
      return
    }
    if (formData.numParticipants < 2) {
      alert("Number of participants must be at least 2")
      return
    }
    if (!formData.contributionAmount || isNaN(Number(formData.contributionAmount))) {
      alert("Please enter a valid contribution amount")
      return
    }
    if (formData.roundDuration <= 0) {
      alert("Round duration must be greater than 0")
      return
    }
    const validAddresses = formData.participantAddresses.filter((addr) => addr.trim() !== "")
    if (validAddresses.length < formData.numParticipants - 1) {
      alert("Please enter enough participant addresses")
      return
    }
    try {
      // Get token info for decimal conversion
      const selectedToken = TOKEN_OPTIONS.find(t => t.address === formData.tokenAddress)
      const decimals = selectedToken?.decimals || 18
      const contributionAmountWei = BigInt(Math.floor(Number(formData.contributionAmount) * Math.pow(10, decimals)))
      
      const calls = (contract as any).populate("create_group", [
        formData.name,
        formData.description,
        formData.numParticipants,
        contributionAmountWei,
        formData.roundDuration,
        validAddresses,
        formData.tokenAddress,
      ])
      if (calls) {
        await sendAsync([calls])
        alert("Savings group created successfully!")
        setIsCreateModalOpen(false)
        setFormData({
          name: "",
          description: "",
          numParticipants: 2,
          contributionAmount: "",
          roundDuration: 86400,
          participantAddresses: [""],
          tokenAddress: STRK_TOKEN_ADDRESS,
        })
      }
    } catch (error) {
      console.error("Error creating group:", error)
      alert("Failed to create group.")
    }
  }

  const contribute = async (groupId: string) => {
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert("Please connect your wallet to make a contribution.")
      return
    }
    
    if (!contract) return
    try {
      const groupInfo = await contract.get_group_info(BigInt(groupId))
      const contributionAmount = groupInfo.contribution_amount
      const tokenAddress = formatAddress(groupInfo.token_address)
      const tokenInfo = getTokenByAddress(tokenAddress)
      
      // Format amount based on token decimals
      const amountDisplay = Number(contributionAmount.toString()) / Math.pow(10, tokenInfo.decimals)
      const confirmed = confirm(
        `Are you sure you want to contribute ${amountDisplay.toFixed(tokenInfo.decimals === 6 ? 2 : 6)} ${tokenInfo.symbol} to this group? This will automatically approve and contribute in one transaction.`,
      )
      if (!confirmed) return
      
      // Construct approve call for the specific token
      const u256Amount = cairo.uint256(contributionAmount)
      const approveCall = {
        contractAddress: tokenAddress,
        entrypoint: "approve",
        calldata: [CONTRACT_ADDRESS, u256Amount.low, u256Amount.high],
      }
      
      const contributeCall = (contract as any).populate("contribute", [BigInt(groupId)])
      
      if (approveCall && contributeCall) {
        await sendAsync([approveCall, contributeCall])
        alert("Contribution made successfully!")
      }
    } catch (error: any) {
      console.error("Error making contribution:", error)
      alert("Failed to make contribution. Please try again.")
    }
  }

  const claimPayout = async (groupId: string) => {
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert("Please connect your wallet to claim payout.")
      return
    }
    
    if (!contract) return
    try {
      const calls = (contract as any).populate("claim_payout", [BigInt(groupId)])
      if (calls) {
        await sendAsync([calls])
        alert("Payout claimed successfully!")
      }
    } catch (error: any) {
      console.error("Error claiming payout:", error)
      alert("Failed to claim payout. Please try again.")
    }
  }

  const handleNumParticipantsChange = (value: number) => {
    setFormData((prev) => {
      const newAddresses = [...prev.participantAddresses]
      if (value > newAddresses.length) {
        for (let i = newAddresses.length; i < value; i++) {
          newAddresses.push("")
        }
      } else if (value < newAddresses.length) {
        newAddresses.splice(value)
      }
      return { ...prev, numParticipants: value, participantAddresses: newAddresses }
    })
  }

  const updateParticipantAddress = (index: number, address: string) => {
    setFormData((prev) => {
      const newAddresses = [...prev.participantAddresses]
      newAddresses[index] = address
      return { ...prev, participantAddresses: newAddresses }
    })
  }

  const stats = {
    totalSaved: "$1000",
    activePools: groupCount ? Number(groupCount) : 8,
    nextPayout: "$50",
    completedCycles: groups.filter((g) => g.isCompleted).length || 12,
  }

  return (
      <div className="p-8 bg-black">
         <div className="relative overflow-hidden">
          <div className="absolute inset-0 " />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center space-y-8">
              {isConnected ? (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative px-8 py-4  bg-black transition-all duration-300 rounded-2xl font-bold text-white flex items-center mx-auto shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 to-blue-900 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative flex items-center">
                    Create New Savings Circle
                  </div>
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-slate-300 text-lg">Connect your wallet to create savings circles</p>
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl font-bold text-white flex items-center mx-auto cursor-not-allowed opacity-60">
                    <div className="relative flex items-center">
                      Connect Wallet to Create
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Saved</p>
            <p className="text-white text-2xl font-bold">{stats.totalSaved}</p>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>200%</span>
              <TrendingUp className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Active Pools</p>
            <p className="text-white text-2xl font-bold">{stats.activePools}</p>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>200%</span>
              <TrendingUp className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Next Payout</p>
            <p className="text-white text-2xl font-bold">{stats.nextPayout}</p>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>200%</span>
              <TrendingUp className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Completed Circles</p>
            <p className="text-white text-2xl font-bold">{stats.completedCycles}</p>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>200%</span>
              <TrendingUp className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>

        {/* Active Savings Section */}
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Active savings</h2>
        </div>

        {/* Savings Groups */}
        {isFetching ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              <p className="text-gray-400 text-lg">Loading your circles...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-xl p-16 text-center border border-white/10">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-white/5 rounded-2xl">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Savings Groups Found</h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
                  Create your first savings group to start saving together with others in the decentralized way.
                </p>
                {isConnected && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Create New Savings Circle
                  </button>
                )}
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${group.isCompleted ? "bg-gray-500" : "bg-green-500"}`} />
                      <div>
                        <h3 className="text-white text-lg font-semibold">{group.name}</h3>
                        <p className="text-gray-400 text-sm">
                          Created by {shortAddress(group.organizer)}
                        </p>
                      </div>
                    </div>
                    {group.currentRound === 1 && !group.isCompleted && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        Your turn
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Members</p>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white/5 rounded">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">{group.numParticipants}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs mb-2">Contributions</p>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white/5 rounded">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">
                          {(() => {
                            const tokenInfo = getTokenByAddress(group.tokenAddress)
                            const amount = Number(group.contributionAmount) / Math.pow(10, tokenInfo.decimals)
                            return `${amount.toFixed(tokenInfo.decimals === 6 ? 2 : 6)} ${tokenInfo.symbol}`
                          })()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs mb-2">Duration</p>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white/5 rounded">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">{formatDuration(group.roundDuration)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs mb-2">Current Rounds</p>
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-white/5 rounded">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold">
                          {group.currentRound}/{group.numParticipants}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    {!group.isCompleted && (
                      <>
                        <button
                          onClick={() => contribute(group.id)}
                          className="px-4 py-2 bg-[#4a6b7c] text-white rounded-lg text-sm font-medium hover:bg-[#5a7b8c] transition-colors"
                        >
                          Make Contribution ({(() => {
                            const tokenInfo = getTokenByAddress(group.tokenAddress)
                            const amount = Number(group.contributionAmount) / Math.pow(10, tokenInfo.decimals)
                            return `${amount.toFixed(tokenInfo.decimals === 6 ? 2 : 6)} ${tokenInfo.symbol}`
                          })()})
                        </button>
                        {group.currentRound === 1 && (
                          <button
                            onClick={() => claimPayout(group.id)}
                            className="px-4 py-2 bg-[#6b8a9c] text-white rounded-lg text-sm font-medium hover:bg-[#7b9aac] transition-colors"
                          >
                            Claim Reward
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Create New Savings Circle</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Circle Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white placeholder-gray-500"
                      placeholder="e.g., Family Savings Group"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white placeholder-gray-500"
                      rows={3}
                      placeholder="Brief description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Members</label>
                      <input
                        type="number"
                        min="2"
                        value={formData.numParticipants}
                        onChange={(e) => handleNumParticipantsChange(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                      <select
                        value={formData.roundDuration}
                        onChange={(e) => setFormData((prev) => ({ ...prev, roundDuration: Number(e.target.value) }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
                      >
                        {DURATION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-[#1a1a1a]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Token</label>
                      <select
                        value={formData.tokenAddress}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tokenAddress: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
                      >
                        {TOKEN_OPTIONS.map((token) => (
                          <option key={token.address} value={token.address} className="bg-[#1a1a1a]">
                            {token.name} ({token.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Contribution ({TOKEN_OPTIONS.find(t => t.address === formData.tokenAddress)?.symbol || 'Token'})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.contributionAmount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contributionAmount: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Participant Addresses</label>
                    <div className="space-y-2">
                      {formData.participantAddresses.map((address, index) => (
                        <input
                          key={index}
                          type="text"
                          value={address}
                          onChange={(e) => updateParticipantAddress(index, e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white placeholder-gray-500"
                          placeholder={`Participant ${index + 1} address`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-6 py-3 bg-white/5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createGroup}
                      className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Create Circle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
