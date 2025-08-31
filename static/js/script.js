let searchTimeout;
let currentIdea = null;

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    getSuggestions();
  }, 500);
}

async function getSuggestions() {
  const idea = document.getElementById('idea').value;
  const output = document.getElementById('output');
  const loader = document.getElementById('loader');

  if (!idea) {
    output.innerHTML = '<div class="suggestion-card">Please enter a craft idea</div>';
    return;
  }

  try {
    loader.style.display = 'block';
    output.innerHTML = '';

    const response = await fetch('/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get suggestions');
    }

    displaySuggestions(data.suggestions);
  } catch (error) {
    output.innerHTML = `<div class="suggestion-card error">${error.message}</div>`;
  } finally {
    loader.style.display = 'none';
  }
}

function displaySuggestions(suggestions) {
  const output = document.getElementById('output');
  let html = '';

  suggestions.forEach(suggestion => {
    html += `
            <div class="suggestion-card">
                <h3>${suggestion.title}</h3>
                <div class="suggestion-details">
                    <p><strong>Materials:</strong> ${suggestion.materials}</p>
                    <p><strong>Difficulty:</strong> ${suggestion.difficulty}</p>
                    <p><strong>Time:</strong> ${suggestion.time}</p>
                    <p><strong>Estimated Cost:</strong> ${suggestion.cost}</p>
                </div>
            </div>
        `;
  });

  output.innerHTML = html;
}

function searchPlatform(platform) {
  const idea = document.getElementById('idea').value;
  if (!idea) {
    alert('Please enter a craft idea first');
    return;
  }

  const urls = {
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(idea + " craft tutorial")}`,
    pinterest: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(idea + " craft ideas")}`,
    instructables: `https://www.instructables.com/search/?q=${encodeURIComponent(idea + " craft")}`
  };

  window.open(urls[platform], '_blank');
}

function setCategory(category) {
  const input = document.getElementById('idea');
  input.value = category;
  getSuggestions();
}

// Initialize particles
document.addEventListener('DOMContentLoaded', () => {
  createParticles();

  // Load community ideas on page load
  loadCommunityIdeas();
  setupAnimations();
  setupEventListeners();
});

function setupEventListeners() {
  const ideaInput = document.getElementById('ideaInput');
  ideaInput.addEventListener('input', debounce(handleInput, 500));

  document.getElementById('generateBtn').addEventListener('click', generateIdeasWithImage);
}

// Add these new functions

// Separate image generation from idea generation
document.getElementById('generateImageBtn').addEventListener('click', generateImageOnly);
document.getElementById('generateIdeasBtn').addEventListener('click', generateIdeasOnly);

async function generateImageOnly() {
  const idea = document.getElementById('ideaInput').value;
  if (!idea) {
    showNotification('Please describe your idea first', 'error');
    return;
  }

  showLoadingOverlay();

  try {
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });

    const data = await response.json();

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (data.success && data.image) {
      hideLoadingOverlay();
      displayImagePreview(data.image);

      // Show remaining requests
      if (data.remaining_requests !== undefined) {
        showNotification(
          `Image generated successfully! ${data.remaining_requests} requests remaining`,
          'success'
        );
      }
    } else {
      throw new Error(data.error || 'Failed to generate image');
    }
  } catch (error) {
    hideLoadingOverlay();
    showNotification(error.message, 'error');
  }
}

async function generateIdeasOnly() {
  const idea = document.getElementById('ideaInput').value;
  if (!idea) {
    showNotification('Please describe your idea first', 'error');
    return;
  }

  showMiniLoader('Generating project ideas...');

  try {
    const response = await fetch('/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });

    const data = await response.json();
    if (data.success) {
      displaySuggestions(data.suggestions);
    }
  } catch (error) {
    showNotification('Failed to generate ideas', 'error');
  } finally {
    hideMiniLoader();
  }
}

function displayImagePreview(imageBase64) {
  const preview = document.getElementById('imagePreview');
  if (!preview) return;

  const img = new Image();
  img.onload = () => {
    preview.innerHTML = '';
    preview.appendChild(img);

    // Add image animation
    gsap.from(img, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Show image controls
    const controls = document.createElement('div');
    controls.className = 'image-controls';
    controls.innerHTML = `
            <button onclick="regenerateImage()" class="control-btn">
                <i class="fas fa-redo"></i> Regenerate
            </button>
            <button onclick="downloadImage('${imageBase64}')" class="control-btn">
                <i class="fas fa-download"></i> Download
            </button>
        `;
    preview.appendChild(controls);
  };

  img.src = `data:image/jpeg;base64,${imageBase64}`;
  img.className = 'generated-image';
}

function downloadImage(imageBase64) {
  const link = document.createElement('a');
  link.href = `data:image/jpeg;base64,${imageBase64}`;
  link.download = 'craft-project.jpg';
  link.click();
}

// Enhanced trending projects display
async function loadTrendingProjects() {
  try {
    const response = await fetch('/trending');
    const data = await response.json();

    if (data.success) {
      displayTrendingProjects(data.ideas);
    }
  } catch (error) {
    console.error('Failed to load trending projects:', error);
  }
}

function displayTrendingProjects(projects) {
  const container = document.getElementById('trendingProjects');
  container.innerHTML = projects.map(project => `
        <div class="project-card hover-lift">
            <div class="project-image">
                <img src="${project.image_url}" alt="${project.title}" loading="lazy" />
            </div>
            <div class="project-info">
                <h4>${project.title}</h4>
                <p class="category">${project.category}</p>
                <div class="project-meta">
                    <span class="likes">
                        <i class="fas fa-heart"></i> ${project.likes}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
  loadTrendingProjects();
  setupScrollAnimations();
  setupViewControls();
});

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

function setupViewControls() {
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      document.querySelector('.suggestions-container')
        .setAttribute('data-view', view);
    });
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function handleInput(e) {
  const input = e.target.value;
  if (input.length > 2) {
    await generateIdeasWithImage();
  }
}

let currentLoadingStep = 0;
const loadingSteps = [
  "Analyzing your idea...",
  "Gathering reference images...",
  "Generating creative variations...",
  "Preparing visualization...",
  "Finalizing results..."
];

function showEnhancedLoader() {
  const loader = document.createElement('div');
  loader.className = 'loading-overlay';
  loader.innerHTML = `
        <div class="loading-content">
            <div class="loader-brain">
                <i class="fas fa-brain fa-3x"></i>
            </div>
            <h3>Creating Your Vision</h3>
            <div class="loading-steps">
                ${loadingSteps.map((step, index) => `
                    <div class="loading-step" style="animation-delay: ${index * 0.5}s">
                        <i class="fas fa-circle-notch fa-spin"></i>
                        <span>${step}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
  document.body.appendChild(loader);
  advanceLoadingSteps();
}

function advanceLoadingSteps() {
  const steps = document.querySelectorAll('.loading-step');
  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      steps[currentStep].classList.add('active');
      currentStep++;
    } else {
      clearInterval(interval);
    }
  }, 1000);
}

async function generateIdeasWithImage() {
  const idea = document.getElementById('ideaInput').value;
  if (!idea) {
    showNotification('Please enter an idea first', 'error');
    return;
  }

  // Show mini loader instead of full screen
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <span>Generating your idea...</span>
    `;
  document.body.appendChild(loadingIndicator);

  try {
    const [suggestionsResponse, imageResponse] = await Promise.all([
      fetch('/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      }),
      fetch('/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      })
    ]);

    const [suggestionsData, imageData] = await Promise.all([
      suggestionsResponse.json(),
      imageResponse.json()
    ]);

    document.body.removeChild(loadingIndicator);
    displayEnhancedResults(suggestionsData.suggestions, imageData.image);

  } catch (error) {
    document.body.removeChild(loadingIndicator);
    showNotification('Error generating ideas. Please try again.', 'error');
  }
}

function displayEnhancedResults(suggestions, imageBase64) {
  const resultsSection = document.getElementById('results');
  resultsSection.innerHTML = '';

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  // Image preview section
  if (imageBase64) {
    const imageSection = document.createElement('div');
    imageSection.className = 'image-preview-section section-enter';
    imageSection.innerHTML = `
            <h3>Project Preview</h3>
            <div class="image-preview hover-float">
                <img src="data:image/jpeg;base64,${imageBase64}" alt="Generated preview">
            </div>
            <div class="image-actions">
                <button onclick="saveImage('${imageBase64}')" class="action-button">
                    <i class="fas fa-download"></i> Save Image
                </button>
            </div>
        `;
    resultsContainer.appendChild(imageSection);
  }

  // Suggestions section
  const suggestionsSection = document.createElement('div');
  suggestionsSection.className = 'suggestions-section';
  suggestionsSection.innerHTML = `
        <div class="suggestions-grid">
            ${suggestions.map((suggestion, index) => `
                <div class="suggestion-card section-enter hover-float"
                     style="animation-delay: ${index * 0.2}s">
                    <h4>${suggestion.title}</h4>
                    <div class="suggestion-content">
                        <div class="materials">
                            <i class="fas fa-tools"></i>
                            <span>${suggestion.materials}</span>
                        </div>
                        <div class="difficulty ${suggestion.difficulty.toLowerCase()}">
                            <i class="fas fa-star"></i>
                            <span>${suggestion.difficulty}</span>
                        </div>
                        <div class="time">
                            <i class="fas fa-clock"></i>
                            <span>${suggestion.time}</span>
                        </div>
                        <div class="steps">
                            <h5>Steps:</h5>
                            <ol>
                                ${suggestion.steps.map(step => `<li>${step}</li>`).join('')}
                            </ol>
                        </div>
                        <div class="card-actions">
                            <button onclick="saveProject('${encodeURIComponent(JSON.stringify(suggestion))}')"
                                    class="save-btn hover-float">
                                <i class="fas fa-bookmark"></i> Save Project
                            </button>
                            <button onclick="shareProject('${encodeURIComponent(JSON.stringify(suggestion))}')"
                                    class="share-btn hover-float">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  resultsContainer.appendChild(suggestionsSection);

  resultsSection.appendChild(resultsContainer);
  resultsSection.classList.remove('hidden');

  // Initialize animations
  setTimeout(() => {
    document.querySelectorAll('.section-enter').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
}

// Add these new utility functions
function saveImage(imageBase64) {
  const link = document.createElement('a');
  link.href = `data:image/jpeg;base64,${imageBase64}`;
  link.download = 'project-preview.jpg';
  link.click();
}

function shareProject(projectData) {
  const project = JSON.parse(decodeURIComponent(projectData));
  if (navigator.share) {
    navigator.share({
      title: project.title,
      text: `Check out this project: ${project.title}`,
      url: window.location.href
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    showNotification('Use the link to share this project', 'info');
  }
}

function showLoader() {
  const loader = document.getElementById('loader');
  loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-dots">
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
            </div>
            <p>Crafting innovative ideas just for you...</p>
            <div class="loader-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
  loader.classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// Enhanced results display with animations
function displayResults(suggestions, imageBase64, similarIdeas) {
  const output = document.getElementById('output');
  let html = '';

  // Show generated image with fade-in animation
  if (imageBase64) {
    html += `
            <div class="image-preview scroll-reveal">
                <h3>Your Project Visualization</h3>
                <img src="data:image/jpeg;base64,${imageBase64}" alt="Generated preview" loading="lazy">
            </div>
        `;
  }

  // Show suggestions with staggered animation
  html += `<div class="suggestions-container">`;
  suggestions.forEach((suggestion, index) => {
    html += `
            <div class="suggestion-card scroll-reveal" style="animation-delay: ${index * 0.2}s">
                <h3>${suggestion.title}</h3>
                <div class="suggestion-content">
                    <div class="suggestion-details">
                        <p><i class="fas fa-tools"></i> <strong>Materials:</strong> ${suggestion.materials}</p>
                        <p><i class="fas fa-star"></i> <strong>Difficulty:</strong> ${suggestion.difficulty}</p>
                        <p><i class="fas fa-clock"></i> <strong>Time:</strong> ${suggestion.time}</p>
                        <p><i class="fas fa-tag"></i> <strong>Cost:</strong> ${suggestion.cost}</p>
                    </div>
                    <div class="steps-container">
                        <h4><i class="fas fa-list-ol"></i> Steps:</h4>
                        <ol>
                            ${suggestion.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    ${suggestion.tech_requirements.length ? `
                        <div class="tech-requirements">
                            <h4><i class="fas fa-microchip"></i> Tech Requirements:</h4>
                            <ul>
                                ${suggestion.tech_requirements.map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
  });
  html += '</div>';

  // Show similar ideas if available
  if (similarIdeas && similarIdeas.length) {
    html += `
            <div class="similar-ideas scroll-reveal">
                <h3>Similar Projects</h3>
                <div class="similar-grid">
                    ${similarIdeas.map(idea => `
                        <div class="similar-card">
                            <h4>${idea.title}</h4>
                            <p>${idea.description}</p>
                            <small>By ${idea.author}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
  }

  output.innerHTML = html;
  initScrollReveal();
}

// Initialize scroll reveal animation
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

// Notification system
function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, 100);
}

// Loading indicator functions
function showLoadingIndicator(message) {
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
}

function hideLoadingIndicator() {
  const indicator = document.querySelector('.loading-indicator');
  if (indicator) {
    gsap.to(indicator, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => indicator.remove()
    });
  }
}

function showMiniLoader(message) {
  const loader = document.createElement('div');
  loader.className = 'mini-loader';
  loader.innerHTML = `
        <div class="spinner-small"></div>
        <span>${message}</span>
    `;
  document.body.appendChild(loader);
  return loader;
}

function hideMiniLoader() {
  const loader = document.querySelector('.mini-loader');
  if (loader) {
    loader.remove();
  }
}

// GSAP Animations
function initAnimations() {
  gsap.from('.hero-content', {
    opacity: 0,
    y: 100,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.utils.toArray('.hover-card').forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top bottom-=100',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
}

// Add to script.js
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Initialize advanced animations
function initAdvancedAnimations() {
  // Parallax scrolling effect
  gsap.utils.toArray('.parallax').forEach(section => {
    gsap.to(section, {
      backgroundPosition: `50% ${-innerHeight / 2}px`,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // Cards stagger animation
  gsap.from('.project-card', {
    duration: 1,
    y: 100,
    opacity: 0,
    stagger: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: '.projects-showcase',
      start: "top center+=100",
      toggleActions: "play none none reverse"
    }
  });

  // Button hover effects
  document.querySelectorAll('.primary-btn').forEach(button => {
    button.addEventListener('mousemove', e => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(button, {
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
        duration: 0.1
      });
    });
  });
}

// Enhanced card interactions
function initCardInteractions() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateY = gsap.utils.mapRange(0, rect.width, -10, 10, x);
      const rotateX = gsap.utils.mapRange(0, rect.height, 10, -10, y);

      gsap.to(card, {
        rotateY,
        rotateX,
        scale: 1.05,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  loadTrendingProjects();
  setupEventListeners();
});

// Add server status check
async function checkServerStatus() {
  try {
    const response = await fetch('/');
    if (response.ok) {
      document.querySelector('#connectionStatus .status').textContent = 'Connected';
      document.querySelector('#connectionStatus').classList.add('connected');
    }
  } catch (error) {
    document.querySelector('#connectionStatus .status').textContent = 'Disconnected';
    document.querySelector('#connectionStatus').classList.add('error');
  }
}

// Add model status check
async function checkModelStatus() {
  try {
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'test' })
    });

    if (response.ok) {
      document.querySelector('#modelStatus .status').textContent = 'Ready';
      document.querySelector('#modelStatus').classList.add('ready');
    }
  } catch (error) {
    document.querySelector('#modelStatus .status').textContent = 'Not Ready';
    document.querySelector('#modelStatus').classList.add('error');
  }
}

// Initialize checks
document.addEventListener('DOMContentLoaded', () => {
  checkServerStatus();
  checkModelStatus();
});

// Add these event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive elements
  initializeButtons();
  setupImageGeneration();
  initAdvancedAnimations();
});

function initializeButtons() {
  // Generate Ideas Button
  const generateIdeasBtn = document.getElementById('generateIdeasBtn');
  if (generateIdeasBtn) {
    generateIdeasBtn.addEventListener('click', async () => {
      const idea = document.getElementById('ideaInput').value;
      if (!idea) {
        showNotification('Please enter an idea first', 'error');
        return;
      }
      showLoadingIndicator('Generating creative ideas...');
      try {
        const response = await fetch('/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea })
        });
        const data = await response.json();
        hideLoadingIndicator();
        if (data.success) {
          displaySuggestions(data.suggestions);
          showNotification('Ideas generated successfully!', 'success');
        }
      } catch (error) {
        hideLoadingIndicator();
        showNotification('Failed to generate ideas', 'error');
      }
    });
  }

  // Generate Image Button
  const generateImageBtn = document.getElementById('generateImageBtn');
  if (generateImageBtn) {
    generateImageBtn.addEventListener('click', async () => {
      const idea = document.getElementById('ideaInput').value;
      if (!idea) {
        showNotification('Please enter an idea first', 'error');
        return;
      }
      showLoadingIndicator('Creating your visualization...');
      try {
        const response = await fetch('/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea })
        });
        const data = await response.json();
        hideLoadingIndicator();
        if (data.success) {
          displayImagePreview(data.image);
          showNotification('Image generated successfully!', 'success');
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      } catch (error) {
        hideLoadingIndicator();
        showNotification(error.message, 'error');
      }
    });
  }
}

function setupImageGeneration() {
  const imagePreview = document.getElementById('imagePreview');
  if (!imagePreview) return;

  // Add loading state
  imagePreview.innerHTML = `
        <div class="placeholder">
            <i class="fas fa-image fa-3x"></i>
            <p>Your visualization will appear here</p>
        </div>
    `;
}

// Enhanced display functions
function displayResults(data) {
  const outputContainer = document.getElementById('outputContainer');
  if (!outputContainer) return;

  // Clear previous results
  outputContainer.innerHTML = '';
  outputContainer.classList.remove('show');

  // Create results card
  const resultCard = document.createElement('div');
  resultCard.className = 'card result-card';

  if (data.suggestions) {
    data.suggestions.forEach(suggestion => {
      const suggestionElement = createSuggestionElement(suggestion);
      resultCard.appendChild(suggestionElement);
    });
  }

  outputContainer.appendChild(resultCard);

  // Animate in
  setTimeout(() => {
    outputContainer.classList.add('show');
    gsap.from('.result-card', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, 100);
}

function createSuggestionElement(suggestion) {
  const element = document.createElement('div');
  element.className = 'suggestion-item';
  element.innerHTML = `
        <h3 class="suggestion-title">${suggestion.title}</h3>
        <div class="suggestion-details">
            <p><strong>Materials:</strong> ${suggestion.materials}</p>
            <p><strong>Difficulty:</strong> ${suggestion.difficulty}</p>
            <p><strong>Time:</strong> ${suggestion.time}</p>
            <p><strong>Cost:</strong> ${suggestion.cost}</p>
        </div>
        <div class="suggestion-steps">
            <h4>Steps:</h4>
            <ol>
                ${suggestion.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
        <button class="modern-button generate-image-btn"
                onclick="generateImageForSuggestion('${suggestion.title}')">
            Generate Preview
        </button>
    `;
  return element;
}

async function generateImageForSuggestion(idea) {
  const button = event.target;
  button.disabled = true;
  button.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });

    const data = await response.json();

    if (data.success) {
      const imagePreview = document.createElement('div');
      imagePreview.className = 'image-preview';
      imagePreview.innerHTML = `
                <img src="data:image/jpeg;base64,${data.image}"
                     alt="Generated preview"
                     class="generated-image" />
            `;

      button.parentElement.appendChild(imagePreview);
      gsap.from('.generated-image', {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: 'power2.out'
      });
    } else {
      throw new Error(data.error || 'Failed to generate image');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Generate Preview';
  }
}

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  setupEventListeners();
});

function initializeAnimations() {
  // Hero section animation
  gsap.from('.hero-content', {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out'
  });

  // Button hover animations
  document.querySelectorAll('.btn-3d').forEach(button => {
    button.addEventListener('mousemove', e => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(button, {
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
        duration: 0.1
      });
    });
  });
}

function setupEventListeners() {
  const generateImageBtn = document.getElementById('generateImageBtn');
  const generateIdeasBtn = document.getElementById('generateIdeasBtn');
  const ideaInput = document.getElementById('ideaInput');

  if (generateImageBtn) {
    generateImageBtn.addEventListener('click', handleImageGeneration);
  }

  if (generateIdeasBtn) {
    generateIdeasBtn.addEventListener('click', handleIdeaGeneration);
  }

  if (ideaInput) {
    ideaInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        handleImageGeneration();
      }
    });
  }
}

async function handleImageGeneration() {
  const idea = document.getElementById('ideaInput').value;
  if (!idea) {
    showNotification('Please describe your idea first', 'error');
    return;
  }

  showLoadingOverlay();

  try {
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });

    const data = await response.json();
    hideLoadingOverlay();

    if (data.success) {
      showResultsSection();
      displayImagePreview(data.image);
      await handleIdeaGeneration(); // Get suggestions after image
    } else {
      throw new Error(data.error || 'Failed to generate image');
    }
  } catch (error) {
    hideLoadingOverlay();
    showNotification(error.message, 'error');
  }
}

function showLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('hidden');

  // Animate loading steps
  gsap.to('.step', {
    opacity: 1,
    y: 0,
    stagger: 0.2,
    duration: 0.5,
    ease: 'power2.out'
  });
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      overlay.classList.add('hidden');
      overlay.style.opacity = 1;
    }
  });
}

function showResultsSection() {
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');

  gsap.from(resultsSection, {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power2.out'
  });
}

function displayImagePreview(imageBase64) {
  const preview = document.getElementById('imagePreview');
  if (!preview) return;

  const img = new Image();
  img.src = `data:image/jpeg;base64,${imageBase64}`;
  img.className = 'generated-image';

  img.onload = () => {
    preview.innerHTML = '';
    preview.appendChild(img);

    gsap.from(img, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: 'power2.out'
    });
  };
}

function showNotification(message, type = 'info') {
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