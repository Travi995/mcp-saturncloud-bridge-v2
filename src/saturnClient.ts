export type SaturnClientOptions = { token: string; baseUrl?: string };

export class SaturnClient {
  private token: string;
  private baseUrl: string;

  constructor(opts: SaturnClientOptions) {
    this.token = opts.token;
    this.baseUrl = opts.baseUrl ?? 'https://api.saturncloud.io';
  }

  private url(path: string): string {
    if (!path.startsWith('/')) path = '/' + path;
    return this.baseUrl.replace(/\/$/, '') + path;
  }

  private async handle(res: Response) {
    const ct = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }

  async request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${this.token}`);
    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');

    const res = await fetch(this.url(path), { ...init, headers });
    return this.handle(res);
  }

  async get(path: string, query?: Record<string, string | number | boolean | undefined>) {
    let full = path;
    if (query) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v));
      const sep = path.includes('?') ? '&' : '?';
      full = path + sep + qs.toString();
    }
    return this.request(full, { method: 'GET' });
  }

  async post(path: string, body?: unknown) {
    return this.request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  async patch(path: string, body?: unknown) {
    return this.request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  }

  async put(path: string, body?: unknown) {
    return this.request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
  }

  async del(path: string) {
    return this.request(path, { method: 'DELETE' });
  }
}
