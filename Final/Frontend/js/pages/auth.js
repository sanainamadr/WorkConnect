/**
 * Auth Page
 * Handles authentication UI state and button toggling
 */

import { domReady, getAllByData, on, show, hide } from '../utils/dom.js';
import { token } from '../utils/storage.js';
import { authService } from '../services/auth-service.js';

/**
 * Toggle auth buttons based on login state
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
function toggleAuthButtons(isLoggedIn) {
  console.log('🔄 Toggling auth buttons. Is logged in:', isLoggedIn);
  
  // Show/hide logout buttons
  const logoutButtons = getAllByData('action', document);
  logoutButtons.forEach(btn => {
    if (btn.getAttribute('data-action') === 'logout') {
      isLoggedIn ? show(btn) : hide(btn);
    }
  });
  
  // Show/hide login buttons/links
  const loginLinks = getAllByData('action', document);
  loginLinks.forEach(link => {
    if (link.getAttribute('data-action') === 'login') {
      isLoggedIn ? hide(link) : show(link);
    }
  });
  
  // Also handle login links without data-action for backward compatibility
  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    if (!link.hasAttribute('data-action')) {
      isLoggedIn ? hide(link) : show(link);
    }
  });
  
  // Show/hide "My Bookings" buttons
  const myBookingsButtons = getAllByData('action', document);
  myBookingsButtons.forEach(btn => {
    if (btn.getAttribute('data-action') === 'my-bookings') {
      isLoggedIn ? show(btn) : hide(btn);
    }
  });
  
  // Show/hide profile menu
  const profileMenu = document.getElementById('profile-menu');
  if (profileMenu) {
    isLoggedIn ? show(profileMenu) : hide(profileMenu);
  }
  
  console.log('✅ Auth buttons toggled');
}

/**
 * Check authentication status
 */
async function checkAuth() {
  try {
    if (!token.exists()) {
      toggleAuthButtons(false);
      return false;
    }

    const response = await authService.verify();
    if (response && response.user) {
      toggleAuthButtons(true);
      return true;
    } else {
      toggleAuthButtons(false);
      return false;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    toggleAuthButtons(false);
    return false;
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await authService.logout();
    toggleAuthButtons(false);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout failed:', error);
    // Still redirect even if API call fails
    toggleAuthButtons(false);
    window.location.href = 'index.html';
  }
}

/**
 * Initialize auth functionality
 */
function init() {
  // Check auth on page load
  checkAuth();
  
  // Set up logout handlers
  const logoutButtons = getAllByData('action', document);
  logoutButtons.forEach(btn => {
    if (btn.getAttribute('data-action') === 'logout') {
      on(btn, 'click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
  });
  
  // Set up login link handlers
  const loginLinks = getAllByData('action', document);
  loginLinks.forEach(link => {
    if (link.getAttribute('data-action') === 'login') {
      on(link, 'click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
      });
    }
  });
}

// Initialize when DOM is ready
domReady(init);

// Export for use in other modules
export { checkAuth, toggleAuthButtons };




