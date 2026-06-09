export const api = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  auth: {
    register: (body: { email: string; password: string; name?: string }) =>
      api.request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      api.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },

  agents: {
    list: () => api.request('/agents'),
    create: (body: { name: string; type: string; description?: string }) =>
      api.request('/agents', { method: 'POST', body: JSON.stringify(body) }),
    get: (id: string) => api.request(`/agents/${id}`),
    update: (id: string, body: Partial<{ name: string; description: string }>) =>
      api.request(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) =>
      api.request(`/agents/${id}`, { method: 'DELETE' }),
  },

  conversations: {
    list: () => api.request('/conversations'),
    create: (body: { agentId: string }) =>
      api.request('/conversations', { method: 'POST', body: JSON.stringify(body) }),
    messages: (id: string) => api.request(`/conversations/${id}/messages`),
    sendMessage: (id: string, body: { role: string; content: string }) =>
      api.request(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
    close: (id: string) =>
      api.request(`/conversations/${id}/close`, { method: 'PATCH' }),
  },

  usage: {
    get: () => api.request('/usage'),
    getTotal: () => api.request('/usage/total'),
  },
};
