// Use centralized API config (port 3000)
const API_BASE = "http://localhost:3000/api/auth";
 // your backend base URL

// ---------- REGISTER ----------
async function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById("first-name")?.value.trim();
  const lastName = document.getElementById("last-name")?.value.trim();
  const userName = document.getElementById("username")?.value.trim();
  const email = document.getElementById("email-address")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const roleInput = document.querySelector("input[name='user-role']:checked")?.value;
  const role = roleInput ? roleInput.toLowerCase() : null;

  // Basic validation
  if (!firstName || !lastName || !userName || !email || !password || !role) {
    alert("❌ Please fill in all fields before submitting.");
    return;
  }

  // Role-specific fields
  let workerType = null;
  let city = null;
  let phoneNumber = null;

  if (role === "worker") {
    workerType = document.getElementById("worker-type")?.value.trim();
    city = document.getElementById("worker-city")?.value.trim();
    phoneNumber = document.getElementById("phone-number")?.value.trim();

    // Validate worker fields
    if (!workerType || !city || !phoneNumber) {
      alert("❌ Please fill in all worker-specific fields (Worker Type, City, Phone Number).");
      return;
    }

    // Basic phone validation
    if (phoneNumber.length < 10) {
      alert("❌ Please enter a valid phone number (at least 10 digits).");
      return;
    }
  } else if (role === "employer") {
    city = document.getElementById("employer-city")?.value.trim();

    // Validate employer city
    if (!city) {
      alert("❌ Please fill in your city.");
      return;
    }
  }

  try {
    const requestBody = { 
      firstName, 
      lastName, 
      userName: userName, 
      email, 
      password: password, 
      role 
    };

    // Add worker-specific fields if role is worker
    if (role === "worker") {
      requestBody.workerType = workerType;
      requestBody.city = city;
      requestBody.phoneNumber = phoneNumber;
    } else if (role === "employer") {
      // Add city for employers
      requestBody.city = city;
    }

    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: "Registration failed" }));
      throw new Error(data.message || `Registration failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    alert("✅ Registered successfully! Please login.");
    window.location.href = "login.html";
  } catch (err) {
    if (err.message.includes("fetch")) {
      alert("❌ Cannot connect to server. Please make sure the backend server is running on port 3000.");
      console.error("Network error:", err);
    } else {
      alert("❌ " + err.message);
    }
  }
}
// ---------- LOGIN ----------

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email-address")?.value;
  const password = document.getElementById("password")?.value;
  const roleInput = document.querySelector("input[name='user-role']:checked")?.value;
  const role = roleInput ? roleInput.toLowerCase() : null;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(data.message || `Login failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Login response:", data); // ✅ Check this in dev tools

    // ✅ Store token and user safely
    try {
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }

    alert("✅ Login successful!");
    
    if (data.user.role === "worker") {
      window.location.href = "worker-dashboard.html";
    } else if (data.user.role === "employer") {
      window.location.href = "index.html";
    } else {
      window.location.href = "landing.html"; // fallback for other roles
    }
  } catch (err) {
    if (err.message.includes("fetch") || err.name === "TypeError") {
      alert("❌ Cannot connect to server. Please make sure the backend server is running on port 3000.");
      console.error("Network error:", err);
    } else {
      alert("❌ " + err.message);
    }
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
  const regForm = document.querySelector("form[action='#'][method='POST']");
  const logForm = document.querySelector("form[action='#'][method='POST']");
  
  if (window.location.pathname.includes("register.html") && regForm) {
    regForm.addEventListener("submit", handleRegister);
  }

  if (window.location.pathname.includes("login.html") && logForm) {
    logForm.addEventListener("submit", handleLogin);
  }

  // Example: add logout button dynamically later
});
