import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/calendar/callback`
);

function getTokensFromCookie(req: NextApiRequest) {
  const tokenCookie = req.cookies.google_calendar_tokens;
  if (!tokenCookie) return null;
  
  try {
    const tokenString = Buffer.from(tokenCookie, 'base64').toString();
    return JSON.parse(tokenString);
  } catch (error) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tokens = getTokensFromCookie(req);
  
  if (!tokens) {
    return res.status(401).json({ message: 'Not authenticated with Google Calendar' });
  }

  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  if (req.method === 'GET') {
    // Check connection status
    try {
      await calendar.calendarList.list();
      res.json({ connected: true });
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      res.status(401).json({ connected: false, message: 'Calendar connection invalid' });
    }
  } else if (req.method === 'POST') {
    // Create calendar event
    const { summary, description, startDateTime, endDateTime, customerEmail } = req.body;

    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: 'America/New_York', // You can make this configurable
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'America/New_York',
        },
        attendees: customerEmail ? [{ email: customerEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
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
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({ message: 'Failed to create calendar event' });
    }
  } else if (req.method === 'DELETE') {
    // Delete calendar event
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      res.status(500).json({ message: 'Failed to delete calendar event' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}