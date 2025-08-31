// UI Component Handler
const UI = {
  init() {
    this.setupEventListeners();
    this.loadTrendingProjects();
    this.setupAnimations();
  },

  setupEventListeners() {
    const ideaInput = document.getElementById('ideaInput');
    const generateIdeasBtn = document.getElementById('generateIdeasBtn');
    const generateImageBtn = document.getElementById('generateImageBtn');

    ideaInput?.addEventListener('input', this.handleIdeaInput.bind(this));
    generateIdeasBtn?.addEventListener('click', this.handleGenerateIdeas.bind(this));
    generateImageBtn?.addEventListener('click', this.handleGenerateImage.bind(this));
  },

  async handleIdeaInput(e) {
    if (e.target.value.length > 2) {
      this.showLoadingIndicator('Analyzing your idea...');
      try {
        const suggestions = await API.getSuggestions(e.target.value);
        this.displaySuggestions(suggestions);
      } catch (error) {
        this.showNotification(error.message, 'error');
      } finally {
        this.hideLoadingIndicator();
      }
    }
  },

  async handleGenerateIdeas() {
    const idea = document.getElementById('ideaInput')?.value;
    if (!idea) {
      this.showNotification('Please enter an idea first', 'error');
      return;
    }

    this.showLoadingIndicator('Generating ideas...');
    try {
      const suggestions = await API.getSuggestions(idea);
      this.displaySuggestions(suggestions);
      this.showNotification('Ideas generated successfully!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      this.hideLoadingIndicator();
    }
  },

  async handleGenerateImage() {
    const idea = document.getElementById('ideaInput')?.value;
    if (!idea) {
      this.showNotification('Please enter an idea first', 'error');
      return;
    }

    this.showLoadingOverlay();
    try {
      const response = await API.generateImage(idea);
      if (response.success) {
        this.displayImagePreview(response.image);
        this.showNotification('Image generated successfully!', 'success');
      }
    } catch (error) {
      this.showNotification(error.message, 'error');
    } finally {
      this.hideLoadingOverlay();
    }
  },

  showLoadingIndicator(message) {
    const existing = document.querySelector('.loading-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator gradient-border';
    indicator.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    document.body.appendChild(indicator);
  },

  hideLoadingIndicator() {
    const indicator = document.querySelector('.loading-indicator');
    if (indicator) {
      gsap.to(indicator, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => indicator.remove()
      });
    }
  },

  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay?.classList.remove('hidden');

    gsap.to('.step', {
      opacity: 1,
      y: 0,
      stagger: 0.2,
      duration: 0.5,
      ease: 'power2.out'
    });
  },

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          overlay.classList.add('hidden');
          overlay.style.opacity = 1;
        }
      });
    }
  },

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    gsap.to(notification, {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: 'power2.out'
    });

    setTimeout(() => {
      gsap.to(notification, {
        opacity: 0,
        x: 100,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => notification.remove()
      });
    }, 3000);
  }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => UI.init());
