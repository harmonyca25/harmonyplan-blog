/**
 * storage.js - Local Storage Management for HarmonyPlan Blog Manager
 * 
 * This module handles all interactions with the browser's localStorage,
 * including saving and loading settings and draft posts.
 */

/**
 * Storage manager for handling localStorage operations
 */
const Storage = {
  // Storage keys
  keys: {
    SETTINGS: 'blogManagerSettings',
    DRAFTS: 'blogManagerDrafts',
    POST_CACHE: 'blogManagerPostCache'
  },
  
  /**
   * Saves application settings to localStorage
   * @param {Object} settings - Settings object to save
   */
  saveSettings(settings) {
    try {
      // Encrypt the GitHub token for basic security
      if (settings.githubToken) {
        settings.githubToken = Utils.encrypt(settings.githubToken);
      }
      
      localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },
  
  /**
   * Loads application settings from localStorage
   * @return {Object} Settings object or default values
   */
  loadSettings() {
    try {
      const storedSettings = localStorage.getItem(this.keys.SETTINGS);
      if (!storedSettings) return this.getDefaultSettings();
      
      const settings = JSON.parse(storedSettings);
      
      // Decrypt the GitHub token if present
      if (settings.githubToken) {
        settings.githubToken = Utils.decrypt(settings.githubToken);
      }
      
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  },
  
  /**
   * Returns default settings values
   * @return {Object} Default settings
   */
  getDefaultSettings() {
    return {
      githubRepo: "harmonyca25/blog-posts",
      githubToken: "",
      githubBranch: "main",
      twitterLink: "https://twitter.com/harmonyplan",
      facebookLink: "https://facebook.com/harmonyplan",
      linkedinLink: "https://linkedin.com/company/harmonyplan"
    };
  },
  
  /**
   * Saves the current blog post draft to localStorage
   * @param {Object} draft - Draft post object
   */
  saveDraft(draft) {
    try {
      // Get existing drafts
      const drafts = this.loadDrafts();
      
      // Create a unique ID if this is a new draft
      if (!draft.id) {
        draft.id = Utils.generateUniqueId();
      }
      
      // Add timestamp
      draft.lastSaved = new Date().toISOString();
      
      // Update or add the draft
      drafts[draft.id] = draft;
      
      localStorage.setItem(this.keys.DRAFTS, JSON.stringify(drafts));
      return draft.id;
    } catch (error) {
      console.error('Error saving draft:', error);
      return null;
    }
  },
  
  /**
   * Loads all saved drafts from localStorage
   * @return {Object} Object containing all draft posts
   */
  loadDrafts() {
    try {
      const storedDrafts = localStorage.getItem(this.keys.DRAFTS);
      return storedDrafts ? JSON.parse(storedDrafts) : {};
    } catch (error) {
      console.error('Error loading drafts:', error);
      return {};
    }
  },
  
  /**
   * Loads a specific draft post by ID
   * @param {string} draftId - ID of the draft to load
   * @return {Object|null} Draft post object or null if not found
   */
  loadDraft(draftId) {
    const drafts = this.loadDrafts();
    return drafts[draftId] || null;
  },
  
  /**
   * Deletes a draft post by ID
   * @param {string} draftId - ID of the draft to delete
   * @return {boolean} True if successful
   */
  deleteDraft(draftId) {
    try {
      const drafts = this.loadDrafts();
      if (drafts[draftId]) {
        delete drafts[draftId];
        localStorage.setItem(this.keys.DRAFTS, JSON.stringify(drafts));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  },
  
  /**
   * Caches the posts data to reduce GitHub API calls
   * @param {Object} postsData - Posts data to cache
   */
  cachePostsData(postsData) {
    try {
      const cacheData = {
        timestamp: Date.now(),
        posts: postsData
      };
      
      localStorage.setItem(this.keys.POST_CACHE, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error caching posts:', error);
      return false;
    }
  },
  
  /**
   * Retrieves cached posts data if available and not expired
   * @param {number} maxAge - Maximum age of cache in milliseconds, defaults to 5 minutes
   * @return {Object|null} Cached posts data or null if unavailable/expired
   */
  getCachedPostsData(maxAge = 5 * 60 * 1000) {
    try {
      const cachedData = localStorage.getItem(this.keys.POST_CACHE);
      if (!cachedData) return null;
      
      const { timestamp, posts } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;
      
      // Return null if cache is older than maxAge
      if (age > maxAge) return null;
      
      return posts;
    } catch (error) {
      console.error('Error retrieving cached posts:', error);
      return null;
    }
  },
  
  /**
   * Clears all application data from localStorage
   * @return {boolean} True if successful
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.keys.SETTINGS);
      localStorage.removeItem(this.keys.DRAFTS);
      localStorage.removeItem(this.keys.POST_CACHE);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};

// Export the Storage object
window.Storage = Storage;
