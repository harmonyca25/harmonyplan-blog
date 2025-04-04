/**
 * utils.js - Utility functions for the HarmonyPlan Blog Manager
 * 
 * This module contains reusable utility functions used across
 * the application, including formatting, validation, and helper methods.
 */

/**
 * Collection of utility functions for the application
 */
const Utils = {
  /**
   * Converts a post title to a URL-friendly slug
   * @param {string} title - The title to convert
   * @return {string} URL-friendly slug
   */
  titleToSlug(title) {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-")     // Replace spaces with hyphens
      .replace(/--+/g, "-")     // Replace multiple hyphens with single
      .trim();                  // Trim whitespace
  },

  /**
   * Formats a date as a folder name (e.g., "04Apr2025")
   * @param {Date} date - The date to format
   * @return {string} Formatted date string
   */
  formatDateFolder(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return day + month + year;
  },
  
  /**
   * Validates if the provided string is valid HTML content
   * @param {string} html - HTML content to validate
   * @return {boolean} True if the HTML is valid
   */
  validateHTML(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Check for parsing errors
      const errors = doc.querySelectorAll('parsererror');
      return errors.length === 0;
    } catch (error) {
      console.error('HTML validation error:', error);
      return false;
    }
  },
  
  /**
   * Validates if the provided string is valid JavaScript code
   * @param {string} jsCode - JavaScript code to validate
   * @return {Object} Validation result with isValid and error properties
   */
  validateJavaScript(jsCode) {
    try {
      // Try to parse the JS code
      new Function(jsCode);
      return { isValid: true, error: null };
    } catch (error) {
      return { 
        isValid: false, 
        error: `JavaScript error: ${error.message}` 
      };
    }
  },
  
  /**
   * Formats a date nicely for display
   * @param {Date} date - The date to format
   * @return {string} Formatted date string (e.g., "April 4, 2025")
   */
  formatDate(date) {
    return date.toLocaleDateString("en-US", {
      year: "numeric", 
      month: "long", 
      day: "numeric"
    });
  },
  
  /**
   * Creates a debounced function that delays invoking func until after wait ms
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @return {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Simple encryption for storing sensitive data in localStorage
   * Note: This is not secure for truly sensitive data, but provides
   * basic obfuscation for tokens
   * @param {string} text - Text to encrypt
   * @return {string} Encrypted string
   */
  encrypt(text) {
    return btoa(text.split('').map((char, index) => {
      return String.fromCharCode(char.charCodeAt(0) + ((index % 10) + 1));
    }).join(''));
  },
  
  /**
   * Decrypts a string encrypted with the encrypt method
   * @param {string} encrypted - Encrypted text
   * @return {string} Decrypted string
   */
  decrypt(encrypted) {
    try {
      const decoded = atob(encrypted);
      return decoded.split('').map((char, index) => {
        return String.fromCharCode(char.charCodeAt(0) - ((index % 10) + 1));
      }).join('');
    } catch (e) {
      console.error('Decryption failed:', e);
      return '';
    }
  },
  
  /**
   * Gets file extension from a filename
   * @param {string} filename - Name of the file
   * @return {string} Lowercase file extension without the dot
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
  },
  
  /**
   * Checks if a file is an image based on its extension
   * @param {string} filename - Name of the file
   * @return {boolean} True if the file is an image
   */
  isImageFile(filename) {
    const ext = this.getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  },
  
  /**
   * Generates a unique ID
   * @return {string} Unique ID string
   */
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

// Export the Utils object
window.Utils = Utils;
