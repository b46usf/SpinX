/**
 * Crypto Utilities Module
 * Provides encryption/decryption for API payloads
 * Matches backend encryption utilities for compatibility
 * DRY and modular design
 */

class CryptoUtils {
  /**
   * Get encryption key from config or environment
   * @returns {string} Encryption key
   */
  static getEncryptionKey() {
    // Match backend key for compatibility
    return 'game-umkm-secret-key-2026-auth-backend';
  }

  /**
   * Normalize secret key to 32 characters
   * @param {string} key - Key to normalize
   * @returns {string} Normalized key
   */
  static normalizeSecret(key) {
    let source = (key || this.getEncryptionKey()).toString();
    if (!source) {
      source = this.getEncryptionKey();
    }
    while (source.length < 32) {
      source += this.getEncryptionKey();
    }
    return source.substring(0, 32);
  }

  /**
   * Convert bytes to hex
   * @param {Uint8Array} bytes - Bytes to convert
   * @returns {string} Hex string
   */
  static bytesToHex(bytes) {
    return Array.from(bytes).map(b => {
      const hex = (b < 0 ? b + 256 : b).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Compute HMAC-SHA256
   * @param {string} input - Input string
   * @param {string} key - Secret key
   * @returns {Promise<string>} Hex signature
   */
  static async hmacSha256(input, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.normalizeSecret(key));
    const inputData = encoder.encode(String(input));

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, inputData);
    return this.bytesToHex(new Uint8Array(signature));
  }

  /**
   * Encrypt data (matches backend encrypt)
   * @param {string} plainText - Data to encrypt
   * @returns {Promise<string>} Encrypted data
   */
  static async encrypt(plainText) {
    if (plainText === null || typeof plainText === 'undefined') {
      return null;
    }

    const value = String(plainText);
    const sig = (await this.hmacSha256(value, this.getEncryptionKey())).substring(0, 24);

    const payload = {
      data: value,
      sig: sig
    };

    return 'sig:' + btoa(JSON.stringify(payload));
  }

  /**
   * Decrypt data (matches backend decrypt)
   * @param {string} cipherText - Encrypted data
   * @returns {Promise<string>} Decrypted data
   */
  static async decrypt(cipherText) {
    if (!cipherText || !cipherText.startsWith('sig:')) {
      return null;
    }

    try {
      const encoded = cipherText.substring(4);
      const payload = JSON.parse(atob(encoded));

      if (!payload || typeof payload.data === 'undefined' || !payload.sig) {
        return null;
      }

      const expectedSig = (await this.hmacSha256(String(payload.data), this.getEncryptionKey())).substring(0, 24);

      if (payload.sig !== expectedSig) {
        throw new Error('Signature verification failed');
      }

      return String(payload.data);
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  /**
   * Encrypt object to JSON string
   * @param {Object} obj - Object to encrypt
   * @returns {Promise<string>} Encrypted object
   */
  static async encryptObject(obj) {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Decrypt string to object
   * @param {string} cipherText - Encrypted string
   * @returns {Promise<Object>} Decrypted object
   */
  static async decryptObject(cipherText) {
    const json = await this.decrypt(cipherText);
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if response data is encrypted
   * @param {Object} response - API response object
   * @returns {boolean} True if data is encrypted
   */
  static isEncrypted(response) {
    return response && typeof response.encryptedData === 'string';
  }

  /**
   * Decrypt API response if encrypted
   * @param {Object} response - API response object
   * @returns {Promise<Object>} Decrypted response
   */
  static async decryptResponse(response) {
    if (!this.isEncrypted(response)) {
      return response;
    }

    try {
      const decryptedData = await this.decryptObject(response.encryptedData);
      // Spread decrypted data into response, excluding encryptedData field
      return {
        ...response,
        ...decryptedData,
        encryptedData: undefined // Remove encrypted field
      };
    } catch (error) {
      console.error('Failed to decrypt response:', error);
      throw new Error('Response decryption failed');
    }
  }
}

export { CryptoUtils };