'use client';

import { useState, useEffect } from 'react';
import { Plus, Bot, Trash2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Agent {
  id: string; name: string; type: string; description?: string;
  model: string; llmProvider: string; isActive: boolean; createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('chat');
  const [description, setDescription] = useState('');

  const fetchAgents = async () => {
    const data = await api.agents.list();
    setAgents(data as Agent[]);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.agents.create({ name, type, description });
    setName(''); setDescription('');
    setShowCreate(false);
    await fetchAgents();
  };

  const handleDelete = async (id: string) => {
    await api.agents.delete(id);
    await fetchAgents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Agents</h1>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-cyan-600 hover:bg-cyan-500">
          <Plus className="h-4 w-4 mr-2" /> New Agent
        </Button>
      </div>

      {showCreate && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white text-lg">Create Agent</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Agent name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500">
                <Bot className="h-4 w-4 mr-2" /> Create Agent
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-sm">{agent.name}</CardTitle>
                    <p className="text-xs text-slate-500">{agent.model}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                  {agent.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {agent.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{agent.description}</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-white flex-1">
                  <MessageSquare className="h-3 w-3 mr-1" /> Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(agent.id)}
                  className="border-slate-700 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && agents.length === 0 && (
          <p className="text-slate-500 col-span-full text-center py-8">No agents yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
