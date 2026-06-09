'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Cpu, DollarSign } from 'lucide-react';
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
    { label: 'Tokens In', value: loading ? '...' : total.totalTokensInput.toLocaleString(), icon: Cpu, color: 'text-cyan-400' },
    { label: 'Tokens Out', value: loading ? '...' : total.totalTokensOutput.toLocaleString(), icon: Cpu, color: 'text-purple-400' },
    { label: 'Total Cost', value: loading ? '...' : `$${total.totalCostUsd.toFixed(4)}`, icon: DollarSign, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Usage</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-slate-400">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Usage Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-slate-500 text-sm">No usage data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Tokens In</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Tokens Out</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800/50">
                      <td className="py-2 text-slate-300">{new Date(log.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-right text-slate-300">{log.tokensInput}</td>
                      <td className="py-2 text-right text-slate-300">{log.tokensOutput}</td>
                      <td className="py-2 text-right text-slate-300">${log.costUsd.toFixed(4)}</td>
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
