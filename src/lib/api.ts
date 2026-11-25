import type {
  AuthUserInfo,
  ContactMessageData,
  PortfolioPayload,
} from '../types/portfolio.ts';

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}

export async function apiRequest<T>(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return parseJsonResponse<T>(res);
}

export async function fetchPublicPortfolio(
  token?: string | null,
  includeHidden = false
): Promise<PortfolioPayload> {
  const qs = includeHidden ? '?includeHidden=1' : '';
  return apiRequest<PortfolioPayload>(`/api/portfolio${qs}`, { token });
}

export async function fetchAdminBundle(token: string): Promise<{
  portfolio: PortfolioPayload;
  messages: ContactMessageData[];
}> {
  return apiRequest('/api/admin/portfolio', { token });
}

export async function fetchAuthUser(token: string): Promise<AuthUserInfo> {
  return apiRequest<AuthUserInfo>('/api/auth/me', { token });
}

export async function uploadPortfolioFile(
  file: File,
  category: string,
  token: string
): Promise<{
  id: number;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseJsonResponse(res);
}
