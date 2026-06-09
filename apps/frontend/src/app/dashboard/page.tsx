'use client';

import { useState, useEffect } from 'react';
import { Bot, MessageSquare, BarChart3, ArrowRight, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Agent { id: string; name: string; type: string; model: string; createdAt: string; }
interface UsageData { totalTokensInput: number; totalTokensOutput: number; totalCostUsd: number; }

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [usage, setUsage] = useState<UsageData>({ totalTokensInput: 0, totalTokensOutput: 0, totalCostUsd: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.agents.list().then((d: any) => setAgents(d || [])),
      api.usage.getTotal().then((d: any) => setUsage(d)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalTokens = usage.totalTokensInput + usage.totalTokensOutput;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your agent overview.</p>
        </div>
        <Link href="/dashboard/agents">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-cyan transition-all duration-300">
            <Bot className="h-4 w-4" /> New Agent
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass glass-hover animate-slide-up stagger-1 border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground">
              {loading ? <span className="animate-pulse text-muted-foreground">—</span> : agents.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {agents.length > 0 ? `${agents.length} agent${agents.length > 1 ? 's' : ''} running` : 'No agents yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover animate-slide-up stagger-2 border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground">
              {loading ? <span className="animate-pulse text-muted-foreground">—</span> : totalTokens.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? 'Loading...' : `${usage.totalTokensInput.toLocaleString()} in / ${usage.totalTokensOutput.toLocaleString()} out`}
            </p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover animate-slide-up stagger-3 border-0 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground">
              {loading ? <span className="animate-pulse text-muted-foreground">—</span> : `$${usage.totalCostUsd.toFixed(4)}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {loading ? 'Loading...' : 'This month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Agents */}
      <Card className="glass animate-slide-up stagger-4 border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-foreground">Recent Agents</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Your latest AI agents</p>
          </div>
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.05]" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-white/[0.05] rounded w-32 mb-2" />
                    <div className="h-2.5 bg-white/[0.03] rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">No agents yet</p>
              <p className="text-muted-foreground/60 text-xs mb-4">Create your first AI agent to get started</p>
              <Link href="/dashboard/agents">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Bot className="h-3.5 w-3.5 mr-1.5" /> Create Agent
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.slice(0, 5).map((agent, i) => (
                <Link
                  key={agent.id}
                  href="/dashboard/agents"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group border border-transparent hover:border-white/[0.06]"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/[0.06] flex items-center justify-center group-hover:border-primary/30 transition-all duration-200">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.model}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
