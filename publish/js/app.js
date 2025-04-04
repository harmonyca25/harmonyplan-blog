/**
 * app.js - Main Application Initialization for HarmonyPlan Blog Manager
 * 
 * This is the entry point for the application that initializes all
 * modules and sets up global event handlers.
 */

/**
 * Main application controller
 */
const App = {
  /**
   * Initialize the application
   */
  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeModules());
    } else {
      this.initializeModules();
    }
  },
  
  /**
   * Initialize all application modules
   */
  initializeModules() {
    console.log('HarmonyPlan Blog Manager v1.0.0 - Initializing...');
    
    try {
      // Initialize UI first for status messages
      UI.init();
      console.log('UI module initialized');
      
      // Initialize remaining modules
      Storage.keys; // Just access to ensure module is loaded
      console.log('Storage module initialized');
      
      GitHub.init();
      console.log('GitHub module initialized');
      
      Editor.init();
      console.log('Editor module initialized');
      
      ImageManager.init();
      console.log('ImageManager module initialized');
      
      // Log successful initialization
      console.log('HarmonyPlan Blog Manager initialized successfully!');
      UI.showSuccess('Blog manager loaded successfully', 2000);
      
      // Set up keyboard shortcuts hint system
      this.setupKeyboardShortcutsHint();
      
      // Set up error handling
      this.setupErrorHandling();
    } catch (error) {
      console.error('Initialization failed:', error);
      UI.showError('Initialization failed: ' + error.message);
    }
  },
  
  /**
   * Set up keyboard shortcuts hint system
   */
  setupKeyboardShortcutsHint() {
    // Show hints when pressing Alt+H
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        
        const shortcuts = [
          { key: 'Ctrl+S', action: 'Save as draft' },
          { key: 'Ctrl+P', action: 'Preview post' },
          { key: 'Alt+H', action: 'Show keyboard shortcuts' },
          { key: 'Tab (in editor)', action: 'Insert 2 spaces' }
        ];
        
        let message = 'Keyboard Shortcuts:\n\n';
        shortcuts.forEach(shortcut => {
          message += `${shortcut.key}: ${shortcut.action}\n`;
        });
        
        alert(message);
      }
    });
  },
  
  /**
   * Set up global error handling
   */
  setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
      UI.showError('An error occurred: ' + event.error.message);
      return false;
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      UI.showError('An error occurred: ' + event.reason.message);
      return false;
    });
  },
  
  /**
   * Sets up an auto-backup system for user data
   */
  setupAutoBackup() {
    // Run backup check every 10 minutes
    setInterval(() => {
      console.log('Running scheduled backup check...');
      
      // Check if we have any unsaved changes
      const drafts = Storage.loadDrafts();
      if (Object.keys(drafts).length > 0) {
        console.log('Auto-backup: Backing up drafts');
        
        // Auto-backup would be implemented with real backup in production
        localStorage.setItem('blogManagerBackup', JSON.stringify({
          timestamp: new Date().toISOString(),
          drafts: drafts
        }));
      }
    }, 10 * 60 * 1000); // 10 minutes
  }
};

// Initialize the application
App.init();
