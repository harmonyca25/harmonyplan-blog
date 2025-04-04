/**
 * editor.js - Blog Post Editor Management for HarmonyPlan Blog Manager
 * 
 * This module handles the post editor functionality, including form handling,
 * preview generation, and code generation.
 */

/**
 * Blog post editor manager
 */
const Editor = {
  // DOM Elements cache
  elements: {
    // Form fields
    form: document.getElementById('blog-post-form'),
    postTitleInput: document.getElementById('post-title'),
    authorNameInput: document.getElementById('author-name'),
    postTagsInput: document.getElementById('post-tags'),
    htmlContentInput: document.getElementById('html-content'),
    customJsInput: document.getElementById('custom-js'),
    
    // Buttons
    clearButton: document.getElementById('clear-button'),
    previewButton: document.getElementById('preview-button'),
    publishButton: document.getElementById('publish-button'),
    publishFromPreviewButton: document.getElementById('publish-from-preview'),
    publishFromCodeButton: document.getElementById('publish-from-code'),
    backToEditorButton: document.getElementById('back-to-editor'),
    backToEditorFromCodeButton: document.getElementById('back-to-editor-from-code')
  },
  
  // Current post data
  currentPost: {
    id: null,
    isExistingPost: false
  },
  
  // Auto-save timer ID
  autoSaveTimerId: null,
  
  /**
   * Initialize the editor and set up event listeners
   */
  init() {
    this.setupEventListeners();
    this.setupAutoSave();
    this.loadLastDraft();
  },
  
  /**
   * Set up all event listeners for the editor
   */
  setupEventListeners() {
    // Form validation
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateAndPublish();
    });
    
    // Button actions
    this.elements.clearButton.addEventListener('click', () => this.handleClearForm());
    this.elements.previewButton.addEventListener('click', () => UI.showTab('preview'));
    this.elements.backToEditorButton.addEventListener('click', () => UI.showTab('editor'));
    this.elements.backToEditorFromCodeButton.addEventListener('click', () => UI.showTab('editor'));
    
    // Publish actions from different tabs
    this.elements.publishButton.addEventListener('click', () => this.validateAndPublish());
    this.elements.publishFromPreviewButton.addEventListener('click', () => this.validateAndPublish());
    this.elements.publishFromCodeButton.addEventListener('click', () => this.validateAndPublish());
    
    // Listen for tab events
    document.addEventListener('editor:generatePreview', () => this.generatePreview());
    document.addEventListener('editor:generateCode', () => this.generateCode());
    
    // Listen for post selection
    document.addEventListener('posts:selectPost', (e) => this.loadPost(e.detail));
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to save as draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveAsDraft();
        UI.showSuccess('Draft saved successfully');
      }
      
      // Ctrl/Cmd + P to preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        UI.showTab('preview');
      }
    });
    
    // TextArea Tab Key Handling
    this.elements.htmlContentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.elements.htmlContentInput.selectionStart;
        const end = this.elements.htmlContentInput.selectionEnd;
        
        // Insert 2 spaces at cursor position
        this.elements.htmlContentInput.value = 
          this.elements.htmlContentInput.value.substring(0, start) + '  ' +
          this.elements.htmlContentInput.value.substring(end);
        
        // Move cursor after the inserted tab
        this.elements.htmlContentInput.selectionStart = start + 2;
        this.elements.htmlContentInput.selectionEnd = start + 2;
      }
    });
    
    // Same tab handling for JS textarea
    this.elements.customJsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.elements.customJsInput.selectionStart;
        const end = this.elements.customJsInput.selectionEnd;
        
        this.elements.customJsInput.value = 
          this.elements.customJsInput.value.substring(0, start) + '  ' +
          this.elements.customJsInput.value.substring(end);
        
        this.elements.customJsInput.selectionStart = start + 2;
        this.elements.customJsInput.selectionEnd = start + 2;
      }
    });
  },
  
  /**
   * Set up auto-save functionality for drafts
   */
  setupAutoSave() {
    // Create debounced save function
    const debouncedSave = Utils.debounce(() => {
      this.saveAsDraft(true); // silent save
    }, 5000); // 5 second debounce
    
    // Add input event listeners to all form fields
    [
      this.elements.postTitleInput,
      this.elements.authorNameInput,
      this.elements.postTagsInput,
      this.elements.htmlContentInput,
      this.elements.customJsInput
    ].forEach(input => {
      input.addEventListener('input', debouncedSave);
    });
  },
  
  /**
   * Loads the last edited draft from localStorage
   */
  loadLastDraft() {
    const drafts = Storage.loadDrafts();
    const draftIds = Object.keys(drafts);
    
    if (draftIds.length === 0) return;
    
    // Find the most recently edited draft
    let latestDraft = null;
    let latestTime = 0;
    
    draftIds.forEach(id => {
      const draft = drafts[id];
      const savedTime = new Date(draft.lastSaved).getTime();
      
      if (savedTime > latestTime) {
        latestDraft = draft;
        latestTime = savedTime;
      }
    });
    
    if (latestDraft) {
      this.loadDraft(latestDraft);
    }
  },
  
  /**
   * Loads a specific draft into the editor
   * @param {Object} draft - Draft post object
   */
  loadDraft(draft) {
    this.elements.postTitleInput.value = draft.title || '';
    this.elements.authorNameInput.value = draft.author || 'HarmonyPlan';
    this.elements.postTagsInput.value = draft.tags || '';
    this.elements.htmlContentInput.value = draft.content || '';
    this.elements.customJsInput.value = draft.customJs || '';
    
    // Update current post reference
    this.currentPost = {
      id: draft.id,
      isExistingPost: draft.isExistingPost || false
    };
    
    UI.showSuccess('Draft loaded successfully', 2000);
  },
  
  /**
   * Loads an existing post into the editor
   * @param {Object} postDetails - Details of the post to load
   */
  loadPost(postDetails) {
    UI.showSuccess(`Loading post: ${postDetails.title}`);
    
    // In a real app, this would fetch from GitHub API
    // For now, we simulate loading with a small delay
    setTimeout(() => {
      // Simulated post data
      const postData = {
        id: postDetails.postId,
        title: postDetails.title,
        author: 'HarmonyPlan',
        tags: 'insurance, financial', // Mock tags
        content: `
          <h2>${postDetails.title}</h2>
          <p>This is the content of the "${postDetails.title}" post.</p>
          <p>In a real application, this content would be loaded from GitHub.</p>
          <ul>
            <li>Point one about insurance</li>
            <li>Point two about policies</li>
            <li>Point three about coverage</li>
          </ul>
        `,
        customJs: '// Custom JavaScript for this post\nconsole.log("Post loaded");',
        isExistingPost: true
      };
      
      // Load the post into the editor
      this.loadDraft(postData);
      
      // Switch to editor tab
      UI.showTab('editor');
    }, 1000);
  },
  
  /**
   * Saves the current post as a draft
   * @param {boolean} silent - If true, don't show success message
   * @return {string} The draft ID
   */
  saveAsDraft(silent = false) {
    const draft = {
      id: this.currentPost.id,
      isExistingPost: this.currentPost.isExistingPost,
      title: this.elements.postTitleInput.value,
      author: this.elements.authorNameInput.value,
      tags: this.elements.postTagsInput.value,
      content: this.elements.htmlContentInput.value,
      customJs: this.elements.customJsInput.value
    };
    
    const draftId = Storage.saveDraft(draft);
    this.currentPost.id = draftId;
    
    if (!silent) {
      UI.showSuccess('Draft saved successfully');
    }
    
    return draftId;
  },
  
  /**
   * Clears the form fields after confirmation if there's content
   */
  handleClearForm() {
    const hasContent = 
      this.elements.postTitleInput.value ||
      this.elements.htmlContentInput.value ||
      this.elements.customJsInput.value;
    
    if (hasContent) {
      if (confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
        this.clearForm();
        UI.showSuccess('Form cleared');
      }
    } else {
      this.clearForm();
    }
  },
  
  /**
   * Clears all form fields and resets current post data
   */
  clearForm() {
    this.elements.postTitleInput.value = '';
    this.elements.authorNameInput.value = 'HarmonyPlan';
    this.elements.postTagsInput.value = '';
    this.elements.htmlContentInput.value = '';
    this.elements.customJsInput.value = '';
    
    // Reset current post data
    this.currentPost = {
      id: null,
      isExistingPost: false
    };
  },
  
  /**
   * Validates form inputs and publishes the post if valid
   */
  validateAndPublish() {
    // Check required fields
    const title = this.elements.postTitleInput.value.trim();
    const content = this.elements.htmlContentInput.value.trim();
    
    if (!title) {
      UI.showError('Please enter a post title');
      this.elements.postTitleInput.focus();
      return;
    }
    
    if (!content) {
      UI.showError('Please enter post content');
      this.elements.htmlContentInput.focus();
      return;
    }
    
    // Validate HTML
    if (!Utils.validateHTML(content)) {
      UI.showError('The HTML content appears to be invalid. Please check your markup.');
      this.elements.htmlContentInput.focus();
      return;
    }
    
    // Validate JavaScript if provided
    const customJs = this.elements.customJsInput.value.trim();
    if (customJs) {
      const jsValidation = Utils.validateJavaScript(customJs);
      if (!jsValidation.isValid) {
        UI.showError(jsValidation.error);
        this.elements.customJsInput.focus();
        return;
      }
    }
    
    // Check GitHub connection
    document.dispatchEvent(new CustomEvent('github:publishPost', {
      detail: this.getPostData()
    }));
  },
  
  /**
   * Gets the current post data from form fields
   * @return {Object} Post data object
   */
  getPostData() {
    return {
      id: this.currentPost.id,
      isExistingPost: this.currentPost.isExistingPost,
      title: this.elements.postTitleInput.value.trim(),
      author: this.elements.authorNameInput.value.trim() || 'HarmonyPlan',
      tags: this.elements.postTagsInput.value.trim(),
      content: this.elements.htmlContentInput.value.trim(),
      customJs: this.elements.customJsInput.value.trim()
    };
  },
  
  /**
   * Generates HTML preview of the current post
   */
  generatePreview() {
    const title = this.elements.postTitleInput.value.trim() || 'Untitled Post';
    const author = this.elements.authorNameInput.value.trim() || 'HarmonyPlan';
    const tags = this.elements.postTagsInput.value.trim();
    const content = this.elements.htmlContentInput.value.trim();
    const customJs = this.elements.customJsInput.value.trim();
    const currentDate = Utils.formatDate(new Date());

    let previewHTML = `
      <h2>${title}</h2>
      <div class="blog-post-meta">By ${author} on ${currentDate}</div>
      ${tags ? `<div class="blog-post-tags"><strong>Tags:</strong> ${tags}</div>` : ""}
      <hr>
      <div class="blog-post-content">${content}</div>
    `;
    
    if (customJs) {
      previewHTML += `<p><em>Custom JavaScript is included but not executed in preview.</em></p>`;
    }

    UI.setPreviewContent(previewHTML);
  },
  
  /**
   * Generates HTML code of the current post
   */
  generateCode() {
    const title = this.elements.postTitleInput.value.trim() || 'Untitled Post';
    const author = this.elements.authorNameInput.value.trim() || 'HarmonyPlan';
    const tags = this.elements.postTagsInput.value.trim();
    const content = this.elements.htmlContentInput.value.trim();
    const customJs = this.elements.customJsInput.value.trim();
    const currentDate = Utils.formatDate(new Date());

    // Build HTML document
    let generatedHTML = "<!DOCTYPE html>\n";
    generatedHTML += '<html lang="en">\n';
    generatedHTML += "<head>\n";
    generatedHTML += '  <meta charset="UTF-8">\n';
    generatedHTML += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    generatedHTML += `  <title>${title}</title>\n`;
    generatedHTML += "  <style>\n";
    generatedHTML += "    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }\n";
    generatedHTML += "    .blog-post-meta { color: #666; font-style: italic; margin-bottom: 10px; }\n";
    generatedHTML += "    .blog-post-tags { margin-bottom: 15px; }\n";
    generatedHTML += "    hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }\n";
    generatedHTML += "    img { max-width: 100%; height: auto; }\n";
    generatedHTML += "  </style>\n";
    generatedHTML += "</head>\n";
    generatedHTML += "<body>\n";
    generatedHTML += `  <h2>${title}</h2>\n`;
    generatedHTML += `  <div class="blog-post-meta">By ${author} on ${currentDate}</div>\n`;
    
    if (tags) {
      generatedHTML += `  <div class="blog-post-tags"><strong>Tags:</strong> ${tags}</div>\n`;
    }
    
    generatedHTML += "  <hr>\n";
    generatedHTML += `  <div class="blog-post-content">\n    ${content}\n  </div>\n`;
    
    if (customJs) {
      generatedHTML += "  <script>\n";
      generatedHTML += `    ${customJs}\n`;
      generatedHTML += "  </script>\n";
    }
    
    generatedHTML += "</body>\n";
    generatedHTML += "</html>";

    UI.setCodeContent(generatedHTML);
  }
};

// Export the Editor object
window.Editor = Editor;
