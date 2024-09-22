const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const projectRoot = path.join(__dirname); // Root directory
const reportsDir = path.join(projectRoot, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Sanitize the filename to remove invalid characters for Windows
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Replace non-alphanumeric characters with underscores
};

app.post('/api/search', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Sanitize the username before using it in the filename
  const sanitizedUsername = sanitizeFilename(username);
  const jsonFilePath = path.join(reportsDir, `report_${sanitizedUsername}.json`);

  // PowerShell command to activate virtual environment and run Maigret
  const command = `maigret ${username} --json ndjson --timeout 10`;

  // Spawn the process to run Maigret in Windows using PowerShell
  const maigretProcess = spawn('powershell.exe', ['-Command', command], {
    cwd: projectRoot, // Ensure we are in the correct working directory
    shell: true,
    maxBuffer: 1024 * 1024 * 20, // Increase buffer size to handle large outputs
    stdio: 'inherit', // Inherit stdio to capture progress
  });

  let outputData = '';
  let errorData = '';

  // Capture stdout data to simulate progress
  maigretProcess.stdout.on('data', (data) => {
    outputData += data.toString();
    console.log(`Maigret Progress: ${data}`);
  });

  // Capture stderr data for error handling
  maigretProcess.stderr.on('data', (data) => {
    errorData += data.toString();
    console.error(`Error: ${data}`);
  });

  // On process completion
  maigretProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Maigret finished with code ${code}`);
      // Send a success response back to the client
      return res.status(200).json({ message: 'Maigret finished successfully', reportPath: jsonFilePath });
    } else {
      console.error(`Maigret process exited with code ${code}`);
      return res.status(500).json({ error: `Maigret process exited with code ${code}`, details: errorData });
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${5000}`);
});
