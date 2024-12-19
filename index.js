const express = require('express');
const app = express();

// require('dotenv').config();

const cors = require('cors');
const dns = require('dns');
const { URL } = require('url')


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlDatabase = new Map()
let counter = 1

function validateUrl(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err) => {
      if (err) reject('invalid url')
      else resolve()
    })
  })
}

app.post('/api/shorturl', async (req, res) => {
  let urlString = req.body.url
  let hostname

  try {
    const urlObject = new URL(urlString)
    hostname = urlObject.hostname

    for (const [key, value] of urlDatabase.entries()) {
      if (value === urlString) {
        return res.json({ original_url: urlString, short_url: parseInt(key) })
      }
    }

    await validateUrl(hostname)

    const shortUrl = counter++
    urlDatabase.set(shortUrl.toString(), urlString)

    return res.json({
      original_url: urlString,
      short_url: shortUrl,
    })
  } catch (err) {
    return res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const originalUrl = urlDatabase.get(req.params.short_url)

  if (!originalUrl) {
    return res.json({ error: 'No short url found' })
  }

  res.redirect(originalUrl)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
