import https from 'https';

const options = {
  method: "GET",
  hostname: "growagarden.gg",
  port: null,
  path: "/api/v1/items/Gag/all?page=1&limit=1000000&sortBy=position",
  headers: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    priority: "u=1, i",
    referer: "https://growagarden.gg/values",
    "Content-Length": "0",
  },
};

function fetchData() {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => {
        chunks.push(chunk);
      });
      res.on("end", () => {
        try {
          const body = Buffer.concat(chunks);
          const jsonResponse = JSON.parse(body.toString());
          delete jsonResponse.pagination;
          if (jsonResponse.items && Array.isArray(jsonResponse.items)) {
            jsonResponse.items.forEach(item => {
              delete item.id;
              delete item.trend;
            });
          }
          resolve(jsonResponse);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
    req.end();
  });
}

function filterItems(items, filters) {
  return items.filter(item => {
    const matchesCategory = filters.category ? item.category.toLowerCase() === filters.category.toLowerCase() : true;
    const matchesRarity = filters.rarity ? item.rarity.toLowerCase() === filters.rarity.toLowerCase() : true;
    const matchesName = filters.name ? item.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
    return matchesCategory && matchesRarity && matchesName;
  });
}

export default async function handler(req, res) {
  try {
    const data = await fetchData();
    const filters = {
      category: req.query.filter || req.query.category,
      rarity: req.query.rarity,
      name: req.query.name
    };
    const filtered = filterItems(data.items || [], filters);
    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Item data not available", details: err.message });
  }
} 