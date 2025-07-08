import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';

// Helper to create a new OAuth2 client
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/calendar/callback`
  );
};

// Helper to get tokens from the request cookie
function getTokensFromCookie(req: NextApiRequest): Credentials | null {
  const tokenCookie = req.cookies.google_calendar_tokens;
  if (!tokenCookie) return null;
  
  try {
    const tokenString = Buffer.from(tokenCookie, 'base64').toString();
    return JSON.parse(tokenString) as Credentials;
  } catch (error) {
    console.error("Failed to parse tokens from cookie:", error);
    return null;
  }
}

// Helper to save tokens to the response cookie
function saveTokensToCookie(res: NextApiResponse, tokens: Credentials) {
  const tokenString = JSON.stringify(tokens);
  const encodedTokens = Buffer.from(tokenString).toString('base64');
  // Set a long max-age because the refresh token allows for long-term access
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
  res.setHeader('Set-Cookie', `google_calendar_tokens=${encodedTokens}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${thirtyDaysInSeconds}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const originalTokens = getTokensFromCookie(req);
  
  if (!originalTokens) {
    return res.status(401).json({ message: 'Not authenticated with Google Calendar' });
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(originalTokens);

  // Listen for token refresh events to save the new tokens
  oauth2Client.on('tokens', (newTokens) => {
    const updatedTokens: Credentials = { ...originalTokens, ...newTokens };
    saveTokensToCookie(res, updatedTokens);
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    if (req.method === 'GET') {
      await calendar.calendarList.list({ maxResults: 1 });
      res.json({ connected: true });
    } else if (req.method === 'POST') {
      const { summary, description, startDateTime, endDateTime, customerEmail } = req.body;

      if (!summary || !startDateTime || !endDateTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const event = {
        summary,
        description,
        start: { dateTime: startDateTime, timeZone: 'America/New_York' },
        end: { dateTime: endDateTime, timeZone: 'America/New_York' },
        attendees: customerEmail ? [{ email: customerEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      res.json({ 
        success: true, 
        eventId: response.data.id,
        eventLink: response.data.htmlLink 
      });
    } else if (req.method === 'DELETE') {
      const { eventId } = req.body;

      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      res.json({ success: true });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Google Calendar API error:', error);
    // The token is likely expired or invalid. Clear it.
    res.setHeader('Set-Cookie', 'google_calendar_tokens=; Path=/; HttpOnly; Max-Age=0');
    res.status(401).json({ 
      connected: false, 
      message: 'Calendar connection invalid. Please reconnect.',
      error: (error as Error).message 
    });
  }
}