'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Sparkles, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Agent Management',
    description: 'Create, configure, and manage AI agents with custom system prompts, tools, and LLM providers.',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track token consumption, costs, and performance across all your agents in real-time.',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Multi-LLM Support',
    description: 'Switch between OpenAI, Anthropic, DeepSeek, and local models — no vendor lock-in.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
];

const pricing = [
  { plan: 'Free', price: '$0', period: 'forever', agents: '1 agent', tokens: '1K/mo', popular: false, cta: 'Get Started' },
  { plan: 'Starter', price: '$99', period: '/mo', agents: '5 agents', tokens: '50K/mo', popular: false, cta: 'Start Free Trial' },
  { plan: 'Growth', price: '$249', period: '/mo', agents: '20 agents', tokens: '200K/mo', popular: true, cta: 'Start Free Trial' },
  { plan: 'Scale', price: '$499', period: '/mo', agents: 'Unlimited', tokens: 'Unlimited', popular: false, cta: 'Contact Sales' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-purple-500/[0.04]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center glow-cyan">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight text-foreground">AgentZero</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign In</a>
            <a href="/auth" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 glow-cyan">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto relative px-4 text-center">
          <div className="animate-slide-up">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15" variant="secondary">
              <Zap className="h-3 w-3 mr-1.5" /> Zero Setup. Infinite Possibilities.
            </Badge>
          </div>
          <h1 className="mb-6 text-4xl font-heading font-bold tracking-tight md:text-6xl lg:text-7xl text-foreground animate-slide-up stagger-1">
            Deploy AI Agents in<br />
            <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Zero Minutes
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground animate-slide-up stagger-2">
            Build, deploy, and monitor AI agents without the infrastructure headache.
            From chatbots to lead generation — no coding required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 animate-slide-up stagger-3">
            <a href="/auth">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-300 text-base px-8">
                Deploy Your First Agent <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-border hover:bg-white/[0.04] text-foreground transition-all duration-200 text-base px-8">
              View Docs
            </Button>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-16 animate-fade-in stagger-5">
            <div className="glass rounded-2xl p-1 max-w-4xl mx-auto glow-cyan">
              <div className="rounded-xl bg-background/80 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  <span className="text-xs text-muted-foreground ml-2">agentzero.dev/dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Agents', value: '3' },
                    { label: 'Total Tokens', value: '12.4K' },
                    { label: 'Total Cost', value: '$0.042' },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-muted/30 p-3 text-left">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-heading font-bold text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {['Customer Support Bot', 'Data Analyzer', 'Code Reviewer'].map(name => (
                    <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{name}</p>
                        <p className="text-[10px] text-muted-foreground">GPT-4o • Active</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Why AgentZero?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to build, deploy, and scale AI agents — without the complexity.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Card key={f.title} className={`glass glass-hover border-0 transition-all duration-300 animate-slide-up stagger-${i + 1}`}>
                <CardHeader>
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 glow-cyan`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="font-heading text-foreground">{f.title}</CardTitle>
                  <CardDescription className="text-muted-foreground/80">{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free, scale when you need to.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-4 max-w-5xl mx-auto">
            {pricing.map((p, i) => (
              <Card key={p.plan} className={`transition-all duration-300 animate-slide-up stagger-${i + 1} ${
                p.popular
                  ? 'glass glow-purple border-primary/30 scale-[1.02]'
                  : 'glass glass-hover border-0'
              }`}>
                <CardHeader>
                  {p.popular && <Badge className="mb-2 w-fit bg-primary/10 text-primary border-primary/20">Most Popular</Badge>}
                  <CardTitle className="font-heading text-foreground">{p.plan}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold text-foreground">{p.price}</span>
                        <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {p.agents}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {p.tokens} tokens
                  </div>
                  <a href="/auth" className="block pt-2">
                    <Button className={`w-full ${p.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                      {p.cta}
                    </Button>
                  </a>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <Card className="glass border-0 max-w-2xl mx-auto glow-cyan">
            <CardContent className="p-10">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Ready to Deploy?</h2>
              <p className="text-muted-foreground mb-6">Join hundreds of teams building AI agents with AgentZero.</p>
              <a href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-300">
                  Start Building Free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-heading font-medium text-foreground">AgentZero</span>
          </div>
          <p>&copy; 2026 AgentZero. AI Agent Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
