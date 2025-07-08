import { useState, useEffect, useCallback } from 'react';

interface CalendarEvent {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  customerEmail?: string;
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      
      if (response.ok) {
        setIsConnected(data.connected);
      } else {
        setIsConnected(false);
        // Don't set an error message here, as it might just mean "not connected yet"
      }
    } catch (err) {
      setIsConnected(false);
      setError('Failed to check connection status. The server might be down.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  const connectToGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calendar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.message || 'Failed to get authorization URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Google Calendar');
      setIsLoading(false);
    }
  }, []);

  const createCalendarEvent = useCallback(async (event: CalendarEvent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create calendar event');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (errorMessage.includes('reconnect')) {
        setIsConnected(false);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete calendar event');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      if (errorMessage.includes('reconnect')) {
        setIsConnected(false);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // This will clear the HttpOnly cookie by telling the server to expire it
    fetch('/api/calendar/disconnect').finally(() => {
      setIsConnected(false);
      setError(null);
    });
  }, []);

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