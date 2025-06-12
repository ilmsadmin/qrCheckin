import { gql, ApolloClient } from '@apollo/client';
import { 
  getToken, 
  getTokenTimeRemaining, 
  saveToken, 
  clearToken 
} from '../lib/auth-utils';

// GraphQL mutation for refreshing the token
const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      access_token
    }
  }
`;

class TokenRefreshService {
  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private apolloClient: ApolloClient<any> | null = null;
  private refreshThresholdMs: number = 5 * 60 * 1000; // 5 minutes before expiry

  // Initialize the service with an Apollo Client instance
  initialize(client: ApolloClient<any>) {
    this.apolloClient = client;
    this.scheduleTokenRefresh();
    
    // Add event listeners for window focus to check token
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.onWindowFocus);
    }
    
    return this; // For chaining
  }

  // Clean up when the service is no longer needed
  cleanup() {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.onWindowFocus);
    }
  }

  // Handle window focus - check token and refresh if needed
  private onWindowFocus = () => {
    console.log('Window focused, checking token status');
    this.scheduleTokenRefresh();
  };

  // Schedule a token refresh based on the current token's expiry time
  private scheduleTokenRefresh() {
    // Clear any existing timeout
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    const timeRemaining = getTokenTimeRemaining();
    
    // If no token or token expired, don't schedule refresh
    if (!timeRemaining) return;
    
    // Calculate when to refresh (threshold ms before expiry)
    const refreshIn = timeRemaining - this.refreshThresholdMs;
    
    if (refreshIn <= 0) {
      // Token is about to expire or has expired, refresh now
      this.refreshToken();
    } else {
      // Schedule refresh for later
      console.log(`Scheduling token refresh in ${Math.round(refreshIn / 1000)} seconds`);
      this.refreshTimeoutId = setTimeout(() => this.refreshToken(), refreshIn);
    }
  }

  // Actually perform the token refresh
  private async refreshToken() {
    if (!this.apolloClient) {
      console.error('Cannot refresh token: Apollo Client not initialized');
      return;
    }
    
    // Skip if no token
    if (!getToken()) return;
    
    try {
      console.log('Attempting to refresh token');
      const result = await this.apolloClient.mutate({
        mutation: REFRESH_TOKEN,
        fetchPolicy: 'no-cache'
      });
      
      const newToken = result.data?.refreshToken?.access_token;
      
      if (newToken) {
        console.log('Token refreshed successfully');
        saveToken(newToken);
        this.scheduleTokenRefresh(); // Schedule the next refresh
      } else {
        console.error('Token refresh failed: No token in response');
        clearToken();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      
      // If refresh fails, clear token and user will need to log in again
      clearToken();
      
      // Redirect to login page if configured
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  // Force an immediate token refresh
  forceRefresh() {
    return this.refreshToken();
  }
}

// Create singleton instance
const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
