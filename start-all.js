const { spawn } = require('child_process');
const path = require('path');

console.log('===================================================');
console.log('🚀 Starting Smart Mess Management System');
console.log('===================================================');

// Start backend
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit', 
  shell: true 
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit', 
  shell: true 
 });

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
