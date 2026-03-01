import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

export const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

interface FeaturedProjectFile {
  code: string;
}

export function loadFeaturedProjectCode(id: string): string {
  const filePath = join(process.cwd(), 'data', 'featured-projects', `${id}.json`);
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as FeaturedProjectFile;
  if (!parsed?.code) throw new Error(`Missing code in ${filePath}`);
  return parsed.code;
}

export async function compileEsp32(backendUrl: string, code: string): Promise<Record<string, unknown>> {
  const url = new URL(`${backendUrl}/api/v1/compile`);
  const payload = JSON.stringify({ code, board: 'wokwi-esp32-devkit-v1' });

  const data = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const requester = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = requester(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(raw) as Record<string, unknown>;
          } catch {
            reject(new Error(`Compile returned non-JSON response (${res.statusCode ?? 0}): ${raw}`));
            return;
          }

          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(`Compile failed (${res.statusCode}): ${JSON.stringify(parsed)}`));
            return;
          }

          resolve(parsed);
        });
      }
    );

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Compile request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  if (!data?.success) {
    throw new Error(`Compile unsuccessful: ${JSON.stringify(data)}`);
  }

  return data;
}
