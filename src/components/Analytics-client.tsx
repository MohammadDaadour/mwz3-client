"use client";

import axios from 'axios';
import { TrackingFunction } from '@/libs/actions';

function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('analytics_session_id');
}

function storeSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('analytics_session_id', sessionId);
  const expirationTime = Date.now() + (30 * 60 * 1000);
  localStorage.setItem('analytics_session_expires', expirationTime.toString());
}

function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const expirationTime = localStorage.getItem('analytics_session_expires');
  if (!expirationTime) return true;
  return Date.now() > parseInt(expirationTime);
}

function clearExpiredSession(): void {
  if (typeof window === 'undefined') return;
  if (isSessionExpired()) {
    localStorage.removeItem('analytics_session_id');
    localStorage.removeItem('analytics_session_expires');
  }
}

export async function AnalyticsTracker(page: string, userAgent: string, ip: string) {
  // Guard against server-side execution
  if (typeof window === 'undefined') {
    return { response: null, error: 'Server-side execution' };
  }

  try {
    clearExpiredSession();
    let sessionId = getStoredSessionId();

    const response = await TrackingFunction({page, userAgent, ip, sessionId});
    
    const responseData = response.data;

    if (responseData.sessionId && responseData.sessionId !== sessionId) {
      storeSessionId(responseData.sessionId);
    }

    return { response: responseData, error: null };
  } catch (error: any) {
    return {
      response: null,
      error: error.response?.data || error.message
    };
  }
}