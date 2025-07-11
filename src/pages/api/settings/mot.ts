import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { apiKey, clientId, clientSecret, scopeUrl, tokenUrl } = req.body;

    if (!apiKey || !clientId || !clientSecret || !scopeUrl || !tokenUrl) {
      return res.status(400).json({ message: 'API key, client ID, client secret, scope URL, and token URL are required' });
    }

    // In a real application, you would encrypt and store these keys securely.
    // For this example, we'll simulate setting them as environment variables.
    // Note: This will not actually set the environment variables in a serverless environment.
    // A proper implementation would use a secure vault or a database.
    process.env.MOT_API_KEY = apiKey;
    process.env.MOT_CLIENT_ID = clientId;
    process.env.MOT_CLIENT_SECRET = clientSecret;
    process.env.MOT_SCOPE_URL = scopeUrl;
    process.env.MOT_TOKEN_URL = tokenUrl;

    console.log('MOT API settings updated (simulation)');

    res.status(200).json({ message: 'MOT API settings updated successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}