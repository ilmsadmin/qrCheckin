import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
  
  try {
    console.log(`[Simple Proxy] Forwarding to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    
    // Forward response status and body
    res.status(response.status).json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    res.status(500).json({ 
      errors: [{ message: `Internal server error: ${error.message}` }] 
    });
  }
}
