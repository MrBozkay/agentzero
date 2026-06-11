'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Bot, Sparkles, BarChart3, Shield, Zap, Layers, ChevronRight, Star, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Hero3DScene = dynamic(() => import('@/components/Hero3DScene'), { ssr: false });

const features = [
  {
    icon: Bot,
    title: 'Agent Management',
    description: 'Create, configure, and manage AI agents with custom system prompts, tools, and LLM providers.',
    gradient: 'from-indigo-500 to-indigo-600',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track token consumption, costs, and performance across all your agents in real-time.',
    gradient: 'from-violet-500 to-violet-600',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Shield,
    title: 'Multi-LLM Support',
    description: 'Switch between OpenAI, Anthropic, DeepSeek, and local models — no vendor lock-in.',
    gradient: 'from-emerald-500 to-emerald-600',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Zero Setup',
    description: 'Deploy production-ready agents in minutes. No infrastructure, no DevOps, no hassle.',
    gradient: 'from-amber-500 to-amber-600',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Layers,
    title: 'Multi-Agent Orchestration',
    description: 'Chain multiple agents together for complex workflows — research, summarize, and act.',
    gradient: 'from-rose-500 to-rose-600',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Star,
    title: 'Enterprise Ready',
    description: 'Role-based access, audit logs, rate limiting, and SSO — built for teams at scale.',
    gradient: 'from-cyan-500 to-cyan-600',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
];

const pricing = [
  { plan: 'Free', price: '$0', period: 'forever', agents: '1 agent', tokens: '1K/mo', popular: false, cta: 'Get Started' },
  { plan: 'Starter', price: '$99', period: '/mo', agents: '5 agents', tokens: '50K/mo', popular: false, cta: 'Start Free Trial' },
  { plan: 'Growth', price: '$249', period: '/mo', agents: '20 agents', tokens: '200K/mo', popular: true, cta: 'Start Free Trial' },
  { plan: 'Scale', price: '$499', period: '/mo', agents: 'Unlimited', tokens: 'Unlimited', popular: false, cta: 'Contact Sales' },
];

const galleryItems = [
  { name: 'Customer Support Bot', model: 'GPT-4o', category: 'Chat', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { name: 'Data Analyzer', model: 'Claude 3.5', category: 'Analytics', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { name: 'Code Reviewer', model: 'DeepSeek Coder', category: 'DevOps', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { name: 'Lead Generator', model: 'GPT-4o', category: 'Sales', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { name: 'Research Assistant', model: 'Claude 3.5', category: 'Research', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { name: 'Content Writer', model: 'GPT-4o', category: 'Content', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsap: any, ScrollTrigger: any;
    let ctx: any;

    async function initGsap() {
      const module = await import('gsap');
      gsap = module.default;
      ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
      gsap.registerPlugin(ScrollTrigger);

      const fadeUp = (el: Element | null, delay = 0) => {
        if (!el) return;
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      };

      document.querySelectorAll('.reveal').forEach((el, i) => fadeUp(el, i * 0.05));
      document.querySelectorAll('.reveal-stagger > *').forEach((el, i) => fadeUp(el, i * 0.08));
    }

    initGsap();

    return () => {
      // cleanup handled by GSAP
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ════════════════════ HERO ════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0">
          <Hero3DScene />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.02] via-transparent to-violet-500/[0.02]" />
        </div>

        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight text-foreground">AgentZero</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign In</a>
              <a href="/auth">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200">
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto relative z-10 px-4 pt-24 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="reveal">
              <Badge className="mb-6 bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100" variant="secondary">
                <Zap className="h-3 w-3 mr-1.5" /> Zero Setup. Infinite Possibilities.
              </Badge>
            </div>
            <h1 className="reveal mb-6 text-4xl font-heading font-bold tracking-tight md:text-6xl lg:text-7xl">
              Deploy AI Agents in<br />
              <span className="text-gradient-warm">Zero Minutes</span>
            </h1>
            <p className="reveal mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              Build, deploy, and monitor AI agents without the infrastructure headache.
              From chatbots to lead generation — no coding required.
            </p>
            <div className="reveal flex flex-col sm:flex-row justify-center gap-3">
              <a href="/auth">
                <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 text-base px-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30">
                  Deploy Your First Agent <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-accent text-base px-8">
                View Docs
              </Button>
            </div>

            {/* Dashboard Preview */}
            <div className="reveal mt-16">
              <div className="glass rounded-2xl p-1 max-w-3xl mx-auto glow-indigo">
                <div className="rounded-xl bg-white/90 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-xs text-muted-foreground ml-2">agentzero.dev/dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Active Agents', value: '3' },
                      { label: 'Total Tokens', value: '12.4K' },
                      { label: 'Total Cost', value: '$0.042' },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg bg-indigo-50/50 p-3 text-left border border-indigo-100/50">
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-heading font-bold text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {['Customer Support Bot', 'Data Analyzer', 'Code Reviewer'].map(name => (
                      <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-indigo-100/50 hover:border-indigo-200/50 transition-colors">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">{name}</p>
                          <p className="text-[10px] text-muted-foreground">GPT-4o • Active</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section id="features" ref={featuresRef} className="border-t border-border py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-200">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">Why AgentZero?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Everything you need to build, deploy, and scale AI agents — without the complexity.
            </p>
          </div>
          <div className="reveal-stagger grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Card key={f.title} className="glass border border-white/80 hover:shadow-lg hover:border-indigo-200/50 transition-all duration-300 group">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <CardTitle className="font-heading text-foreground">{f.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ 3D GALLERY ════════════════════ */}
      <section id="gallery" ref={galleryRef} className="border-t border-border py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/30 via-transparent to-indigo-50/30 pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-50 text-violet-600 border-violet-200">3D Gallery</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">Agent Showcase</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Explore our collection of pre-built AI agents — ready to deploy in one click.
            </p>
          </div>
          <div className="reveal-stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {galleryItems.map((item, i) => (
              <div
                key={item.name}
                className={`relative rounded-2xl border ${item.color} p-6 backdrop-blur-sm bg-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
              >
                {/* 3D badge */}
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center shadow-sm">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-200/50">
                    <Bot className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.model}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/80 border border-border text-muted-foreground">
                    {item.category}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ PRICING ════════════════════ */}
      <section id="pricing" ref={pricingRef} className="border-t border-border py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/40 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-200">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, scale when you need to.</p>
          </div>
          <div className="reveal-stagger grid gap-5 md:grid-cols-4 max-w-5xl mx-auto">
            {pricing.map((p, i) => (
              <Card key={p.plan} className={`transition-all duration-300 ${
                p.popular
                  ? 'glass border-indigo-300 scale-[1.02] shadow-lg shadow-indigo-500/10'
                  : 'glass border-white/80 hover:border-indigo-200/50 hover:shadow-md'
              }`}>
                <CardHeader>
                  {p.popular && <Badge className="mb-2 w-fit bg-indigo-100 text-indigo-700 border-indigo-200">Most Popular</Badge>}
                  <CardTitle className="font-heading text-foreground">{p.plan}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold text-foreground">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {p.agents}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {p.tokens} tokens
                  </div>
                  <a href="/auth" className="block pt-2">
                    <Button className={`w-full ${
                      p.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}>
                      {p.cta}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA ════════════════════ */}
      <section ref={ctaRef} className="border-t border-border py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="reveal">
            <Card className="glass border-indigo-100/50 max-w-2xl mx-auto glow-indigo">
              <CardContent className="p-10 md:p-14">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 border border-indigo-200/50">
                  <Sparkles className="h-7 w-7 text-indigo-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">Ready to Deploy?</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Join hundreds of teams building AI agents with AgentZero. Start free, no credit card required.
                </p>
                <a href="/auth">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30">
                    Start Building Free <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="border-t border-border py-12 mt-auto bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-heading font-bold text-foreground">AgentZero</span>
                </div>
                <p className="text-xs text-muted-foreground">AI Agent Management Platform. Build, deploy, and monitor at scale.</p>
              </div>
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Gallery', 'Docs'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Status'] },
              ].map(col => (
                <div key={col.title}>
                  <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">{col.title}</p>
                  <div className="space-y-2">
                    {col.links.map(link => (
                      <a key={link} href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">&copy; 2026 AgentZero. All rights reserved.</p>
              <div className="flex items-center gap-3">
                <a href="https://github.com/mustafabozkaya/agentzero" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
