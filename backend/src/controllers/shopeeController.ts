import shopeeService from '../services/shopeeService.js';
import { Request, Response } from 'express';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, limit = 20, offset = 0, sort } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const products = await shopeeService.searchProducts({ query, limit, offset });
    res.status(200).json({ success: true, platform: 'shopee', query, results: products, total: products.length });
  } catch (error: any) {
    console.error('[Shopee Controller] Search error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to search Shopee', platform: 'shopee' });
  }
};

export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });
    const details = await shopeeService.getProductDetails(productId);
    res.status(200).json({ success: true, platform: 'shopee', details });
  } catch (error: any) {
    console.error('[Shopee Controller] Details error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to get product details', platform: 'shopee' });
  }
};

export const compareProducts = async (req: Request, res: Response) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) return res.status(400).json({ error: 'Product IDs array is required' });
    const comparison = await shopeeService.compareProducts(productIds);
    res.status(200).json({ success: true, platform: 'shopee', comparison });
  } catch (error: any) {
    console.error('[Shopee Controller] Compare error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to compare products', platform: 'shopee' });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });
    const history = await shopeeService.getPriceHistory(productId);
    res.status(200).json({ success: true, platform: 'shopee', history });
  } catch (error: any) {
    console.error('[Shopee Controller] Price history error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to get price history', platform: 'shopee' });
  }
};

export const testConnection = async (req: Request, res: Response) => {
  try {
    const result = await shopeeService.testAPIConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error testing Shopee API' });
  }
};
