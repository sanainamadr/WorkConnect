const API_BASE = "http://localhost:3000/api";
const API_BASE_ALT = "http://localhost:4000/api";

const token = localStorage.getItem("token");
const storedUser = JSON.parse(localStorage.getItem("user") || "null");

// Redirect if not logged in
if (!token || !storedUser) {
  window.location.href = "login.html?redirect=edit-profile.html";
}

let els = {};
let currentUser = null;
let avatarFile = null;

// Initialize DOM elements
function initElements() {
  els = {
    loadingState: document.getElementById("loadingState"),
    profileForm: document.getElementById("profileForm"),
    avatarPreview: document.getElementById("avatarPreview"),
    avatarInput: document.getElementById("avatarInput"),
    saveButton: document.getElementById("saveButton"),
    workerFields: document.getElementById("workerFields"),
    toastContainer: document.getElementById("toastContainer"),
  };
  
  // Create toast container if it doesn't exist
  if (!els.toastContainer) {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed bottom-4 right-4 z-50 space-y-2";
    document.body.appendChild(container);
    els.toastContainer = container;
  }
}

// Toast notification system
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const bgColor = type === "success" 
    ? "bg-emerald-500" 
    : type === "error" 
    ? "bg-rose-500" 
    : type === "info"
    ? "bg-blue-500"
    : "bg-slate-500";
  
  toast.className = `${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] max-w-md ${type === "success" ? "success-toast" : "error-toast"}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">
      ${type === "success" ? "check_circle" : type === "error" ? "error" : "info"}
    </span>
    <span class="flex-1 font-semibold">${message}</span>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  `;
  
  els.toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Fetch current user profile
async function fetchUserProfile() {
  const endpoints = [
    `${API_BASE}/auth/verify`,
    `${API_BASE_ALT}/auth/verify`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data.user || data;
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
    }
  }

  // Fallback to localStorage
  return storedUser;
}

// Load user profile data
async function loadProfile() {
  // Only show loading if form is not already visible
  const formAlreadyVisible = els.profileForm && !els.profileForm.classList.contains("hidden");
  
  if (!formAlreadyVisible) {
    if (els.loadingState) els.loadingState.classList.remove("hidden");
    if (els.profileForm) els.profileForm.classList.add("hidden");
  }

  try {
    // Try to fetch from API, fallback to localStorage
    currentUser = await fetchUserProfile();
    
    if (!currentUser) {
      // Use localStorage user as fallback
      currentUser = storedUser;
    }
    
    if (!currentUser) {
      console.warn("No user data found. Showing empty form.");
      showToast("Using cached data. Please refresh if information seems outdated.", "info");
      // Show form anyway - user can still fill it out
      if (els.loadingState) els.loadingState.classList.add("hidden");
      if (els.profileForm) els.profileForm.classList.remove("hidden");
      return;
    }

    // Populate form fields
    document.getElementById("firstName").value = currentUser.firstName || "";
    document.getElementById("lastName").value = currentUser.lastName || "";
    document.getElementById("userName").value = currentUser.userName || "";
    document.getElementById("email").value = currentUser.email || "";
    document.getElementById("phoneNumber").value = currentUser.phoneNumber || "";
    document.getElementById("city").value = currentUser.city || "";
    document.getElementById("profileName").value = currentUser.profileName || "";

    // Set avatar preview
    if (currentUser.avatarUrl) {
      els.avatarPreview.src = currentUser.avatarUrl;
    } else {
      // Generate initials avatar
      const initials = `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase();
      els.avatarPreview.src = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#7f13ec"/>
          <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
        </svg>
      `)}`;
    }

    // Show worker-specific fields if user is a worker
    if (currentUser.role === "worker") {
      els.workerFields.classList.remove("hidden");
      document.getElementById("workerType").value = currentUser.workerType || "";
    } else {
      els.workerFields.classList.add("hidden");
    }

    // Show form
    if (els.loadingState) els.loadingState.classList.add("hidden");
    if (els.profileForm) els.profileForm.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading profile:", error);
    
    // Try to use localStorage user data as fallback
    if (storedUser) {
      currentUser = storedUser;
      // Populate form with localStorage data
      document.getElementById("firstName").value = currentUser.firstName || "";
      document.getElementById("lastName").value = currentUser.lastName || "";
      document.getElementById("userName").value = currentUser.userName || "";
      document.getElementById("email").value = currentUser.email || "";
      document.getElementById("phoneNumber").value = currentUser.phoneNumber || "";
      document.getElementById("city").value = currentUser.city || "";
      document.getElementById("profileName").value = currentUser.profileName || "";
      
      // Set avatar
      if (currentUser.avatarUrl) {
        els.avatarPreview.src = currentUser.avatarUrl;
      } else {
        const initials = `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase();
        els.avatarPreview.src = `data:image/svg+xml,${encodeURIComponent(`
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#7f13ec"/>
            <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
          </svg>
        `)}`;
      }
      
      // Show worker fields if worker
      if (currentUser.role === "worker") {
        els.workerFields.classList.remove("hidden");
        document.getElementById("workerType").value = currentUser.workerType || "";
      }
      
      els.loadingState.classList.add("hidden");
      els.profileForm.classList.remove("hidden");
      showToast("Loaded profile from cache. Some data may be outdated.", "info");
    } else {
      showToast("Failed to load profile. Please refresh the page.", "error");
      els.loadingState.classList.add("hidden");
      // Still show form so user can try to fill it
      els.profileForm.classList.remove("hidden");
    }
  }
}

// Handle avatar upload
els.avatarInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file", "error");
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Image size must be less than 5MB", "error");
    return;
  }

  avatarFile = file;

  // Preview image
  const reader = new FileReader();
  reader.onload = (event) => {
    els.avatarPreview.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Form validation
function validateForm() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const userName = document.getElementById("userName").value.trim();

  let isValid = true;

  // Clear previous errors
  document.querySelectorAll("[id$='Error']").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });

  // Validate firstName
  if (!firstName) {
    const errorEl = document.getElementById("firstNameError");
    errorEl.textContent = "First name is required";
    errorEl.classList.remove("hidden");
    isValid = false;
  }

  // Validate lastName
  if (!lastName) {
    const errorEl = document.getElementById("lastNameError");
    errorEl.textContent = "Last name is required";
    errorEl.classList.remove("hidden");
    isValid = false;
  }

  // Validate userName
  if (!userName) {
    const errorEl = document.getElementById("userNameError");
    errorEl.textContent = "Username is required";
    errorEl.classList.remove("hidden");
    isValid = false;
  } else if (userName.length < 3) {
    const errorEl = document.getElementById("userNameError");
    errorEl.textContent = "Username must be at least 3 characters";
    errorEl.classList.remove("hidden");
    isValid = false;
  }

  // Validate phone number if provided
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  if (phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
    const errorEl = document.getElementById("phoneNumberError");
    errorEl.textContent = "Please enter a valid phone number";
    errorEl.classList.remove("hidden");
    isValid = false;
  }

  return isValid;
}

// Update profile
async function updateProfile() {
  if (!validateForm()) {
    showToast("Please fix the errors in the form", "error");
    return;
  }

  const saveButtonText = els.saveButton.innerHTML;
  els.saveButton.disabled = true;
  els.saveButton.innerHTML = `
    <span class="relative z-10 flex items-center justify-center gap-2">
      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </span>
  `;

  try {
    // Prepare update data
    const updateData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      userName: document.getElementById("userName").value.trim(),
      phoneNumber: document.getElementById("phoneNumber").value.trim() || undefined,
      city: document.getElementById("city").value.trim() || undefined,
      profileName: document.getElementById("profileName").value.trim() || undefined,
    };

    // Add worker-specific fields
    if (currentUser.role === "worker") {
      updateData.workerType = document.getElementById("workerType").value || undefined;
    }

    // Use universal profile update endpoint
    const endpoints = [
      `${API_BASE}/auth/profile`,
      `${API_BASE_ALT}/auth/profile`,
      `${API_BASE}/worker/update-profile/${currentUser._id || currentUser.id}`,
      `${API_BASE_ALT}/worker/update-profile/${currentUser._id || currentUser.id}`,
    ];

    let success = false;
    let updatedUser = null;

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (res.ok) {
          updatedUser = await res.json();
          success = true;
          break;
        }
      } catch (error) {
        console.warn(`Failed to update via ${endpoint}:`, error);
        continue;
      }
    }

    if (!success) {
      throw new Error("Failed to update profile. Please try again.");
    }

    // Handle avatar upload if file selected
    if (avatarFile) {
      try {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        
        const avatarEndpoints = [
          `${API_BASE}/auth/upload-avatar`,
          `${API_BASE_ALT}/auth/upload-avatar`,
          `${API_BASE}/worker/upload-avatar/${userId}`,
          `${API_BASE_ALT}/worker/upload-avatar/${userId}`,
        ];

        for (const avatarEndpoint of avatarEndpoints) {
          try {
            const avatarRes = await fetch(avatarEndpoint, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            if (avatarRes.ok) {
              const avatarData = await avatarRes.json();
              if (avatarData.avatarUrl) {
                updatedUser.avatarUrl = avatarData.avatarUrl;
              }
              break;
            }
          } catch (error) {
            console.warn(`Failed to upload avatar via ${avatarEndpoint}:`, error);
          }
        }
      } catch (error) {
        console.warn("Avatar upload failed:", error);
        // Don't fail the whole update if avatar upload fails
      }
    }

    // Update localStorage
    const finalUser = updatedUser.user || updatedUser;
    if (finalUser) {
      // Ensure we have the proper structure
      const userToStore = {
        ...finalUser,
        _id: finalUser._id || finalUser.id,
        id: finalUser._id || finalUser.id,
      };
      localStorage.setItem("user", JSON.stringify(userToStore));
      currentUser = userToStore;
    }

    showToast("Profile updated successfully!", "success");

    // Reload profile after a short delay
    setTimeout(() => {
      loadProfile();
    }, 1000);
  } catch (error) {
    console.error("Error updating profile:", error);
    showToast(error.message || "Failed to update profile. Please try again.", "error");
  } finally {
    els.saveButton.disabled = false;
    els.saveButton.innerHTML = saveButtonText;
  }
}

// Form submission handler
els.profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  await updateProfile();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize DOM elements first
  initElements();
  
  // Ensure elements exist
  if (!els.profileForm || !els.loadingState) {
    console.error("Required form elements not found. Elements:", els);
    // Try direct access as fallback
    const form = document.getElementById("profileForm");
    const loading = document.getElementById("loadingState");
    if (form && loading) {
      loading.classList.add("hidden");
      form.classList.remove("hidden");
    }
    return;
  }
  
  // If we have localStorage data, show form immediately with that data
  if (storedUser) {
    currentUser = storedUser;
    
    // Populate form fields immediately
    const firstNameEl = document.getElementById("firstName");
    const lastNameEl = document.getElementById("lastName");
    const userNameEl = document.getElementById("userName");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phoneNumber");
    const cityEl = document.getElementById("city");
    const profileNameEl = document.getElementById("profileName");
    
    if (firstNameEl) firstNameEl.value = storedUser.firstName || "";
    if (lastNameEl) lastNameEl.value = storedUser.lastName || "";
    if (userNameEl) userNameEl.value = storedUser.userName || "";
    if (emailEl) emailEl.value = storedUser.email || "";
    if (phoneEl) phoneEl.value = storedUser.phoneNumber || "";
    if (cityEl) cityEl.value = storedUser.city || "";
    if (profileNameEl) profileNameEl.value = storedUser.profileName || "";
    
    // Set avatar
    if (els.avatarPreview) {
      if (storedUser.avatarUrl) {
        els.avatarPreview.src = storedUser.avatarUrl;
      } else {
        const initials = `${storedUser.firstName?.[0] || ""}${storedUser.lastName?.[0] || ""}`.toUpperCase();
        els.avatarPreview.src = `data:image/svg+xml,${encodeURIComponent(`
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#7f13ec"/>
            <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
          </svg>
        `)}`;
      }
    }
    
    // Show worker fields if worker
    if (storedUser.role === "worker" && els.workerFields) {
      els.workerFields.classList.remove("hidden");
      const workerTypeEl = document.getElementById("workerType");
      if (workerTypeEl) workerTypeEl.value = storedUser.workerType || "";
    }
    
    // Show form immediately
    els.loadingState.classList.add("hidden");
    els.profileForm.classList.remove("hidden");
    
    // Then try to load fresh data in the background
    loadProfile();
  } else {
    // No localStorage data, show loading and fetch
    loadProfile();
  }
  
  // Fallback: show form after 3 seconds even if loading fails
  setTimeout(() => {
    if (els.profileForm && els.profileForm.classList.contains("hidden")) {
      console.warn("Form still hidden after 3 seconds. Showing anyway.");
      if (els.loadingState) els.loadingState.classList.add("hidden");
      els.profileForm.classList.remove("hidden");
      
      // Try to populate from localStorage
      if (storedUser) {
        currentUser = storedUser;
        const firstNameEl = document.getElementById("firstName");
        const lastNameEl = document.getElementById("lastName");
        const userNameEl = document.getElementById("userName");
        const emailEl = document.getElementById("email");
        const phoneEl = document.getElementById("phoneNumber");
        const cityEl = document.getElementById("city");
        const profileNameEl = document.getElementById("profileName");
        
        if (firstNameEl) firstNameEl.value = storedUser.firstName || "";
        if (lastNameEl) lastNameEl.value = storedUser.lastName || "";
        if (userNameEl) userNameEl.value = storedUser.userName || "";
        if (emailEl) emailEl.value = storedUser.email || "";
        if (phoneEl) phoneEl.value = storedUser.phoneNumber || "";
        if (cityEl) cityEl.value = storedUser.city || "";
        if (profileNameEl) profileNameEl.value = storedUser.profileName || "";
      }
    }
  }, 3000);
});

// Make functions globally available for debugging
window.editProfile = {
  loadProfile,
  updateProfile,
  showToast,
};

