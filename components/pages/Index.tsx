"use client"

import { ArrowRight, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-2xl md:text-7xl font-bold text-white leading-tight">
              Save Together,
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                Grow Together
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join decentralized savings circles. Simple, secure, transparent.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center px-8 py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 rounded-full font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-6 text-lg border border-slate-600/50 rounded-full hover:bg-white/5 transition-all duration-300 text-slate-300 hover:text-white backdrop-blur-sm bg-white/5 hover:border-slate-500/70 hover:scale-105">
              Learn More
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 pt-16">
            <div className="group text-center space-y-4 p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-600/20 flex items-center justify-center mx-auto border border-green-400/30 group-hover:shadow-lg group-hover:shadow-green-400/25 transition-all duration-300">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Secure</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Blockchain protected with smart contract security
              </p>
            </div>

            <div className="group text-center space-y-4 p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-600/20 flex items-center justify-center mx-auto border border-blue-400/30 group-hover:shadow-lg group-hover:shadow-blue-400/25 transition-all duration-300">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Social</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Save with friends in trusted circles</p>
            </div>

            <div className="group text-center space-y-4 p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/20 to-violet-600/20 flex items-center justify-center mx-auto border border-purple-400/30 group-hover:shadow-lg group-hover:shadow-purple-400/25 transition-all duration-300">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Simple</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Easy to use decentralized interface</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
