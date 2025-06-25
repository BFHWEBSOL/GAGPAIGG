import https from 'https';

function createOptions(path) {
  return {
    method: 'GET',
    hostname: 'growagardenstock.com',
    path: path,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    },
  };
}

function fetchStockData(path) {
  return new Promise((resolve, reject) => {
    const options = createOptions(path);
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Failed to parse JSON from upstream API"));
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

function extractCounts(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    const match = item.match(/\*\*x(\d+)\*\*/);
    return {
      name: item.replace(/\s*\*\*x\d+\*\*$/, "").trim(),
      stock: match ? parseInt(match[1], 10) : 0
    };
  });
}

export default async function handler(req, res) {
  try {
    const [mainStock, specialStock] = await Promise.all([
      fetchStockData('/api/stock'),
      fetchStockData('/api/special-stock')
    ]);

    res.status(200).json({
      Data: {
        updatedAt: mainStock.updatedAt || Date.now(),
        gear: extractCounts(mainStock.gear),
        seeds: extractCounts(mainStock.seeds),
        egg: extractCounts(mainStock.egg),
        honey: extractCounts(specialStock.honey),
        cosmetics: extractCounts(specialStock.cosmetics),
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock data", details: err.message });
  }
} 