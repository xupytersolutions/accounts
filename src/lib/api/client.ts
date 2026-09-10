export class ApiError extends Error {
  status: number;
  issues?: Array<{ path: string; message: string }>;
  constructor(message: string, status: number, issues?: Array<{ path: string; message: string }>) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function parseJson(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { error: text }; }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await parseJson(res);
  if (!res.ok) {
    const msg = (data as { error?: string })?.error || res.statusText || "Request failed";
    throw new ApiError(msg, res.status, (data as { issues?: Array<{ path: string; message: string }> })?.issues);
  }
  return data as T;
}
