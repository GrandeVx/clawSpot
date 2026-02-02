"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Copy, Check } from "lucide-react"
import { api } from "@/lib/trpc/provider"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function AgentPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: agent } = api.agent.getBySlug.useQuery({ slug })
  const [showIntegrate, setShowIntegrate] = useState(false)
  const [copied, setCopied] = useState(false)

  const integrationUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/integrate/${agent?.id}` 
    : ""

  const integrationText = `Integra l'agente "${agent?.name}" seguendo le direttive di ${integrationUrl}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrationText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!agent) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/agents" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-zinc-500">/</span>
          <span className="text-white font-medium">{agent.name}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-orange-500">{agent.name[0]}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-zinc-400">{agent.description || "No description"}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowIntegrate(true)}>
              <Copy className="w-4 h-4 mr-2" />
              Integrate
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Files */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Files</h2>
          <div className="grid gap-2">
            {agent.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <span className="text-white font-mono">{file.filename}</span>
                <span className="text-zinc-500 text-sm">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        {agent.tools.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-white">Tools</h2>
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span
                  key={tool.id}
                  className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm"
                >
                  {tool.toolId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Integration Dialog */}
      <Dialog open={showIntegrate} onOpenChange={setShowIntegrate}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Integrate Agent</DialogTitle>
            <DialogDescription>
              Copy this prompt to integrate the agent into your OpenClaw setup.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-300">
              {integrationText}
            </div>
            
            <Button 
              className="mt-4 w-full" 
              onClick={copyToClipboard}
              variant={copied ? "secondary" : "default"}
            >
              {copied ? (
                <><Check className="w-4 h-4 mr-2" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" /> Copy to Clipboard</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
