// Token and authentication utilities

/**
 * Constants for token storage
 */
export const AUTH_TOKEN_KEY = 'token';
export const USER_DATA_KEY = 'qr-checkin-user';
export const TOKEN_EXPIRY_KEY = 'token-expiry';

/**
 * Interface for token data
 */
export interface TokenData {
  token: string;
  expiresAt: number; // timestamp
}

/**
 * Parses a JWT token to extract its payload
 */
export function parseJwt(token: string): any {
  try {
    // Split the token and get the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Saves the authentication token to local storage with expiry information
 */
export function saveToken(token: string): void {
  if (!token) {
    console.warn('Attempted to save empty token');
    return;
  }

  try {
    // Parse the JWT to get expiry
    const payload = parseJwt(token);
    
    if (!payload || !payload.exp) {
      throw new Error('Invalid token format: missing expiration');
    }

    // Store the token
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // Store the expiry as a timestamp
    const expiryTimestamp = payload.exp * 1000; // Convert to milliseconds
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
    
    console.log(`Token saved, expires at: ${new Date(expiryTimestamp).toLocaleString()}`);
  } catch (error) {
    console.error('Error saving token:', error);
    // Still save the token even if we couldn't parse the expiry
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

/**
 * Gets the saved authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Removes the authentication token from storage
 */
export function clearToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Checks if the current token is valid and not expired
 */
export function isTokenValid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = getToken();
  if (!token) return false;
  
  // Check expiry
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) {
    // If we don't have expiry info, try to parse it from the token
    try {
      const payload = parseJwt(token);
      if (!payload || !payload.exp) return false;
      
      const expiryTimestamp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiryTimestamp;
    } catch (e) {
      return false;
    }
  }
  
  const expiry = parseInt(expiryStr, 10);
  return Date.now() < expiry;
}

/**
 * Gets token expiration time in milliseconds
 */
export function getTokenExpiryTime(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) {
    const token = getToken();
    if (!token) return null;
    
    // Try to parse from token
    try {
      const payload = parseJwt(token);
      if (!payload || !payload.exp) return null;
      return payload.exp * 1000; // Convert to milliseconds
    } catch (e) {
      return null;
    }
  }
  
  return parseInt(expiryStr, 10);
}

/**
 * Gets time remaining until token expiry in milliseconds
 */
export function getTokenTimeRemaining(): number | null {
  const expiry = getTokenExpiryTime();
  if (!expiry) return null;
  
  const remaining = expiry - Date.now();
  return remaining > 0 ? remaining : 0;
}
