const API_BASE = "http://localhost:4000/api";
const token = localStorage.getItem("token");
const storedUser = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !storedUser || storedUser.role !== "employer") {
  window.location.href = "login.html";
}

const applicationId = new URLSearchParams(window.location.search).get("id");
if (!applicationId) {
  window.location.href = "employer-dashboard.html";
}

const els = {
  loadingState: document.getElementById("loadingState"),
  applicantContent: document.getElementById("applicantContent"),
  errorState: document.getElementById("errorState"),
  workerName: document.getElementById("workerName"),
  workerEmail: document.getElementById("workerEmail"),
  workerUserName: document.getElementById("workerUserName"),
  workerAvailability: document.getElementById("workerAvailability"),
  applicationStatus: document.getElementById("applicationStatus"),
  appliedDate: document.getElementById("appliedDate"),
  jobTitle: document.getElementById("jobTitle"),
  jobDescription: document.getElementById("jobDescription"),
  jobLocation: document.getElementById("jobLocation"),
  jobPay: document.getElementById("jobPay"),
  coverLetter: document.getElementById("coverLetter"),
  actionButtons: document.getElementById("actionButtons"),
};

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

async function fetchApplicantDetails() {
  try {
    const res = await fetch(`${API_BASE}/employer/applications/${applicationId}`, { headers });
    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
        showError();
        return;
      }
      throw new Error("Failed to load application details");
    }

    const data = await res.json();
    renderApplicant(data.application, data.job, data.worker);
  } catch (error) {
    console.error(error);
    showError();
  }
}

function renderApplicant(application, job, worker) {
  els.loadingState.classList.add("hidden");
  els.applicantContent.classList.remove("hidden");

  els.workerName.textContent = worker?.name || "Worker";
  els.workerEmail.textContent = worker?.email || "N/A";
  els.workerUserName.textContent = `@${worker?.userName || "username"}`;
  els.workerAvailability.textContent = worker?.availability || "unknown";
  els.jobTitle.textContent = job.title;
  els.jobDescription.textContent = job.description.substring(0, 200) + (job.description.length > 200 ? "..." : "");
  els.jobLocation.textContent = job.location || "Flexible";
  els.jobPay.textContent = job.pay ? currencyFormatter.format(job.pay) : "Negotiable";
  els.coverLetter.textContent = application.coverLetter || "No cover letter provided.";

  // Status
  const statusColors = {
    pending: "bg-amber-50 text-amber-600",
    accepted: "bg-emerald-50 text-emerald-600",
    rejected: "bg-rose-50 text-rose-600",
  };
  els.applicationStatus.textContent = application.status;
  els.applicationStatus.className = `px-4 py-2 rounded-full text-sm font-semibold ${statusColors[application.status] || statusColors.pending} capitalize`;

  // Dates
  if (application.appliedAt) {
    els.appliedDate.textContent = `Applied on ${new Date(application.appliedAt).toLocaleDateString()}`;
  }

  // Action buttons
  if (application.status === "pending") {
    els.actionButtons.innerHTML = `
      <button onclick="updateStatus('accepted')" class="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600">
        Accept Application
      </button>
      <button onclick="updateStatus('rejected')" class="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600">
        Reject Application
      </button>
    `;
  } else {
    els.actionButtons.innerHTML = `
      <span class="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold">
        Application ${application.status}
      </span>
    `;
  }
}

async function updateStatus(status) {
  if (!confirm(`Are you sure you want to ${status} this application?`)) return;

  try {
    const res = await fetch(`${API_BASE}/employer/applications/${applicationId}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to update application");
    }

    alert(`✅ Application ${status} successfully!`);
    fetchApplicantDetails();
  } catch (error) {
    console.error(error);
    alert(`❌ ${error.message}`);
  }
}

window.updateStatus = updateStatus;

function showError() {
  els.loadingState.classList.add("hidden");
  els.applicantContent.classList.add("hidden");
  els.errorState.classList.remove("hidden");
}

fetchApplicantDetails();

