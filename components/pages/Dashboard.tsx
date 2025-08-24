"use client"
import { useEffect, useState } from "react"
import {
  X,
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react"
import { ROSCA_ABI } from "@/constants/abi"
import { CONTRACT_ADDRESS } from "@/constants"
import { useContract, useReadContract, useSendTransaction, useAccount } from "@starknet-react/core"

import { shortString } from "starknet"

// Utility function to format STRK amounts from wei
const formatStrkAmount = (weiAmount: string): string => {
  const amount = BigInt(weiAmount)
  // Convert from wei (18 decimals) to STRK
  const strk = Number(amount) / 1e18
  // Format to avoid scientific notation and remove unnecessary decimal places
  return strk < 1 ? strk.toFixed(6).replace(/\.?0+$/, '') : strk.toString()
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
  if (days === 1) return "1 day"
  if (days === 7) return "1 week"
  if (days === 30) return "1 month"
  if (days < 7) return `${days} days`
  if (days % 7 === 0) return `${days / 7} weeks`
  if (days >= 30) return `${Math.floor(days / 30)} months`
  return `${days} days`
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
}

const Dashboard = () => {
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
  })
  const { sendAsync } = useSendTransaction({ calls: [] })
  const { contract } = useContract({
    abi: ROSCA_ABI,
    address: CONTRACT_ADDRESS,
  })
  // STRK token contract for approvals
  const { contract: strkContract } = useContract({
    abi: [
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
    ],
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  })
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
      const count = Number(groupCount)
      const fetchedGroups = []
      for (let i = 1; i <= count; i++) {
        try {
          const groupInfo = await contract.get_group_info(i)
          fetchedGroups.push({
            id: i.toString(),
            name: shortString.decodeShortString(groupInfo.name.toString()),
            description: shortString.decodeShortString(groupInfo.description.toString()),
            organizer: groupInfo.organizer,
            numParticipants: Number(groupInfo.num_participants),
            contributionAmount: groupInfo.contribution_amount.toString(),
            roundDuration: Number(groupInfo.round_duration),
            currentRound: Number(groupInfo.current_round),
            isCompleted: groupInfo.is_completed,
            createdAt: Number(groupInfo.created_at),
            lastPayoutTime: Number(groupInfo.last_payout_time),
          })
        } catch (error) {
          console.error(`Error fetching group ${i}:`, error)
        }
      }
      setGroups(fetchedGroups)
    }
    fetchGroups()
  }, [contract, groupCount])

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
    const validAddresses = formData.participantAddresses.filter(addr => addr.trim() !== "")
    if (validAddresses.length < formData.numParticipants - 1) {
      alert("Please enter enough participant addresses")
      return
    }
    try {
      // Convert STRK amount to wei (18 decimals)
      const contributionAmountWei = BigInt(Math.floor(Number(formData.contributionAmount) * 1e18))
      const calls = (contract as any).populate("create_group", [
        shortString.encodeShortString(formData.name),
        shortString.encodeShortString(formData.description),
        formData.numParticipants,
        contributionAmountWei,
        formData.roundDuration,
        validAddresses,
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
        })
      }
    } catch (error) {
      console.error("Error creating group:", error)
      alert("Failed to create group.")
    }
  }

  const contribute = async (groupId: string) => {
    if (!contract || !strkContract) return
    try {
      const groupInfo = await contract.get_group_info(BigInt(groupId))
      const contributionAmount = groupInfo.contribution_amount
      const contributionAmountDisplay = formatStrkAmount(contributionAmount.toString())
      const confirmed = confirm(
        `Are you sure you want to contribute ${contributionAmountDisplay} STRK to this group? This will automatically approve and contribute in one transaction.`
      )
      if (!confirmed) return
      if (!strkContract || !contract) {
        alert("Contracts not available. Please refresh and try again.")
        return
      }
      const approveCall = (strkContract as any).populate("approve", [CONTRACT_ADDRESS, contributionAmount])
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
    if (!contract) return
    const calls = (contract as any).populate("claim_payout", [BigInt(groupId)])
    if (calls) {
      await sendAsync([calls])
      alert("Payout claimed successfully!")
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
    totalSaved: "$0",
    activePools: groupCount ? Number(groupCount) : 0,
    nextPayout: "$0",
    completedCycles: groups.filter((g) => g.isCompleted).length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <div className="pt-16">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
          <div className="relative container mx-auto px-4 py-16">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">
                    Decentralized Finance
                  </span>
                  <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-4">
                  Welcome to Ahjoor Savings
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Create and manage decentralized savings groups. Save together, earn together, powered by Starknet.
                </p>
              </div>
              {isConnected ? (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 rounded-2xl font-bold text-white flex items-center mx-auto shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative flex items-center">
                    <Sparkles className="w-5 h-5 mr-3" />
                    Create New Savings Circle
                    <Zap className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                  </div>
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-slate-300 text-lg">Connect your wallet to create savings circles</p>
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl font-bold text-white flex items-center mx-auto cursor-not-allowed opacity-60">
                    <div className="relative flex items-center">
                      <Sparkles className="w-5 h-5 mr-3" />
                      Connect Wallet to Create
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-2">Total Saved</p>
                <span className="text-3xl font-bold text-green-400">{stats.totalSaved}</span>
              </div>
            </div>
            <div className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-2">Active Pools</p>
                <span className="text-3xl font-bold text-blue-400">{stats.activePools}</span>
              </div>
            </div>
            <div className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-2">Next Payout</p>
                <span className="text-3xl font-bold text-purple-400">{stats.nextPayout}</span>
              </div>
            </div>
            <div className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <Zap className="h-4 w-4 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-2">Completed Cycles</p>
                <span className="text-3xl font-bold text-orange-400">{stats.completedCycles}</span>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Your Savings Groups
              </h2>
              <div className="h-px bg-gradient-to-r from-cyan-500/50 to-transparent flex-1" />
            </div>
            {isFetching ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
                  <p className="text-slate-300 text-lg">Loading your circles...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groups.length === 0 ? (
                  <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50" />
                    <div className="relative p-16 text-center">
                      <div className="mb-6">
                        <div className="inline-flex p-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl">
                          <Users className="w-12 h-12 text-slate-400" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">No Savings Groups Found</h3>
                      <p className="text-slate-400 text-lg max-w-md mx-auto">
                        Create your first savings group to start saving together with others in the decentralized way.
                      </p>
                    </div>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`relative h-4 w-4 rounded-full ${
                                group.isCompleted
                                  ? "bg-slate-500"
                                  : group.currentRound === 1
                                    ? "bg-gradient-to-r from-purple-400 to-pink-400"
                                    : "bg-gradient-to-r from-green-400 to-emerald-400"
                              }`}
                            >
                              <div
                                className={`absolute inset-0 rounded-full animate-pulse ${
                                  group.isCompleted
                                    ? "bg-slate-500"
                                    : group.currentRound === 1
                                      ? "bg-gradient-to-r from-purple-400 to-pink-400"
                                      : "bg-gradient-to-r from-green-400 to-emerald-400"
                                } opacity-50`}
                              />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{group.name}</h3>
                            {group.isCompleted && (
                              <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 rounded-full text-sm font-medium">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            {group.currentRound === 1 && !group.isCompleted && (
                              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                                <AlertCircle className="h-4 w-4 text-purple-400" />
                                <span className="text-purple-300 font-medium">Your Turn!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-300 mb-6 text-lg">{group.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm font-medium">Members</p>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users className="h-4 w-4 text-blue-400" />
                              </div>
                              <span className="text-white font-bold text-lg">{group.numParticipants}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm font-medium">Contribution</p>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="h-4 w-4 text-green-400" />
                              </div>
                              <span className="text-white font-bold text-lg">{formatStrkAmount(group.contributionAmount)} STRK</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm font-medium">Duration</p>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Calendar className="h-4 w-4 text-purple-400" />
                              </div>
                              <span className="text-white font-bold text-lg">
                                {formatDuration(group.roundDuration)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-400 text-sm font-medium">Current Round</p>
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Clock className="h-4 w-4 text-orange-400" />
                              </div>
                              <span className="text-white font-bold text-lg">
                                {group.currentRound}/{group.numParticipants}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                          {!group.isCompleted && (
                            <>
                              <button
                                onClick={() => contribute(group.id)}
                                className="px-6 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-white font-medium hover:scale-105"
                                title="Make sure you have enough STRK and have approved the contract"
                              >
                                Make Contribution ({formatStrkAmount(group.contributionAmount)} STRK)
                              </button>
                              {group.currentRound === 1 && (
                                <button
                                  onClick={() => claimPayout(group.id)}
                                  className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                                  <div className="relative flex items-center">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Claim Payout
                                  </div>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl" />
            <div className="relative p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Create New Savings Circle
                  </h2>
                  <p className="text-slate-400">Set up a decentralized savings group on Starknet</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Circle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-slate-400"
                    placeholder="e.g., Family Savings Group, Work Colleagues Fund"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-slate-400"
                    rows={3}
                    placeholder="Brief description of the circle's purpose..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">Number of Members</label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={formData.numParticipants}
                      onChange={(e) => handleNumParticipantsChange(Number(e.target.value))}
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">Contribution Amount (STRK)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.contributionAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contributionAmount: e.target.value }))}
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">Round Duration</label>
                    <select
                      value={formData.roundDuration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, roundDuration: Number(e.target.value) }))}
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">How often each member will contribute</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">Participant Addresses</label>
                  <div className="space-y-3">
                    {formData.participantAddresses.map((address, index) => (
                      <input
                        key={index}
                        type="text"
                        value={address}
                        onChange={(e) => updateParticipantAddress(index, e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all text-white placeholder-slate-400"
                        placeholder={`Participant ${index + 1} address`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">
                    Make sure to include your own address in the participant list.
                  </p>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createGroup}
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 font-bold rounded-xl text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Circle
                    </div>
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

export default Dashboard