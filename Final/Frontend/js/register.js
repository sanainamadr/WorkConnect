
// Use centralized API config (port 3000)
const API_BASE = "http://localhost:3000/api/auth";

// Safe storage utilities
const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }
};

// Safe DOM access
function safeGetElement(id, context = document) {
  const element = context.getElementById(id);
  if (!element) {
    console.warn(`Element #${id} not found`);
  }
  return element;
}

// ---------- REGISTER ----------
async function handleRegister(e) {
  e.preventDefault();

  const firstName = safeGetElement("firstName")?.value;
  const lastName = safeGetElement("lastName")?.value;
  const userName = safeGetElement("userName")?.value;
  const email = safeGetElement("email")?.value;
  const password = safeGetElement("password")?.value;
  const role = document.querySelector("input[name='user-role']:checked")?.value;

  // Validate required fields
  if (!firstName || !lastName || !userName || !email || !password || !role) {
    alert("❌ Please fill in all required fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
        userName,
        email,
        password,
        role
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Registration failed");
    }

    const data = await res.json();
    
    // Save user data safely
    if (data.user) {
      storage.set("user", data.user);
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    alert("✅ Registered successfully! Please login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Registration error:", err);
    alert("❌ " + (err.message || "Registration failed. Please try again."));
  }
}

// ---------- LOGIN ----------
async function handleLogin(e) {
  e.preventDefault();

  const email = safeGetElement("email")?.value;
  const password = safeGetElement("password")?.value;

  // Validate required fields
  if (!email || !password) {
    alert("❌ Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, role: "worker" }) // Add role if needed
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Login failed");
    }

    const data = await res.json();

    // Save token and user safely
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.user) {
      storage.set("user", data.user);
    }

    alert("✅ Login successful!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Login error:", err);
    alert("❌ " + (err.message || "Login failed. Please try again."));
  }
}

// ---------- AUTH UTILS ----------
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
}

function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
  window.location.href = "login.html";
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  // Safe form selection
  const regForm = document.querySelector("form[action='#'][method='POST']");
  const logForm = document.querySelector("form[action='#'][method='POST']");
  
  // More specific form selection
  const registerForm = document.getElementById("registerForm") || 
                       document.querySelector("form[data-form='register']") ||
                       regForm;
  const loginForm = document.getElementById("loginForm") || 
                    document.querySelector("form[data-form='login']") ||
                    logForm;
  
  if (window.location.pathname.includes("register.html") && registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  if (window.location.pathname.includes("login.html") && loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});
