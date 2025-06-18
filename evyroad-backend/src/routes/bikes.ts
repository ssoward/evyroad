import { Router } from 'express';

const router = Router();

// GET /api/v1/bikes
router.get('/', (req, res) => {
  res.json({ message: 'Get user bikes - to be implemented' });
});

// POST /api/v1/bikes
router.post('/', (req, res) => {
  res.json({ message: 'Add new bike - to be implemented' });
});

export default router;
