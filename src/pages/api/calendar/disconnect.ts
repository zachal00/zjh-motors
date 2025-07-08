import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the authentication cookie by setting its Max-Age to 0
  res.setHeader('Set-Cookie', 'google_calendar_tokens=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  
  res.status(200).json({ message: 'Successfully disconnected' });
}