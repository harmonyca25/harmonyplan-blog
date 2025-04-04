/**
 * ui.js - User Interface Management for HarmonyPlan Blog Manager
 * 
 * This module handles all UI-related functionality including tab switching,
 * message display, and general UI interactions.
 */

/**
 * UI manager for handling user interface interactions
 */
const UI = {
  // DOM Elements cache
  elements: {
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    errorMessage: document.getElementById('error-message'),
    successMessage: document.getElementById('success-message'),
    previewContainer: document.getElementById('preview-container'),
    codeOutput: document.getElementById('code-output'),
    connectionStatus: document.getElementById('connection-status'),
    monthList: document.getElementById('month-list')
  },
  
  /**
   * Initialize the UI components and event listeners
   */
  init() {
    this.setupTabNavigation();
    this.setupResponsiveHandling();
  },
  
  /**
   * Set up tab navigation event listeners
   */
  setupTabNavigation() {
    this.elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.showTab(targetTab);
      });
    });
  },
  
  /**
   * Set up responsive behavior handlers
   */
  setupResponsiveHandling() {
    // Adjust UI based on screen size
    const handleResize = Utils.debounce(() => {
      this.updateResponsiveUI();
    }, 250);
    
    window.addEventListener('resize', handleResize);
    // Initial responsive update
    this.updateResponsiveUI();
  },
  
  /**
   * Update UI components for responsive layout
   */
  updateResponsiveUI() {
    const isMobile = window.innerWidth <= 768;
    
    // Adjust button text for mobile
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
      // If button has a data-short-text attribute, use it on mobile
      const shortText = button.getAttribute('data-short-text');
      if (shortText && button.textContent !== shortText && isMobile) {
        button.setAttribute('data-full-text', button.textContent);
        button.textContent = shortText;
      } else if (!isMobile && button.getAttribute('data-full-text')) {
        button.textContent = button.getAttribute('data-full-text');
      }
    });
  },
  
  /**
   * Switch to the specified tab
   * @param {string} tabName - The name of the tab to show
   */
  showTab(tabName) {
    // Update active tab
    this.elements.tabs.forEach(tab => tab.classList.remove('active'));
    this.elements.tabContents.forEach(tc => tc.classList.remove('active'));
    
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Special handling for tabs
    if (tabName === 'preview') {
      // Signal to the editor module to generate preview content
      document.dispatchEvent(new CustomEvent('editor:generatePreview'));
    } else if (tabName === 'code') {
      // Signal to the editor module to generate code
      document.dispatchEvent(new CustomEvent('editor:generateCode'));
    }
  },
  
  /**
   * Display an error message to the user
   * @param {string} message - The error message to display
   * @param {number} duration - How long to show the message (ms), defaults to 4000
   */
  showError(message, duration = 4000) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.remove('hidden');
    
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.elements.errorMessage.classList.add('hidden');
    }, duration);
    
    // Scroll to the error message
    this.elements.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  
  /**
   * Display a success message to the user
   * @param {string} message - The success message to display
   * @param {number} duration - How long to show the message (ms), defaults to 4000
   */
  showSuccess(message, duration = 4000) {
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.classList.remove('hidden');
    
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => {
      this.elements.successMessage.classList.add('hidden');
    }, duration);
  },
  
  /**
   * Update the GitHub connection status display
   * @param {string} status - Connection status ('connected', 'connecting', 'disconnected')
   * @param {string} message - The message to display
   */
  updateConnectionStatus(status, message) {
    this.elements.connectionStatus.textContent = message;
    this.elements.connectionStatus.setAttribute('data-status', status);
  },
  
  /**
   * Update the post listing in the sidebar
   * @param {Object} posts - Object containing posts organized by year and month
   * @param {string} selectedYear - Currently selected year
   */
  updatePostsUI(posts, selectedYear) {
    const monthList = this.elements.monthList;
    monthList.innerHTML = '';
    
    const yearData = posts[selectedYear] || {};
    const monthNames = {
      "01": "January", "02": "February", "03": "March", "04": "April",
      "05": "May", "06": "June", "07": "July", "08": "August",
      "09": "September", "10": "October", "11": "November", "12": "December"
    };

    // Sort months in descending order (most recent first)
    const sortedMonths = Object.keys(yearData).sort((a, b) => b.localeCompare(a));
    
    if (sortedMonths.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No posts found for this year';
      emptyMessage.classList.add('empty-message');
      monthList.appendChild(emptyMessage);
      return;
    }

    sortedMonths.forEach(month => {
      const posts = yearData[month];
      const monthName = monthNames[month] || `Month ${month}`;
      
      // Create month item
      const monthItem = document.createElement('li');
      monthItem.className = "month-item";
      monthItem.textContent = `${monthName} (${posts.length})`;
      monthItem.dataset.month = month;
      
      // Create post list
      const postList = document.createElement('ul');
      postList.className = "post-list";

      // Add posts to the list
      posts.forEach(post => {
        const postItem = document.createElement('li');
        postItem.className = "post-item";
        postItem.textContent = post.title;
        postItem.dataset.postId = post.folderName;
        
        // Handle post selection
        postItem.addEventListener('click', () => {
          document.dispatchEvent(new CustomEvent('posts:selectPost', {
            detail: {
              year: selectedYear,
              month: month,
              postId: post.folderName,
              title: post.title
            }
          }));
        });
        
        postList.appendChild(postItem);
      });

      // Handle month item click to expand/collapse
      monthItem.addEventListener('click', (e) => {
        // Don't toggle if clicking on a post item
        if (e.target.classList.contains('post-item')) return;
        
        monthItem.classList.toggle('expanded');
      });

      // Append to the DOM
      monthList.appendChild(monthItem);
      monthList.appendChild(postList);
    });
  },
  
  /**
   * Sets the content of the preview container
   * @param {string} html - HTML content for the preview
   */
  setPreviewContent(html) {
    this.elements.previewContainer.innerHTML = html;
  },
  
  /**
   * Sets the content of the code output
   * @param {string} code - Code to display
   */
  setCodeContent(code) {
    this.elements.codeOutput.textContent = code;
    
    // Apply syntax highlighting if available
    if (window.hljs) {
      hljs.highlightElement(this.elements.codeOutput);
    }
  }
};

// Export the UI object
window.UI = UI;
