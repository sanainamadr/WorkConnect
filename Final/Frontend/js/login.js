document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include" // Important for cookies
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");
        // ...existing code...
if (res.ok) {
  alert("Login successful!");

  // Check if user object exists
  if (data.user && data.user.role) {
    if (data.user.role === "worker") {
      window.location.href = "/worker-dashboard.html";
    } else if (data.user.role === "employer") {
      window.location.href = "/employer-dashboard.html";
    } else {
      window.location.href = "/dashboard.html";
    }
  } else {
    alert("Invalid response from server. Please try again.");
  }
} else {
  alert(data.message || "Login failed");
}
// ...existing code...

        // Redirect based on role
        if (data.user.role === "worker") {
          
          window.location.href = "/worker-dashboard.html";

        } else if (data.user.role === "employer") {
         
          window.location.href = "/employer-dashboard.html";
        } else {
          window.location.href = "/dashboard.html";
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});