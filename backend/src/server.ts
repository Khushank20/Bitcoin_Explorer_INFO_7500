// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { blockHeightRouter } from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api', blockHeightRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
