export class ApiClient {
  baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
    }
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(body || `API ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  auth = {
    register: (body: { email: string; password: string; name?: string }) =>
      this.request<{ accessToken: string; user: { id: string; email: string; name: string } }>(
        '/auth/register', { method: 'POST', body: JSON.stringify(body) }
      ),
    login: (body: { email: string; password: string }) =>
      this.request<{ accessToken: string; user: { id: string; email: string; name: string } }>(
        '/auth/login', { method: 'POST', body: JSON.stringify(body) }
      ),
    googleAuth: (body: { googleIdToken: string }) =>
      this.request<{ accessToken: string; user: { id: string; email: string; name: string } }>(
        '/auth/google', { method: 'POST', body: JSON.stringify(body) }
      ),
    supabaseAuth: (body: { accessToken: string }) =>
      this.request<{ accessToken: string; user: { id: string; email: string; name: string } }>(
        '/auth/supabase', { method: 'POST', body: JSON.stringify(body) }
      ),
  };

  agents = {
    list: () => this.request<Agent[]>('/agents'),
    create: (body: { name: string; type: string; description?: string }) =>
      this.request<Agent>('/agents', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => this.request<Agent>(`/agents/${id}`),
    update: (id: string, body: Partial<{ name: string; description: string }>) =>
      this.request<Agent>(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) => this.request<void>(`/agents/${id}`, { method: 'DELETE' }),
  };

  conversations = {
    list: () => this.request<Conversation[]>('/conversations'),
    create: (body: { agentId: string }) =>
      this.request<Conversation>('/conversations', { method: 'POST', body: JSON.stringify(body) }),
    messages: (id: string) => this.request<Message[]>(`/conversations/${id}/messages`),
    sendMessage: (id: string, body: { role: string; content: string }) =>
      this.request<Message>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
    close: (id: string) => this.request<void>(`/conversations/${id}/close`, { method: 'PATCH' }),
  };

  usage = {
    get: () => this.request<UsageLog[]>('/usage'),
    getTotal: () => this.request<TotalUsage>('/usage/total'),
  };
}

export const api = new ApiClient();

// Types
export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  model: string;
  llmProvider: string;
  isActive: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface UsageLog {
  id: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  agentId?: string;
  createdAt: string;
}

export interface TotalUsage {
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUsd: number;
}
