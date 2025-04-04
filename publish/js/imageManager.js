/**
 * imageManager.js - Image Management for HarmonyPlan Blog Manager
 * 
 * This module handles image uploads, gallery management, and
 * inserting images into the blog post editor.
 */

/**
 * Image manager for uploading and managing blog images
 */
const ImageManager = {
  // DOM Elements cache
  elements: {
    modal: document.getElementById('image-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    addImageBtn: document.getElementById('add-image'),
    uploadImageBtn: document.getElementById('upload-image-btn'),
    imageUploadInput: document.getElementById('image-upload'),
    uploadProgress: document.getElementById('upload-progress'),
    progressFill: document.querySelector('.progress-fill'),
    galleryContainer: document.getElementById('gallery-container')
  },
  
  // In-memory image store (would be GitHub in real app)
  images: [
    { name: 'sample1.jpg', path: 'img/sample1.jpg', alt: 'Sample 1' },
    { name: 'sample2.jpg', path: 'img/sample2.jpg', alt: 'Sample 2' },
    { name: 'sample3.jpg', path: 'img/sample3.jpg', alt: 'Sample 3' }
  ],
  
  /**
   * Initialize the image manager and set up event listeners
   */
  init() {
    this.setupEventListeners();
  },
  
  /**
   * Set up event listeners for image management
   */
  setupEventListeners() {
    // Modal open/close
    this.elements.addImageBtn.addEventListener('click', () => this.openModal());
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    
    // Close when clicking outside the modal content
    window.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });
    
    // Image upload
    this.elements.uploadImageBtn.addEventListener('click', () => this.uploadImage());
    
    // Initialize image gallery with selectable images
    this.initializeGallery();
  },
  
  /**
   * Initialize the image gallery with existing images
   */
  initializeGallery() {
    this.elements.galleryContainer.innerHTML = '';
    
    this.images.forEach(image => {
      const imageItem = document.createElement('div');
      imageItem.className = 'image-item';
      
      const img = document.createElement('img');
      img.src = image.path;
      img.alt = image.alt || image.name;
      img.className = 'selectable-image';
      
      const imageName = document.createElement('span');
      imageName.className = 'image-name';
      imageName.textContent = image.name;
      
      // Add click event to insert the image
      imageItem.addEventListener('click', () => {
        this.insertImageToEditor(image);
        this.closeModal();
      });
      
      imageItem.appendChild(img);
      imageItem.appendChild(imageName);
      this.elements.galleryContainer.appendChild(imageItem);
    });
  },
  
  /**
   * Open the image modal
   */
  openModal() {
    this.elements.modal.style.display = 'block';
    // Reset upload input and progress bar
    this.elements.imageUploadInput.value = '';
    this.elements.uploadProgress.classList.add('hidden');
    this.elements.progressFill.style.width = '0%';
  },
  
  /**
   * Close the image modal
   */
  closeModal() {
    this.elements.modal.style.display = 'none';
  },
  
  /**
   * Upload an image
   */
  uploadImage() {
    const file = this.elements.imageUploadInput.files[0];
    if (!file) {
      UI.showError('Please select an image to upload');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      UI.showError('Please select a valid image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      UI.showError('File size exceeds 5MB limit');
      return;
    }
    
    // Show progress bar
    this.elements.uploadProgress.classList.remove('hidden');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      this.elements.progressFill.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.finishUpload(file), 500);
      }
    }, 100);
  },
  
  /**
   * Finish the upload process and add image to gallery
   * @param {File} file - The uploaded file
   */
  finishUpload(file) {
    // Create a URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    
    // Add to in-memory image store
    const newImage = {
      name: file.name,
      path: imageUrl,
      alt: file.name.split('.')[0],
      isLocal: true // Flag for images stored in memory only
    };
    
    this.images.push(newImage);
    
    // Create and add image element to gallery
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = newImage.alt;
    img.className = 'selectable-image';
    
    const imageName = document.createElement('span');
    imageName.className = 'image-name';
    imageName.textContent = file.name;
    
    // Add click event to insert the image
    imageItem.addEventListener('click', () => {
      this.insertImageToEditor(newImage);
      this.closeModal();
    });
    
    imageItem.appendChild(img);
    imageItem.appendChild(imageName);
    this.elements.galleryContainer.appendChild(imageItem);
    
    // Reset progress bar
    setTimeout(() => {
      this.elements.uploadProgress.classList.add('hidden');
      this.elements.progressFill.style.width = '0%';
      this.elements.imageUploadInput.value = '';
    }, 1000);
    
    UI.showSuccess('Image uploaded successfully');
  },
  
  /**
   * Insert an image into the HTML editor
   * @param {Object} image - Image data to insert
   */
  insertImageToEditor(image) {
    const htmlEditor = document.getElementById('html-content');
    const cursorPos = htmlEditor.selectionStart;
    
    // Create image HTML tag with responsive class
    const imgTag = `<img src="${image.path}" alt="${image.alt}" class="responsive-image" />`;
    
    // Insert at cursor position
    const textBefore = htmlEditor.value.substring(0, cursorPos);
    const textAfter = htmlEditor.value.substring(cursorPos);
    
    htmlEditor.value = textBefore + imgTag + textAfter;
    
    // Set focus back to editor
    htmlEditor.focus();
    
    // Set cursor position after the inserted image
    const newCursorPos = cursorPos + imgTag.length;
    htmlEditor.setSelectionRange(newCursorPos, newCursorPos);
  }
};

// Export the ImageManager object
window.ImageManager = ImageManager;
