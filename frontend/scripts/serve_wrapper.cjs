const { spawn } = require('child_process');
const path = require('path');

// The PORT environment variable is already populated by dotenv/config
// which is preloaded when running this script via:
// node -r dotenv/config scripts/serve_wrapper.cjs

// If PORT is not set in .env or environment, default to 9007
if (!process.env.PORT) {
    process.env.PORT = '9007';
}

// Standalone server.js is located in .next/standalone/server.js
const serverPath = path.join(process.cwd(), '.next/standalone/server.js');

const command = 'node';
const args = [serverPath];

const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
});

child.on('exit', (code, signal) => {
    if (code === 0 || code === 130 || signal === 'SIGINT') {
        process.exit(0);
    }
    process.exit(code || 1);
});

process.on('SIGINT', () => {
    // Intentionally empty.
});
