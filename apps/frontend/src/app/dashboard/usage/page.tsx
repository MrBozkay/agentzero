'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Cpu, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface UsageLog {
  id: string; tokensInput: number; tokensOutput: number; costUsd: number;
  agentId?: string; createdAt: string;
}
interface TotalUsage {
  totalTokensInput: number; totalTokensOutput: number; totalCostUsd: number;
}

export default function UsagePage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [total, setTotal] = useState<TotalUsage>({
    totalTokensInput: 0, totalTokensOutput: 0, totalCostUsd: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.usage.get().then((d: any) => setLogs(d || [])),
      api.usage.getTotal().then((d: any) => setTotal(d)),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Tokens In',
      value: loading ? '...' : total.totalTokensInput.toLocaleString(),
      icon: Cpu,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Tokens Out',
      value: loading ? '...' : total.totalTokensOutput.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Total Cost',
      value: loading ? '...' : `$${total.totalCostUsd.toFixed(4)}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-heading font-bold text-foreground">Usage</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your token consumption and costs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className={`glass glass-hover border-0 animate-slide-up stagger-${i + 1} transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Logs Table */}
      <Card className="glass border-0 animate-slide-up stagger-4">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">Usage History</CardTitle>
          <p className="text-xs text-muted-foreground">Recent token consumption logs</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] animate-pulse">
                  <div className="h-3 bg-white/[0.05] rounded w-24" />
                  <div className="h-3 bg-white/[0.05] rounded w-16 ml-auto" />
                  <div className="h-3 bg-white/[0.05] rounded w-16" />
                  <div className="h-3 bg-white/[0.05] rounded w-16" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">No usage data yet</p>
              <p className="text-muted-foreground/60 text-xs">Usage logs will appear here as you use your agents</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-medium text-xs">Date</th>
                    <th className="text-right py-3 text-muted-foreground font-medium text-xs">Tokens In</th>
                    <th className="text-right py-3 text-muted-foreground font-medium text-xs">Tokens Out</th>
                    <th className="text-right py-3 text-muted-foreground font-medium text-xs">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-foreground">{new Date(log.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right text-muted-foreground tabular-nums">{log.tokensInput.toLocaleString()}</td>
                      <td className="py-3 text-right text-muted-foreground tabular-nums">{log.tokensOutput.toLocaleString()}</td>
                      <td className="py-3 text-right text-emerald-400 tabular-nums">${log.costUsd.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
