/**
 * Creates server/.env and client/.env for local development if missing.
 * Uses Docker MongoDB on localhost:27017 by default.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const serverEnv = path.join(root, 'server', '.env');
const clientEnv = path.join(root, 'client', '.env');

const SERVER_TEMPLATE = `MONGO_URI=mongodb://127.0.0.1:27017/mern-crm
JWT_SECRET=dev-jwt-secret-change-me-in-production-use-long-random-string
PORT=5000
`;

const CLIENT_TEMPLATE = `VITE_API_URL=http://localhost:5000
`;

function writeIfMissing(filePath, contents) {
  if (fs.existsSync(filePath)) {
    console.log(`Skip (exists): ${path.relative(root, filePath)}`);
    return false;
  }
  fs.writeFileSync(filePath, contents, 'utf8');
  console.log(`Created: ${path.relative(root, filePath)}`);
  return true;
}

writeIfMissing(serverEnv, SERVER_TEMPLATE);
writeIfMissing(clientEnv, CLIENT_TEMPLATE);
console.log('\nNext: npm run docker:up   then   npm run seed');
