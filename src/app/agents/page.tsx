"use client"

import Link from "next/link"
import { Search, Download, User } from "lucide-react"
import { api } from "@/lib/trpc/provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AgentsPage() {
  const { data } = api.agent.list.useQuery({ limit: 20 })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <nav className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Claw<span className="text-orange-500">Spot</span></span>
            </Link>
            <Button asChild>
              <Link href="/new">+ New Agent</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search agents..."
              className="pl-10 bg-zinc-900 border-zinc-800"
            />
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.slug}`}
              className="group p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-500">{agent.name[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 text-sm">
                  <Download className="w-4 h-4" />
                  {agent.downloads}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-500 transition-colors">
                {agent.name}
              </h3>

              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                {agent.description || "No description provided"}
              </p>

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <User className="w-4 h-4" />
                {agent.author.name || "Anonymous"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
