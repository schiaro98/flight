import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { flightsRouter } from './routes/flights.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/flights', flightsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
