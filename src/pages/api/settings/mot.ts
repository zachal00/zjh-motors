import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ message: 'API key is required' });
    }

    // In a real application, you would encrypt and store this key securely.
    // For this example, we'll simulate setting it as an environment variable.
    // Note: This will not actually set the environment variable in a serverless environment.
    // A proper implementation would use a secure vault or a database.
    process.env.MOT_API_KEY = apiKey;

    console.log('MOT API Key updated (simulation)');

    res.status(200).json({ message: 'MOT API Key updated successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}