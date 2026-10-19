const USER_AGENT = "SobjiBazarCollector/0.1 (crop price research; low request rate)";

export function log(message: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status} for ${url}`);
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastError = err;
    }
    if (i < attempts) await sleep(2000 * i);
  }
  throw lastError;
}

export async function fetchText(url: string): Promise<string> {
  return (await request(url)).text();
}

export async function fetchBuffer(url: string): Promise<ArrayBuffer> {
  return (await request(url)).arrayBuffer();
}
