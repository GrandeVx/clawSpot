import Link from "next/link"
import { ArrowRight, Github, Terminal, Zap, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Claw<span className="text-orange-500">Spot</span></span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/agents" className="text-zinc-400 hover:text-white transition-colors">
                Explore
              </Link>
              <Link href="https://github.com" className="text-zinc-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Button asChild>
                <Link href="/agents">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-zinc-400">Now in Public Beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            The Marketplace for
            <br />
            <span className="text-gradient">AI Agents</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Discover, share, and integrate OpenClaw agents. Build your AI workforce with pre-configured agents from the community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Link href="/agents" className="flex items-center gap-2">
                Explore Agents
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link href="/new">List Your Agent</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
