import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function loadEnvFromFile(filename = '.env') {
  const envPath = path.resolve(process.cwd(), filename);

  if (!existsSync(envPath)) {
    return;
  }

  const source = readFileSync(envPath, 'utf8');
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
