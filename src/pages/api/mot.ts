import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { registration } = req.query;

  if (!registration) {
    return res.status(400).json({ error: 'Registration number is required' });
  }

  const apiKey = process.env.MOT_API_KEY;
  const clientId = process.env.MOT_CLIENT_ID;
  const clientSecret = process.env.MOT_CLIENT_SECRET;

  if (!apiKey || !clientId || !clientSecret) {
    return res.status(500).json({ error: 'MOT API credentials are not fully configured' });
  }

  try {
    const response = await fetch(`https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${registration}`, {
      headers: {
        'x-api-key': apiKey,
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to fetch MOT data', details: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching MOT data:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}