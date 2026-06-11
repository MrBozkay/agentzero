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

  const statCards = [
    {
      label: 'Active Agents', value: loading ? null : agents.length,
      desc: agents.length > 0 ? `${agents.length} agent${agents.length > 1 ? 's' : ''} running` : 'No agents yet',
      icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50',
    },
    {
      label: 'Total Tokens', value: loading ? null : totalTokens.toLocaleString(),
      desc: loading ? '...' : `${usage.totalTokensInput.toLocaleString()} in / ${usage.totalTokensOutput.toLocaleString()} out`,
      icon: MessageSquare, color: 'text-violet-600', bg: 'bg-violet-50',
    },
    {
      label: 'Total Cost', value: loading ? null : `$${usage.totalCostUsd.toFixed(4)}`,
      desc: 'This month',
      icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here&apos;s your agent overview.</p>
        </div>
        <Link href="/dashboard/agents">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-300">
            <Bot className="h-4 w-4" /> New Agent
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className={`glass border-white/80 hover:shadow-md hover:border-indigo-200/50 animate-slide-up stagger-${i + 1} transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold text-foreground">
                {loading ? <span className="animate-pulse text-muted-foreground">—</span> : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Agents */}
      <Card className="glass border-white/80 animate-slide-up stagger-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-foreground">Recent Agents</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Your latest AI agents</p>
          </div>
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 text-xs">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-muted-foreground/20" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-muted-foreground/20 rounded w-32 mb-2" />
                    <div className="h-2.5 bg-muted-foreground/20 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 border border-indigo-200">
                <Bot className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">No agents yet</p>
              <p className="text-muted-foreground/60 text-xs mb-4">Create your first AI agent to get started</p>
              <Link href="/dashboard/agents">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all duration-200 group border border-transparent hover:border-indigo-100"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-200/50 flex items-center justify-center group-hover:border-indigo-300/50 transition-all duration-200">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.model}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
