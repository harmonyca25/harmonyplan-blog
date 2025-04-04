/**
 * github.js - GitHub Integration for HarmonyPlan Blog Manager
 * 
 * This module handles all interactions with GitHub, including
 * authentication, fetching posts, and publishing content.
 */

/**
 * GitHub API manager for repository operations
 */
const GitHub = {
  // Status flags
  isConnected: false,
  isConnecting: false,
  
  // Connection settings
  settings: {
    repo: '',
    token: '',
    branch: 'main'
  },
  
  // Mock posts data (would be fetched from GitHub in a real app)
  mockPosts: {
    "2025": {
      "04": [
        { title: "Critical Illness Insurance in Ontario", folderName: "02Apr2025_critical-illness-insurance", tags: "insurance, critical" },
        { title: "Insurance Market Trends 2025", folderName: "03Apr2025_insurance-market-trends", tags: "insurance, trends" }
      ],
      "03": [
        { title: "Understanding Life Insurance Options", folderName: "15Mar2025_life-insurance-options", tags: "life, insurance" }
      ]
    },
    "2024": {
      "12": [
        { title: "Year-End Insurance Review", folderName: "31Dec2024_year-end-review", tags: "year-end, review" }
      ]
    }
  },
  
  /**
   * Initialize GitHub integration and set up event listeners
   */
  init() {
    this.setupEventListeners();
    this.loadSettings();
  },
  
  /**
   * Set up event listeners for GitHub operations
   */
  setupEventListeners() {
    // Listen for GitHub connection request
    document.getElementById('connect-github').addEventListener('click', () => {
      this.connectToGitHub();
    });
    
    // Listen for settings save
    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings();
    });
    
    // Listen for publish request
    document.addEventListener('github:publishPost', (e) => {
      this.publishPost(e.detail);
    });
    
    // Year select change
    document.getElementById('year-select').addEventListener('change', (e) => {
      UI.updatePostsUI(this.mockPosts, e.target.value);
    });
  },
  
  /**
   * Load GitHub settings from storage
   */
  loadSettings() {
    const settings = Storage.loadSettings();
    
    // Update local settings
    this.settings.repo = settings.githubRepo;
    this.settings.token = settings.githubToken;
    this.settings.branch = settings.githubBranch || 'main';
    
    // Update UI fields
    document.getElementById('github-repo').value = settings.githubRepo;
    document.getElementById('github-token').value = settings.githubToken;
    document.getElementById('github-branch').value = settings.githubBranch || 'main';
    
    // Check if token exists to set connection status
    if (settings.githubToken) {
      this.verifyConnection();
    } else {
      UI.updateConnectionStatus('disconnected', 'Not connected to GitHub');
    }
    
    // Load posts (mock for demo)
    const selectedYear = document.getElementById('year-select').value;
    UI.updatePostsUI(this.mockPosts, selectedYear);
  },
  
  /**
   * Save GitHub settings
   */
  saveSettings() {
    // Get values from form
    const settings = {
      githubRepo: document.getElementById('github-repo').value.trim(),
      githubToken: document.getElementById('github-token').value.trim(),
      githubBranch: document.getElementById('github-branch').value.trim() || 'main',
      twitterLink: document.getElementById('twitter-link').value.trim(),
      facebookLink: document.getElementById('facebook-link').value.trim(),
      linkedinLink: document.getElementById('linkedin-link').value.trim()
    };
    
    // Validate required fields
    if (!settings.githubRepo) {
      UI.showError('GitHub repository name is required');
      return;
    }
    
    // Save settings
    if (Storage.saveSettings(settings)) {
      UI.showSuccess('Settings saved successfully');
      
      // Update local settings
      this.settings.repo = settings.githubRepo;
      this.settings.token = settings.githubToken;
      this.settings.branch = settings.githubBranch;
      
      // Verify connection if token provided
      if (settings.githubToken) {
        this.verifyConnection();
      }
    } else {
      UI.showError('Failed to save settings');
    }
  },
  
  /**
   * Connect to GitHub with provided credentials
   */
  connectToGitHub() {
    const repo = document.getElementById('github-repo').value.trim();
    const token = document.getElementById('github-token').value.trim();
    
    if (!repo || !token) {
      UI.showError('Please enter both repository and token');
      return;
    }
    
    // Update connection status
    this.isConnecting = true;
    UI.updateConnectionStatus('connecting', 'Connecting to GitHub...');
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock successful connection
      this.isConnected = true;
      this.isConnecting = false;
      
      // Update UI
      UI.updateConnectionStatus('connected', `Connected to ${repo}`);
      UI.showSuccess('Connected to GitHub successfully');
      
      // Save settings
      this.saveSettings();
    }, 1500);
  },
  
  /**
   * Verify existing GitHub connection
   */
  verifyConnection() {
    // Don't verify if already connecting
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    UI.updateConnectionStatus('connecting', 'Verifying connection...');
    
    // Simulate verification
    setTimeout(() => {
      this.isConnected = true;
      this.isConnecting = false;
      UI.updateConnectionStatus('connected', `Connected to ${this.settings.repo}`);
    }, 1000);
  },
  
  /**
   * Publish a post to GitHub
   * @param {Object} postData - Data for the post to publish
   */
  publishPost(postData) {
    // Check connection
    if (!this.isConnected) {
      UI.showError('Please connect to GitHub first');
      return;
    }
    
    // Show publishing status
    UI.showSuccess('Publishing post...');
    
    // Prepare post data
    const slug = Utils.titleToSlug(postData.title);
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const folderDate = Utils.formatDateFolder(now);
    const folderName = `${folderDate}_${slug}`;
    const filePath = `posts/${year}/${month}/${folderName}/index.html`;
    
    // Simulate API call delay
    setTimeout(() => {
      // For demo, just log the data
      console.log("Publishing to GitHub:");
      console.log("  Repo:", this.settings.repo);
      console.log("  Branch:", this.settings.branch);
      console.log("  File Path:", filePath);
      console.log("  Title:", postData.title);
      console.log("  Author:", postData.author);
      console.log("  Tags:", postData.tags);
      console.log("  Content Length:", postData.content.length);
      console.log("  Custom JS:", postData.customJs ? "Included" : "None");
      
      // Update mock posts for the UI
      this.updateMockPosts(year, month, {
        title: postData.title,
        folderName,
        tags: postData.tags
      });
      
      // Show success message
      UI.showSuccess('Post published successfully!');
      
      // Clear form if it was a new post
      if (!postData.isExistingPost) {
        Editor.clearForm();
      }
    }, 2000);
  },
  
  /**
   * Update mock posts data (for demo purposes)
   * @param {string} year - Year to add post to
   * @param {string} month - Month to add post to
   * @param {Object} post - Post data to add
   */
  updateMockPosts(year, month, post) {
    // Create year and month if they don't exist
    if (!this.mockPosts[year]) {
      this.mockPosts[year] = {};
    }
    
    if (!this.mockPosts[year][month]) {
      this.mockPosts[year][month] = [];
    }
    
    // Add post to the beginning of the array
    this.mockPosts[year][month].unshift(post);
    
    // Update the UI
    const selectedYear = document.getElementById('year-select').value;
    UI.updatePostsUI(this.mockPosts, selectedYear);
  },
  
  /**
   * Fetch posts from GitHub (mock implementation)
   * @param {string} year - Year to fetch posts for
   * @return {Promise} Promise that resolves with posts data
   */
  fetchPosts(year) {
    return new Promise((resolve) => {
      // Check cache first
      const cachedPosts = Storage.getCachedPostsData();
      if (cachedPosts) {
        resolve(cachedPosts);
        return;
      }
      
      // Simulate API delay
      setTimeout(() => {
        // Cache the mock posts
        Storage.cachePostsData(this.mockPosts);
        resolve(this.mockPosts);
      }, 1000);
    });
  }
};

// Export the GitHub object
window.GitHub = GitHub;
