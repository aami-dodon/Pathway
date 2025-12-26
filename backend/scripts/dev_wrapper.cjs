const { spawn } = require('child_process');

// The PORT environment variable is already populated by dotenv/config
// which is preloaded when running this script via:
// node -r dotenv/config scripts/dev_wrapper.js

const command = 'cross-env';
const args = ['NODE_OPTIONS=--no-deprecation', 'next', 'dev'];

// Use shell: true to resolve 'cross-env' from PATH (which pnpm sets up)
const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
});

child.on('exit', (code, signal) => {
    // If the child exited successfully, or was terminated by SIGINT (130),
    // we exit with 0 to prevent pnpm from displaying "ELIFECYCLE Command failed".
    // 130 is the standard exit code for a process terminated by SIGINT.
    if (code === 0 || code === 130 || signal === 'SIGINT') {
        process.exit(0);
    }
    process.exit(code || 1);
});

// Capture SIGINT in this wrapper process.
// We don't need to do anything because the child presumably receives it too
// (since stdio is inherited). We just keep running until the child exits.
process.on('SIGINT', () => {
    // Intentionally empty.
});
