'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = isLogin
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, name });
      const token = response.accessToken;
      if (token) {
        api.setToken(token);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('No token received from server');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const result = await api.auth.googleAuth({
        googleIdToken: credentialResponse.credential,
      });
      api.setToken(result.accessToken);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseGoogle = async () => {
    setError('');
    try {
      const sb = await getSupabaseClient();
      if (!sb) throw new Error('Supabase client not initialized');
      const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Browser will redirect to Google — no further action needed
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Supabase Google sign-in failed');
    }
  };

  return (
    <Card className="glass border-white/80 animate-slide-up stagger-1">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-xl text-foreground">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isLogin ? 'Sign in to manage your AI agents' : 'Start building AI agents in minutes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 pr-10 focus-visible:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="w-full">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
                size="large"
                width="100%"
                theme="outline"
                text={isLogin ? 'signin_with' : 'signup_with'}
                shape="rectangular"
              />
            ) : (
              <p className="text-xs text-muted-foreground/60 text-center">
                Google sign-in not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable.
              </p>
            )}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">or sign in with Supabase</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-border hover:bg-indigo-50 hover:border-indigo-200 transition-all"
            onClick={handleSupabaseGoogle}
          >
            <Shield className="h-4 w-4 text-indigo-600" />
            Continue with Google (Supabase)
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-violet-50/60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8 animate-slide-up">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-heading font-bold text-foreground">AgentZero</span>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthForm />
          </GoogleOAuthProvider>
        ) : (
          <AuthForm />
        )}

        <p className="text-center text-xs text-muted-foreground/60 mt-6 animate-slide-up stagger-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
