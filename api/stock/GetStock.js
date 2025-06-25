import https from 'https';

export default async function handler(req, res) {
  const options = {
    method: 'GET',
    hostname: 'growagarden.gg',
    path: '/stocks',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    },
  };

  try {
    const data = await new Promise((resolve, reject) => {
      const req2 = https.request(options, (res2) => {
        let data = '';
        res2.on('data', (chunk) => { data += chunk; });
        res2.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error("Response is not valid JSON. Received: " + data.slice(0, 100)));
          }
        });
      });
      req2.on('error', (e) => reject(e));
      req2.end();
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch or parse stock data", details: err.message });
  }
} 