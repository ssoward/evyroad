import { Router } from 'express';

const router = Router();

// GET /api/v1/users/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - to be implemented' });
});

// PUT /api/v1/users/profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - to be implemented' });
});

export default router;
