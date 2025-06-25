import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/calendar/callback`
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?calendar_error=' + encodeURIComponent(error as string));
  }

  if (!code) {
    return res.status(400).json({ message: 'Authorization code not provided' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // In a real application, you would store these tokens securely in a database
    // For this demo, we'll store them in a cookie (not recommended for production)
    const tokenString = JSON.stringify(tokens);
    const encodedTokens = Buffer.from(tokenString).toString('base64');
    
    res.setHeader('Set-Cookie', [
      `google_calendar_tokens=${encodedTokens}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
    ]);

    // Redirect back to the settings page with success
    res.redirect('/?calendar_connected=true');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.redirect('/?calendar_error=token_exchange_failed');
  }
}