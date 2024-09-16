const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// Route to search Maigret
app.get('/api/search', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Run Maigret command
  exec(`python3 maigret ${username} --json ${username}.json`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error running Maigret' });
    }
    
    // Send back JSON result
    res.sendFile(`${__dirname}/${username}.json`);
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
