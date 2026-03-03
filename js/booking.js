/**
 * Math & Matter Booking System
 * Simplified frontend booking system
 */

// Pricing structure
const PRICING = {
  online: 150,
  inPersonNearby: 150,
  inPersonTravel: 200
};

// DOM Elements
let servicesDropdown;
let dateInput;
let timeSlotsContainer;
let locationTypeRadios;
let bookingForm;
let selectedTimeSlot = null;

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
  // Initialize elements
  servicesDropdown = document.getElementById('service');
  dateInput = document.getElementById('booking-date');
  timeSlotsContainer = document.getElementById('time-slots');
  locationTypeRadios = document.querySelectorAll('input[name="locationType"]');
  bookingForm = document.getElementById('booking-form');
  
  // Set min date to today
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  if (dateInput) dateInput.min = formattedDate;
  
  // Add event listeners
  if (dateInput) {
    dateInput.addEventListener('change', generateTimeSlots);
  }
  
  if (servicesDropdown) {
    servicesDropdown.addEventListener('change', function() {
      generateTimeSlots();
      updatePrice();
    });
  }
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
  
  // Location type change listeners
  locationTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const locationField = document.getElementById('location-field');
      if (locationField) {
        locationField.style.display = radio.value === 'online' ? 'none' : 'block';
        if (radio.value === 'online') {
          document.getElementById('location').value = '';
        }
      }
      updatePrice();
    });
  });
  
  // Package type change
  const packageType = document.getElementById('package-type');
  if (packageType) {
    packageType.addEventListener('change', updatePrice);
  }
});

/**
 * Generate available time slots for the selected date
 */
function generateTimeSlots() {
  if (!dateInput || !dateInput.value || !servicesDropdown || !servicesDropdown.value) {
    timeSlotsContainer.innerHTML = '<p>Please select a service and date first</p>';
    return;
  }
  
  // Generate time slots from 8 AM to 6 PM
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  // Display time slots
  timeSlotsContainer.innerHTML = '';
  timeSlots.forEach((time) => {
    const timeSlotElement = document.createElement('div');
    timeSlotElement.classList.add('time-slot');
    timeSlotElement.dataset.time = time;
    timeSlotElement.textContent = time;
    
    timeSlotElement.addEventListener('click', () => selectTimeSlot(time));
    
    timeSlotsContainer.appendChild(timeSlotElement);
  });
}

/**
 * Select a time slot
 */
function selectTimeSlot(time) {
  // Clear previous selection
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Select new slot
  const selectedSlot = document.querySelector(`.time-slot[data-time="${time}"]`);
  if (selectedSlot) {
    selectedSlot.classList.add('selected');
    selectedTimeSlot = time;
    
    // Update hidden input
    const startTimeInput = document.getElementById('start-time');
    if (startTimeInput) {
      startTimeInput.value = time;
    }
  }
}

/**
 * Update price based on selected service and location type
 */
function updatePrice() {
  const priceDisplay = document.getElementById('price-display');
  if (!priceDisplay) return;
  
  if (!servicesDropdown || servicesDropdown.value === '') {
    priceDisplay.textContent = 'Select a service to see price';
    return;
  }
  
  let price = 0;
  const locationType = getSelectedLocationType();
  
  switch (locationType) {
    case 'online':
      price = PRICING.online;
      break;
    case 'inPersonNearby':
      price = PRICING.inPersonNearby;
      break;
    case 'inPersonTravel':
      price = PRICING.inPersonTravel;
      break;
  }
  
  // Apply package discount if selected
  const packageType = document.getElementById('package-type');
  if (packageType) {
    const selectedPackage = packageType.value;
    let discount = 0;
    let hours = 1;
    
    switch (selectedPackage) {
      case '5-hour':
        discount = 0.13;
        hours = 5;
        break;
      case '8-hour':
        discount = 0.13;
        hours = 8;
        break;
      case '10-hour':
        discount = 0.13;
        hours = 10;
        break;
    }
    
    if (hours > 1) {
      const totalPrice = price * hours;
      const discountedPrice = price * (1 - discount);
      const finalPrice = discountedPrice * hours;
      const savings = totalPrice - finalPrice;
      
      priceDisplay.innerHTML = `
        <span>Single session: R${price}/hour</span><br>
        <span>${hours}-hour package: R${discountedPrice.toFixed(0)}/hour</span><br>
        <span>You save: R${savings.toFixed(0)}</span><br>
        <strong>Total: R${finalPrice.toFixed(0)}</strong>
      `;
    } else {
      priceDisplay.textContent = `R${price} per session`;
    }
  } else {
    priceDisplay.textContent = `R${price} per session`;
  }
}

/**
 * Get selected location type
 */
function getSelectedLocationType() {
  for (const radio of locationTypeRadios) {
    if (radio.checked) {
      return radio.value;
    }
  }
  return 'online'; // Default
}

/**
 * Handle booking form submission
 */
async function handleBookingSubmit(event) {
  event.preventDefault();
  
  // Validate form
  if (!validateBookingForm()) {
    return;
  }
  
  try {
    // Show loading state
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    // Prepare form data for Web3Forms
    const formData = new FormData(bookingForm);
    
    // Add formatted message
    const message = `
NEW BOOKING REQUEST

Service: ${formData.get('service')}
Date: ${formData.get('bookingDate')}
Time: ${formData.get('startTime')}
Location Type: ${getSelectedLocationType()}
${formData.get('location') ? 'Location: ' + formData.get('location') : ''}

STUDENT DETAILS:
Name: ${formData.get('studentName')}
Email: ${formData.get('studentEmail')}
Phone: ${formData.get('studentPhone')}
Grade: ${formData.get('studentGrade')}

Package: ${formData.get('packageType')}

Notes: ${formData.get('notes') || 'None'}
    `.trim();
    
    formData.set('message', message);
    
    // Send to Web3Forms (or Formspree if you set it up)
    const response = await fetch(bookingForm.action, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    
    if (response.ok || data.success) {
      showMessage('Booking request submitted successfully! We will contact you to confirm your booking.', 'success');
      
      // Reset form
      bookingForm.reset();
      timeSlotsContainer.innerHTML = '<p>Please select a service and date first</p>';
      selectedTimeSlot = null;
      updatePrice();
    } else {
      showMessage('Failed to submit booking. Please try again or contact us directly.', 'error');
    }
    
  } catch (error) {
    console.error('Error submitting booking:', error);
    showMessage('An error occurred. Please try again or contact us at info@mathandmatter.co.za', 'error');
  }
}

/**
 * Validate booking form
 */
function validateBookingForm() {
  // Check if service is selected
  if (!servicesDropdown.value) {
    showMessage('Please select a service', 'error');
    servicesDropdown.focus();
    return false;
  }
  
  // Check if date is selected
  if (!dateInput.value) {
    showMessage('Please select a date', 'error');
    dateInput.focus();
    return false;
  }
  
  // Check if time slot is selected
  if (!selectedTimeSlot) {
    showMessage('Please select a time slot', 'error');
    timeSlotsContainer.scrollIntoView();
    return false;
  }
  
  // Check student name
  const studentName = document.getElementById('student-name');
  if (!studentName.value.trim()) {
    showMessage('Please enter the student name', 'error');
    studentName.focus();
    return false;
  }
  
  // Check location for in-person bookings
  const locationType = getSelectedLocationType();
  if (locationType !== 'online') {
    const location = document.getElementById('location');
    if (!location.value.trim()) {
      showMessage('Please enter the location for in-person tutoring', 'error');
      location.focus();
      return false;
    }
  }
  
  return true;
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
  // Ensure we have a container
  let messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    document.body.appendChild(messageContainer);
  }

  // Create the toast
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;

  // Add to DOM
  messageContainer.appendChild(messageElement);

  // Auto-remove after 5 seconds (with fade)
  const DISPLAY_MS = 5000;
  const FADE_MS = 300;

  setTimeout(() => {
    // Fade out first
    messageElement.style.transition = `opacity ${FADE_MS}ms ease`;
    messageElement.style.opacity = '0';

    // Then remove from DOM
    setTimeout(() => {
      if (messageElement && messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, FADE_MS);
  }, DISPLAY_MS);
}
