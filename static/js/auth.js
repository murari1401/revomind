const Auth = {
  isAuthenticated: false,
  user: null,

  init() {
    this.checkAuthStatus();
    this.setupGoogleAuth();
  },

  setupGoogleAuth() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        callback: this.handleCredentialResponse.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'outline', size: 'large' }
      );
    }
  },

  async handleCredentialResponse(response) {
    try {
      const result = await fetch('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await result.json();
      if (data.success) {
        this.user = data.user;
        this.isAuthenticated = true;
        this.updateUI();
        UI.showNotification('Successfully signed in!', 'success');
      }
    } catch (error) {
      console.error('Auth error:', error);
      UI.showNotification('Sign in failed', 'error');
    }
  },

  checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isAuthenticated = true;
      this.updateUI();
    }
  },

  updateUI() {
    const loginModal = document.getElementById('loginModal');
    const userProfile = document.getElementById('userProfile');
    const premiumBtn = document.querySelector('.premium-btn');

    if (this.isAuthenticated && this.user) {
      loginModal?.classList.add('hidden');
      userProfile?.classList.remove('hidden');
      if (userProfile) {
        userProfile.querySelector('img').src = this.user.picture;
      }
      premiumBtn?.classList.remove('hidden');
    } else {
      loginModal?.classList.remove('hidden');
      userProfile?.classList.add('hidden');
      premiumBtn?.classList.add('hidden');
    }
  }
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => Auth.init());