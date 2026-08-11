// Use centralized API config (port 3000)
const API_BASE = "http://localhost:3000/api";

// Safe storage utilities (inline for now, will use modules later)
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
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

const token = {
  get() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') return decodeURIComponent(value);
    }
    return localStorage.getItem('token');
  }
};

// Safe DOM utilities (inline)
function initElements(selectors, context = document, required = []) {
  const elements = {};
  const missing = [];
  
  Object.entries(selectors).forEach(([key, selector]) => {
    elements[key] = typeof selector === 'string' 
      ? context.querySelector(selector) 
      : selector;
    
    if (required.includes(key) && !elements[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('Missing required elements:', missing);
    return null;
  }
  
  return elements;
}

function safeSetText(element, text, fallback = '') {
  if (element) element.textContent = text || fallback;
}

function safeSetHTML(element, html) {
  if (element) element.innerHTML = html;
}

function safeShow(element) {
  if (element) {
    element.classList.remove('hidden');
    element.style.display = '';
  }
}

function safeHide(element) {
  if (element) {
    element.classList.add('hidden');
    element.style.display = 'none';
  }
}

function safeOn(element, event, handler, options = {}) {
  if (element) element.addEventListener(event, handler, options);
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Check authentication
const authToken = token.get();
const storedUser = storage.get('user');

if (!authToken || !storedUser || storedUser.role !== "employer") {
  window.location.href = "login.html";
}

const jobId = new URLSearchParams(window.location.search).get("id");
if (!jobId) {
  window.location.href = "employer-dashboard.html";
}

// Initialize elements safely
const els = initElements({
  loadingState: '#loadingState',
  jobContent: '#jobContent',
  errorState: '#errorState',
  jobTitle: '#jobTitle',
  jobStatus: '#jobStatus',
  jobCategory: '#jobCategory',
  jobLocation: '#jobLocation',
  jobPay: '#jobPay',
  applicantCount: '#applicantCount',
  applicantCountText: '#applicantCountText',
  jobSkills: '#jobSkills',
  jobDescription: '#jobDescription',
  assignedWorkerSection: '#assignedWorkerSection',
  assignedWorkerName: '#assignedWorkerName',
  assignedWorkerEmail: '#assignedWorkerEmail',
  applicantsContainer: '#applicantsContainer',
  refreshApplicants: '#refreshApplicants',
  editJobBtn: '#editJobBtn',
  deleteJobBtn: '#deleteJobBtn',
  recommendationsSection: '#recommendationsSection',
  recommendationsContainer: '#recommendationsContainer',
  refreshRecommendations: '#refreshRecommendations',
}, document, ['loadingState', 'jobContent', 'errorState', 'jobTitle', 'applicantsContainer']);

if (!els) {
  console.error('Critical elements missing');
  document.body.innerHTML = '<div class="p-4 text-center"><p class="text-red-600">Error: Page elements not found. Please refresh.</p></div>';
}

async function fetchJobDetails() {
  if (!els) return;
  
  try {
    const res = await fetch(`${API_BASE}/employer/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token.get()}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 404 || res.status === 403) {
        showError();
        return;
      }
      throw new Error('Failed to load job details');
    }
    
    const data = await res.json();
    renderJob(data.job, data.applicants);
  } catch (error) {
    console.error('Failed to load job details:', error);
    showError();
  }
}

function renderJob(job, applicants) {
  if (!els) return;
  
  safeHide(els.loadingState);
  safeShow(els.jobContent);

  safeSetText(els.jobTitle, job.title);
  safeSetText(els.jobCategory, job.category || "General");
  safeSetText(els.jobLocation, job.location || "Flexible");
  safeSetText(els.jobPay, job.pay ? formatCurrency(job.pay) : "Negotiable");
  safeSetText(els.jobDescription, job.description);
  
  const applicantText = `${applicants.length} applicant${applicants.length !== 1 ? "s" : ""}`;
  safeSetText(els.applicantCount, applicantText);
  safeSetText(els.applicantCountText, `${applicantText} for this job`);

  // Status
  const statusColors = {
    open: "bg-emerald-50 text-emerald-600",
    "in-progress": "bg-blue-50 text-blue-600",
    paused: "bg-amber-50 text-amber-600",
    closed: "bg-gray-100 text-gray-700",
  };
  
  if (els.jobStatus) {
    safeSetText(els.jobStatus, job.status);
    els.jobStatus.className = `px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] || statusColors.open} capitalize`;
  }

  // Skills
  if (els.jobSkills) {
    if (job.skills && job.skills.length > 0) {
      safeSetHTML(els.jobSkills, job.skills
        .map(
          (skill) =>
            `<span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">${skill}</span>`
        )
        .join(""));
    } else {
      safeSetHTML(els.jobSkills, '<span class="text-ink-muted text-sm">No specific skills required</span>');
    }
  }

  // Assigned worker
  if (job.assignedWorker) {
    safeShow(els.assignedWorkerSection);
    safeSetText(els.assignedWorkerName, job.assignedWorker.name);
    safeSetText(els.assignedWorkerEmail, job.assignedWorker.email);
  } else {
    safeHide(els.assignedWorkerSection);
  }

  // Applicants
  renderApplicants(applicants);

  // Load recommendations asynchronously after the page content is shown
  fetchRecommendations(jobId);
}

function renderApplicants(applicants) {
  if (!els || !els.applicantsContainer) return;
  
  if (!applicants.length) {
    safeSetHTML(els.applicantsContainer,
      '<p class="text-ink-muted text-center py-8 border border-dashed border-gray-200 rounded-xl">No applicants yet. Share this job to attract workers!</p>');
    return;
  }

  const applicantsHTML = applicants
    .map(
      (app) => `
      <div class="border border-gray-100 rounded-xl p-5 bg-white hover:shadow-md transition" data-app-id="${app.id}">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold">${app.worker?.name || "Worker"}</h3>
              <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                app.status === "accepted"
                  ? "bg-emerald-50 text-emerald-600"
                  : app.status === "rejected"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-amber-50 text-amber-600"
              } capitalize">${app.status}</span>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-ink-muted mb-3">
              <span>${app.worker?.email || "N/A"}</span>
              <span>@${app.worker?.userName || "username"}</span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">schedule</span>
                Applied ${new Date(app.appliedAt).toLocaleDateString()}
              </span>
            </div>
            ${app.coverLetter ? `<p class="text-sm text-ink-muted bg-gray-50 rounded-lg p-3 mb-3">${app.coverLetter}</p>` : ""}
          </div>
          <div class="flex gap-2">
            ${app.status === "pending" ? `
              <button data-action="accept" data-app-id="${app.id}" class="accept-btn px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 text-sm">
                Accept
              </button>
              <button data-action="reject" data-app-id="${app.id}" class="reject-btn px-4 py-2 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 text-sm">
                Reject
              </button>
            ` : ""}
            <a href="applicant-detail.html?id=${app.id}" class="px-4 py-2 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-sm">
              View Details
            </a>
          </div>
        </div>
      </div>
    `
    )
    .join("");
  
  safeSetHTML(els.applicantsContainer, applicantsHTML);
  
  // Setup event listeners for accept/reject buttons
  setupApplicantButtons();
}

// ─── Recommendations ───────────────────────────────────────────────────────

async function fetchRecommendations(id) {
  if (!els || !els.recommendationsContainer) return;

  safeSetHTML(
    els.recommendationsContainer,
    '<div class="flex items-center gap-2 text-ink-muted py-6 justify-center"><span class="material-symbols-outlined animate-spin">refresh</span> Loading recommendations...</div>'
  );

  try {
    const res = await fetch(`${API_BASE}/employer/jobs/${id}/recommendations`, {
      headers: {
        Authorization: `Bearer ${token.get()}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    renderRecommendations(data.recommendations || []);
  } catch (error) {
    console.error('Failed to load recommendations:', error);
    safeSetHTML(
      els.recommendationsContainer,
      `<p class="text-rose-500 text-center py-6">Could not load recommendations: ${error.message}</p>`
    );
  }
}

function renderRecommendations(recommendations) {
  if (!els || !els.recommendationsContainer) return;

  if (!recommendations.length) {
    safeSetHTML(
      els.recommendationsContainer,
      '<p class="text-ink-muted text-center py-8 border border-dashed border-gray-200 rounded-xl">No matching workers found yet. Try adding skills to the job posting.</p>'
    );
    return;
  }

  const availabilityConfig = {
    available: { label: 'Available',  cls: 'bg-emerald-50 text-emerald-600' },
    busy:      { label: 'Busy',       cls: 'bg-amber-50  text-amber-600'   },
    offline:   { label: 'Offline',    cls: 'bg-gray-100  text-gray-500'    },
  };

  const html = recommendations.map((rec, index) => {
    const { worker, totalScore, breakdown } = rec;
    const scorePercent  = Math.round(totalScore * 100);
    const avail         = availabilityConfig[worker.availability] || availabilityConfig.offline;

    // Score bar colour
    const barColor = scorePercent >= 70 ? 'bg-emerald-500'
                   : scorePercent >= 40 ? 'bg-amber-400'
                   : 'bg-rose-400';

    // Skill chips – highlight matched vs unmatched
    const jobSkillsLower = (breakdown.matchedSkills || []).map(s => s.toLowerCase());
    const skillChips = (worker.skills || []).map(skill => {
      const matched = jobSkillsLower.includes(skill.toLowerCase());
      return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
        matched ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-500'
      }">${skill}</span>`;
    }).join('');

    // Score breakdown mini-bars
    const components = [
      { label: 'Skills',        value: breakdown.skillOverlap,  weight: 0.45, color: 'bg-primary'    },
      { label: 'Proximity',     value: breakdown.proximity,     weight: 0.25, color: 'bg-blue-500'   },
      { label: 'Experience',    value: breakdown.experience,    weight: 0.20, color: 'bg-violet-500' },
      { label: 'Availability',  value: breakdown.availability,  weight: 0.10, color: 'bg-emerald-500'},
    ];

    const breakdownHTML = components.map(c => {
      const pct = Math.round((c.value / c.weight) * 100); // component's own 0-100
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-20 text-ink-muted shrink-0">${c.label}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-1.5">
            <div class="${c.color} h-1.5 rounded-full transition-all" style="width: ${pct}%"></div>
          </div>
          <span class="w-8 text-right font-semibold text-ink">${pct}%</span>
        </div>`;
    }).join('');

    const distanceTag = breakdown.distanceKm !== null
      ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">near_me</span>${breakdown.distanceKm} km away</span>`
      : (worker.city ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">location_on</span>${worker.city}</span>` : '');

    const expTag = worker.experienceYears > 0
      ? `<span class="flex items-center gap-1"><span class="material-symbols-outlined text-base">work_history</span>${worker.experienceYears} yr${worker.experienceYears !== 1 ? 's' : ''} exp.</span>`
      : '';

    return `
      <div class="border border-gray-100 rounded-xl p-5 bg-white hover:shadow-md transition-all">
        <div class="flex flex-col md:flex-row md:items-start gap-4">

          <!-- Rank badge + score circle -->
          <div class="flex md:flex-col items-center gap-3 md:gap-2 shrink-0">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
              index === 0 ? 'bg-amber-400 text-white'
            : index === 1 ? 'bg-slate-300 text-slate-700'
            : index === 2 ? 'bg-orange-300 text-white'
            : 'bg-gray-100 text-gray-500'
            }">#${index + 1}</div>
            <div class="relative w-12 h-12">
              <svg viewBox="0 0 36 36" class="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="${
                  scorePercent >= 70 ? '#10b981' : scorePercent >= 40 ? '#f59e0b' : '#f43f5e'
                }" stroke-width="3"
                  stroke-dasharray="${Math.round(scorePercent * 0.999)} 100"
                  stroke-linecap="round"/>
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold">${scorePercent}</span>
            </div>
          </div>

          <!-- Worker details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 class="text-base font-semibold text-ink">${worker.name}</h3>
                <p class="text-xs text-ink-muted">@${worker.userName}${worker.workerType ? ` · ${worker.workerType}` : ''}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${avail.cls}">${avail.label}</span>
            </div>

            <div class="flex flex-wrap gap-3 text-xs text-ink-muted my-2">
              ${distanceTag}
              ${expTag}
            </div>

            ${skillChips ? `<div class="flex flex-wrap gap-1 mb-3">${skillChips}</div>` : ''}

            <!-- Score breakdown -->
            <div class="space-y-1.5 mt-3 pt-3 border-t border-gray-100">
              ${breakdownHTML}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  safeSetHTML(els.recommendationsContainer, html);
}


async function updateApplicationStatus(applicationId, status) {
  if (!confirm(`Are you sure you want to ${status} this application?`)) return;

  try {
    const res = await fetch(`${API_BASE}/employer/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.get()}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to update application');
    }

    alert(`✅ Application ${status} successfully!`);
    fetchJobDetails();
  } catch (error) {
    console.error('Failed to update application:', error);
    alert(`❌ ${error.message || "Failed to update application"}`);
  }
}

function setupApplicantButtons() {
  // Setup accept buttons
  const acceptButtons = document.querySelectorAll('.accept-btn');
  acceptButtons.forEach(btn => {
    safeOn(btn, 'click', (e) => {
      e.preventDefault();
      const appId = e.target.getAttribute('data-app-id');
      if (appId) updateApplicationStatus(appId, 'accepted');
    });
  });
  
  // Setup reject buttons
  const rejectButtons = document.querySelectorAll('.reject-btn');
  rejectButtons.forEach(btn => {
    safeOn(btn, 'click', (e) => {
      e.preventDefault();
      const appId = e.target.getAttribute('data-app-id');
      if (appId) updateApplicationStatus(appId, 'rejected');
    });
  });
}

function showError() {
  if (!els) return;
  safeHide(els.loadingState);
  safeHide(els.jobContent);
  safeShow(els.errorState);
}

// Setup event listeners safely
if (els) {
  safeOn(els.refreshApplicants, 'click', fetchJobDetails);
  safeOn(els.refreshRecommendations, 'click', () => fetchRecommendations(jobId));
  
    safeOn(els.deleteJobBtn, 'click', async () => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.get()}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to delete job');

      alert("✅ Job deleted successfully!");
      window.location.href = "employer-dashboard.html";
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert(`❌ ${error.message || "Failed to delete job"}`);
    }
  });
  
  // Load job details on page load
  fetchJobDetails();
}

