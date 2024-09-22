const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const projectRoot = path.join(__dirname);
const reportsDir = path.join(projectRoot, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Sanitize the filename to remove invalid characters for Windows
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

app.post('/api/search', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const sanitizedUsername = sanitizeFilename(username);
  const jsonFilePath = path.join(reportsDir, `report_${sanitizedUsername}.json`);

  const command = `maigret ${username} --json ndjson --timeout 10`;

  const maigretProcess = spawn('powershell.exe', ['-Command', command], {
    cwd: projectRoot,
    shell: true,
    maxBuffer: 1024 * 1024 * 20,
  });

  let outputData = '';
  let errorData = '';

  maigretProcess.stdout.on('data', (data) => {
    outputData += data.toString();
    console.log(`Maigret Progress: ${data}`);
  });

  maigretProcess.stderr.on('data', (data) => {
    errorData += data.toString();
    console.error(`Error: ${data}`);
  });

  maigretProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Maigret finished with code ${code}`);
      
      // Parse the JSON data
      const results = outputData.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line))
        .filter(item => item.status && item.status.code === "CLAIMED")
        .map(item => ({
          site_name: item.site_name,
          url: item.url_user
        }));

      // Send the parsed results back to the client
      return res.status(200).json({ 
        message: 'Maigret finished successfully', 
        results: results
      });
    } else {
      console.error(`Maigret process exited with code ${code}`);
      return res.status(500).json({ error: `Maigret process exited with code ${code}`, details: errorData });
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});