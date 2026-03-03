// Math & Matter Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update ARIA attributes
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Also handle keyboard interaction for accessibility
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });
    }
    
    // Close mobile menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Testimonials Slider
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const sliderDots = document.querySelectorAll('.slider-dot');
    
    if (testimonialSlider && testimonialCards.length > 0 && sliderDots.length > 0) {
        let currentSlide = 0;
        
        // Function to update the slider position
        function updateSlider() {
            testimonialSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update active dot and ARIA attributes
            sliderDots.forEach((dot, index) => {
                const isActive = index === currentSlide;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-selected', isActive);
                
                // Update tabindex for better keyboard navigation
                dot.tabIndex = isActive ? 0 : -1;
            });
            
            // Update ARIA attributes for testimonial cards
            testimonialCards.forEach((card, index) => {
                card.setAttribute('aria-hidden', index !== currentSlide);
            });
            
            // Announce slide change for screen readers
            const liveRegion = document.getElementById('slider-live-region');
            if (liveRegion) {
                liveRegion.textContent = `Showing testimonial ${currentSlide + 1} of ${testimonialCards.length}`;
            }
        }
        
        // Create live region for screen reader announcements
        if (!document.getElementById('slider-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'slider-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        // Set up click events for dots
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
            
            // Handle keyboard navigation
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    currentSlide = index;
                    updateSlider();
                }
                
                // Arrow key navigation between dots
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentSlide = (index + 1) % testimonialCards.length;
                    updateSlider();
                    sliderDots[currentSlide].focus();
                }
                
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentSlide = (index - 1 + testimonialCards.length) % testimonialCards.length;
                    updateSlider();
                    sliderDots[currentSlide].focus();
                }
            });
        });
        
        // Initial setup
        updateSlider();
        
        // Auto-advance slides every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonialCards.length;
            updateSlider();
        }, 5000);
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form validation for contact form
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Email validation
            const emailField = contactForm.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    isValid = false;
                    emailField.classList.add('error');
                }
            }
            
            if (isValid) {
                // In a real application, you would send the form data to a server
                // For this demo, we'll just show a success message
                const formMessage = document.querySelector('.form-message');
                if (formMessage) {
                    formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                    formMessage.classList.add('success');
                    contactForm.reset();
                    
                    // Clear the message after 5 seconds
                    setTimeout(() => {
                        formMessage.textContent = '';
                        formMessage.classList.remove('success');
                    }, 5000);
                }
            }
        });
    }
});