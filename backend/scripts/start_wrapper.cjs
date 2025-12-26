const { spawn } = require('child_process');

// The PORT environment variable is already populated by dotenv/config
// which is preloaded when running this script via:
// node -r dotenv/config scripts/start_wrapper.cjs

const command = 'cross-env';
const args = ['NODE_OPTIONS=--no-deprecation', 'next', 'start'];

// Use shell: true to resolve 'cross-env' from PATH
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
