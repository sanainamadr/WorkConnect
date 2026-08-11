/**
 * Appliance Repair Booking Page
 * Handles time slot loading when date changes
 */

import { domReady, $, on } from '../utils/dom.js';
import { storage } from '../utils/storage.js';
import { workerService } from '../services/worker-service.js';

/**
 * Load time slots for selected worker and date
 * @param {string} selectedDate - Selected date
 * @param {string} workerId - Worker ID
 */
async function loadTimeSlots(selectedDate, workerId) {
  if (!workerId || !selectedDate) return;

  try {
    const data = await workerService.checkAvailability(workerId, selectedDate);
    const timeSelect = $('#booking-time');
    
    if (timeSelect && data.slots) {
      timeSelect.innerHTML = data.slots
        .map(slot => `<option value="${slot}">${slot}</option>`)
        .join('');
    }
  } catch (error) {
    console.error('Error loading time slots:', error);
    // Show user-friendly error message
    const timeSelect = $('#booking-time');
    if (timeSelect) {
      timeSelect.innerHTML = '<option value="">Error loading time slots</option>';
    }
  }
}

/**
 * Initialize time slot loading functionality
 */
function initTimeSlotLoader() {
  const dateInput = $('#booking-date');
  
  if (!dateInput) return;

  on(dateInput, 'change', async (e) => {
    const selectedDate = e.target.value;
    const workerId = storage.get('selectedWorkerId');
    
    if (!workerId || !selectedDate) return;

    await loadTimeSlots(selectedDate, workerId);
  });
}

// Initialize when DOM is ready
domReady(initTimeSlotLoader);




