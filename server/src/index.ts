import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { flightsRouter } from './routes/flights.js';
import { priceCalendarRouter } from './routes/priceCalendar.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Allow multiple origins: local dev + production Vercel URL
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
}));

app.use(express.json());
app.use('/api/flights', flightsRouter);
app.use('/api/price-calendar', priceCalendarRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
