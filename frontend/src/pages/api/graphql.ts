import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// This proxy forwards all GraphQL requests to your backend API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
  console.log(`[API Proxy] Forwarding request to: ${apiUrl}`);
  
  return httpProxyMiddleware(req, res, {
    target: apiUrl.replace('/graphql', ''), // Remove /graphql as it will be added by the path
    pathRewrite: {
      '^/api/graphql': '/graphql', // Rewrite the path
    },
    changeOrigin: true,
  });
}

// Avoid Next.js trying to parse the body for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};
