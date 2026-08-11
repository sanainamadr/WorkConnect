// Appliance Repair Booking - Time slot loading functionality
// Handles time slot availability when date changes

(function() {
  'use strict';

  // Define API_BASE - use window.API_BASE if already set, otherwise use default
  const API_BASE = window.API_BASE || "http://localhost:3000/api";

  /**
   * Load time slots for selected worker and date
   */
  async function loadTimeSlots(selectedDate, workerId) {
    if (!workerId || !selectedDate) return;

    try {
      const res = await fetch(`${API_BASE}/workers/${workerId}/availability?date=${selectedDate}`);
      const data = await res.json();
      const timeSelect = document.getElementById("booking-time");
      
      if (timeSelect && data.slots) {
        timeSelect.innerHTML = data.slots
          .map(slot => `<option value="${slot}">${slot}</option>`)
          .join("");
      }
    } catch (err) {
      console.error("Error loading time slots:", err);
    }
  }

  /**
   * Initialize time slot loading functionality
   */
  function initTimeSlotLoader() {
    const dateInput = document.getElementById("booking-date");
    
    if (!dateInput) return;

    dateInput.addEventListener("change", async (e) => {
      const selectedDate = e.target.value;
      const workerId = localStorage.getItem("selectedWorkerId");
      
      if (!workerId || !selectedDate) return;

      await loadTimeSlots(selectedDate, workerId);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimeSlotLoader);
  } else {
    initTimeSlotLoader();
  }
})();




