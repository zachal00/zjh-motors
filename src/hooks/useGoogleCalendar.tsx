import { useState, useEffect } from 'react';

interface CalendarEvent {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  customerEmail?: string;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      setIsConnected(data.connected || false);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const connectToGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Google OAuth in a new window
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      setError('Failed to connect to Google Calendar');
      setIsLoading(false);
    }
  };

  const createCalendarEvent = async (event: CalendarEvent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create calendar event');
      }

      setIsLoading(false);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create calendar event');
      setIsLoading(false);
      throw error;
    }
  };

  const deleteCalendarEvent = async (eventId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete calendar event');
      }

      setIsLoading(false);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete calendar event');
      setIsLoading(false);
      throw error;
    }
  };

  const disconnect = () => {
    // Clear the authentication cookie by setting it to expire
    document.cookie = 'google_calendar_tokens=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsConnected(false);
  };

  return {
    isConnected,
    isLoading,
    error,
    connectToGoogle,
    createCalendarEvent,
    deleteCalendarEvent,
    disconnect,
    checkConnectionStatus,
  };
};