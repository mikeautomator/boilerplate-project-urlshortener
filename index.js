require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory database for URL storage
let urlDatabase = [];
let id = 1;

// Serve HTML file
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to handle URL shortening
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = url.parse(originalUrl);
  
  // Validate the URL
  if (!parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = id++;
    urlDatabase.push({ originalUrl, shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// API endpoint to handle redirection
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.shortUrl === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

