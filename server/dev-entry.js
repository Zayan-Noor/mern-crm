/**
 * Dev bootstrap: optional in-memory MongoDB + optional soft seed, then start API.
 * Keeps MongoMemoryServer alive for the process lifetime.
 */
import 'dotenv/config';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (process.env.USE_MEMORY_DB === '1') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    globalThis.__mernMongoMemory = mongod;
    console.log('[CRM] In-memory MongoDB (USE_MEMORY_DB=1). No Docker or Atlas needed.');
  }

  if (!process.env.JWT_SECRET?.trim()) {
    process.env.JWT_SECRET = 'dev-jwt-secret-change-me-in-production-use-long-random-string';
  }

  if (!process.env.MONGO_URI?.trim()) {
    console.error('Missing MONGO_URI. Add it to server/.env or set USE_MEMORY_DB=1.');
    process.exit(1);
  }

  const seed = spawnSync(process.execPath, ['seed.js'], {
    cwd: __dirname,
    env: { ...process.env, SEED_ONLY_IF_EMPTY: '1' },
    stdio: 'inherit',
  });
  if (seed.status !== 0) process.exit(seed.status ?? 1);

  await import('./server.js');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
