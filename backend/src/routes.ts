// src/routes.ts
import { Router, Request, Response } from 'express';

const router = Router();

// Sample route for block height
router.get('/block_height', (req: Request, res: Response) => {
    const blockHeight = 1000; // Example response; replace with actual logic
    res.json({ height: blockHeight });
});

export const blockHeightRouter = router;
