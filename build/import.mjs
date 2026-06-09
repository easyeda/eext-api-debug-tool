import { readFileSync } from 'fs';
import { createServer } from 'http';
import { resolve } from 'path';

const ext = JSON.parse(readFileSync(resolve(import.meta.dirname, '../extension.json'), 'utf-8'));
const eextName = `${ext.name}_v${ext.version}.eext`;
const eextPath = resolve(import.meta.dirname, 'dist', eextName);

// Find bridge port
let bridgePort = null;
for (let port = 49620; port <= 49629; port++) {
  try {
    const resp = await fetch(`http://localhost:${port}/health`);
    const data = await resp.json();
    if (data.service === 'easyeda-bridge') {
      bridgePort = port;
      break;
    }
  } catch (_) {}
}

if (!bridgePort) {
  console.error('Bridge not found. Please start the bridge server first.');
  process.exit(1);
}

console.log(`Bridge found on port ${bridgePort}`);
console.log(`Serving ${eextName}...`);

// Start temp HTTP server to host the .eext file
const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(readFileSync(eextPath));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const serverPort = server.address().port;
const fileUrl = `http://127.0.0.1:${serverPort}/${eextName}`;

console.log(`File hosted at ${fileUrl}`);

const code = `var r=await fetch("${fileUrl}");var b=await r.arrayBuffer();var f=new File([b],"p.eext",{type:"application/zip"});return await window.top._MSG_BUS2_EXTAPI_.rpcCall("extensionApi.importExtensionPackages",{files:[f],action:"import"},15000);`;

try {
  const resp = await fetch(`http://localhost:${bridgePort}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, timeout: 30000 }),
  });
  const result = await resp.json();
  console.log('Import result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Import failed:', e.message);
}

server.close();
console.log('Done.');
process.exit(0);
