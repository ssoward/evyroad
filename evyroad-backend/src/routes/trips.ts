import { Router } from 'express';

const router = Router();

// GET /api/v1/trips
router.get('/', (req, res) => {
  res.json({ message: 'Get user trips - to be implemented' });
});

// POST /api/v1/trips
router.post('/', (req, res) => {
  res.json({ message: 'Create new trip - to be implemented' });
});

export default router;
