'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Sparkles, BarChart3, Shield, GitFork, LogIn } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Agent Management',
    description: 'Create, configure, and manage AI agents with custom system prompts, tools, and LLM providers.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track token consumption, costs, and performance across all your agents in real-time.',
  },
  {
    icon: Shield,
    title: 'Multi-LLM Support',
    description: 'Switch between OpenAI, Anthropic, DeepSeek, and local models — no vendor lock-in.',
  },
];

const pricing = [
  { plan: 'Free', price: '$0', agents: 1, tokens: '1K/mo', popular: false },
  { plan: 'Starter', price: '$99', agents: 5, tokens: '50K/mo', popular: false },
  { plan: 'Growth', price: '$249', agents: 20, tokens: '200K/mo', popular: true },
  { plan: 'Scale', price: '$499', agents: 'Unlimited', tokens: 'Unlimited', popular: false },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AgentZero</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">Log In</a>
            <a href="/auth" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Get Started</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto relative px-4 text-center">
          <Badge className="mb-4" variant="secondary">Zero Setup. Infinite Possibilities.</Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Deploy AI Agents in<br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Zero Minutes</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Build, deploy, and monitor AI agents without the infrastructure headache. 
            From chatbots to lead generation — no coding required.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              Deploy Your First Agent <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              <GitFork className="h-4 w-4 mr-2" /> GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why AgentZero?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 bg-muted/50">
                <CardHeader>
                  <f.icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Simple Pricing</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {pricing.map((p) => (
              <Card key={p.plan} className={`transition-shadow hover:shadow-lg ${p.popular ? 'border-primary' : ''}`}>
                <CardHeader>
                  {p.popular && <Badge className="mb-2 w-fit">Most Popular</Badge>}
                  <CardTitle>{p.plan}</CardTitle>
                  <div className="text-3xl font-bold">{p.price}</div>
                  <CardDescription>per month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm"><span className="font-medium">{p.agents}</span> {typeof p.agents === 'number' ? 'agents' : 'agents'}</p>
                  <p className="text-sm"><span className="font-medium">{p.tokens}</span> tokens</p>
                  <Button className="mt-4 w-full" variant={p.popular ? 'default' : 'outline'}>
                    {p.plan === 'Free' ? 'Get Started' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 AgentZero. AI Agent Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
