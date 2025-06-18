import { Router } from 'express';

const router = Router();

// GET /api/v1/store/products
router.get('/products', (req, res) => {
  res.json({ message: 'Get store products - to be implemented' });
});

// POST /api/v1/store/orders
router.post('/orders', (req, res) => {
  res.json({ message: 'Create new order - to be implemented' });
});

export default router;
