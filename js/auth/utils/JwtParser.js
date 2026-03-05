/**
 * JWT Parser Utility
 * Handles JWT token parsing
 */

const JwtParser = {
  /**
   * Parse JWT token
   */
  parse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  },

  /**
   * Extract user info from JWT
   */
  extractUserInfo(credential) {
    const payload = this.parse(credential);
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub
    };
  }
};

// Export for global use
window.JwtParser = JwtParser;

