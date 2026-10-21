const { spawn } = require('child_process');
console.log("Dang chay ngrok...");
const ngrok = spawn('ngrok', ['http', '3000'], { shell: true, stdio: 'inherit' });
ngrok.on('close', (code) => {
  console.log(`ngrok tat ma: ${code}`);
});