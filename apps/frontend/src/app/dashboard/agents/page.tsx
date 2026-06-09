'use client';

import { useState, useEffect } from 'react';
import { Plus, Bot, Trash2, MessageSquare, Search, Filter } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-cyan transition-all duration-300">
          <Plus className="h-4 w-4" /> New Agent
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="glass border-0 animate-scale-in">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Create New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Agent Name</label>
                  <Input
                    placeholder="e.g., Customer Support Bot"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Type</label>
                  <div className="flex gap-2">
                    {['chat', 'assistant', 'automation'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-all duration-200 ${
                          type === t
                            ? 'bg-primary text-primary-foreground border border-primary'
                            : 'bg-muted/50 text-muted-foreground border border-border hover:border-primary/30'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description <span className="text-muted-foreground">(optional)</span></label>
                <Input
                  placeholder="What does this agent do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Bot className="h-4 w-4 mr-2" /> Create Agent
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {!showCreate && agents.length > 0 && (
        <div className="relative animate-slide-up stagger-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass border-0 animate-pulse">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.05]" />
                  <div>
                    <div className="h-4 bg-white/[0.05] rounded w-28 mb-2" />
                    <div className="h-3 bg-white/[0.03] rounded w-16" />
                  </div>
                </div>
                <div className="h-3 bg-white/[0.03] rounded w-full mb-2" />
                <div className="h-3 bg-white/[0.03] rounded w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredAgents.length === 0 ? (
          <Card className="glass border-0 col-span-full">
            <CardContent className="py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">
                {searchQuery ? 'No agents match your search' : 'No agents yet'}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first AI agent to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Create Agent
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAgents.map((agent, i) => (
            <Card key={agent.id} className={`glass glass-hover border-0 animate-slide-up stagger-${Math.min(i + 1, 5)} transition-all duration-300 group`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/[0.06] flex items-center justify-center group-hover:border-primary/30 transition-all duration-300">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-sm font-medium">{agent.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{agent.model}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground border-border">
                    {agent.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {agent.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{agent.description}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.04] flex-1 transition-all duration-200">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(agent.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
