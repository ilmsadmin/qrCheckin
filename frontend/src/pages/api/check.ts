import type { NextApiRequest, NextApiResponse } from 'next';

// Simple API endpoint to check if API routing is working
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ status: 'ok', message: 'API routes are working' });
}
