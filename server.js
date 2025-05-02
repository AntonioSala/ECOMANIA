// File: server.js (posizionato in C:/Users/39351/OneDrive/Desktop/ECOMANIA)
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const UPDATE_INTERVAL = 10 * 60 * 1000;
let cache = {};
const cities = ['Milano', 'Roma', 'Napoli'];

app.use(cors());

async function updateData() {
  try {
    for (const city of cities) {
      const url = `https://api.openaq.org/v2/latest?city=${encodeURIComponent(city)}&limit=5`;
      const res = await fetch(url);
      const json = await res.json();
      cache[city] = json.results.flatMap(r => r.measurements.map(m => ({ parameter: m.parameter, value: m.value, unit: m.unit })));
    }
    console.log('Cache aggiornata:', new Date().toISOString());
  } catch (err) {
    console.error('Errore aggiornamento dati:', err);
  }
}

updateData();
setInterval(updateData, UPDATE_INTERVAL);

// Serve file statici dalla cartella attuale (ECOMANIA)
app.use(express.static(path.join(__dirname)));

app.get('/api/pollution', (req, res) => {
  const city = req.query.city || 'Milano';
  res.json({ city, measurements: cache[city] || [] });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
