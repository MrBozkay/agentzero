'use client';

import { useState, useEffect } from 'react';
import { Bot, MessageSquare, BarChart3, ArrowRight } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link href="/dashboard/agents">
          <Button className="bg-cyan-600 hover:bg-cyan-500">
            <Bot className="h-4 w-4 mr-2" /> New Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{loading ? '...' : agents.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400">Total Tokens</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {loading ? '...' : (usage.totalTokensInput + usage.totalTokensOutput).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-400">Total Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {loading ? '...' : `$${usage.totalCostUsd.toFixed(4)}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <p className="text-slate-500 text-sm">No agents yet. Create your first one!</p>
          ) : (
            <div className="space-y-2">
              {agents.slice(0, 5).map((agent) => (
                <Link key={agent.id} href={`/dashboard/agents`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{agent.name}</p>
                    <p className="text-slate-500 text-xs">{agent.model}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
