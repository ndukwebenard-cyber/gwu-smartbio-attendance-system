/**
 * GLOBAL WEALTH UNIVERSITY — ONBOARDING TOUR & ROLE LAUNCHER
 * Mobile-First touch-swipeable guided feature showcase and instant demo sandbox switcher
 */

class OnboardingTour {
  constructor() {
    this.STORAGE_KEY = 'smartbio_tour_seen';
    this.currentStep = 1;
    this.totalSteps = 4;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  init() {
    this.bindEvents();
    this.bindTouchGestures();
    
    // Automatically launch on first visit
    const hasSeen = localStorage.getItem(this.STORAGE_KEY);
    if (!hasSeen) {
      this.openTour();
    }
  }

  bindEvents() {
    const overlay = document.getElementById('onboardingOverlay');
    const btnNext = document.getElementById('btnTourNext');
    const btnPrev = document.getElementById('btnTourPrev');
    const btnSkip = document.getElementById('btnTourSkip');
    const btnCloseIcon = document.getElementById('btnTourCloseIcon');
    const btnRestart = document.getElementById('btnRestartTour');

    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevStep());
    if (btnSkip) btnSkip.addEventListener('click', () => this.closeTour());
    if (btnCloseIcon) btnCloseIcon.addEventListener('click', () => this.closeTour());
    if (btnRestart) btnRestart.addEventListener('click', () => this.openTour(1));

    // Interactive Stepper Dots (Click to jump to any step)
    document.querySelectorAll('.stepper-dot').forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        this.openTour(idx + 1);
      });
    });

    // Role launcher cards on Slide 4
    document.querySelectorAll('.role-entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const role = card.dataset.role;
        const userId = card.dataset.userId;
        if (role) {
          window.smartBioApp.switchRole(role, userId);
          this.closeTour();
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!overlay || !overlay.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') this.nextStep();
      if (e.key === 'ArrowLeft') this.prevStep();
    });
  }

  // Mobile Touch Swipe Gesture Support
  bindTouchGestures() {
    const card = document.querySelector('.onboarding-card');
    if (!card) return;

    card.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchEndX - this.touchStartX;

    if (diff < -swipeThreshold) {
      // Swiped Left -> Next Step
      this.nextStep();
    } else if (diff > swipeThreshold) {
      // Swiped Right -> Previous Step
      this.prevStep();
    }
  }

  openTour(step = 1) {
    this.currentStep = step;
    this.renderStep();
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.classList.add('active');
  }

  closeTour() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.closeTour();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderStep();
    }
  }

  renderStep() {
    // Hide all slides
    document.querySelectorAll('.tour-slide').forEach(slide => slide.classList.remove('active'));
    
    // Show current slide
    const targetSlide = document.getElementById(`tourSlide${this.currentStep}`);
    if (targetSlide) targetSlide.classList.add('active');

    // Update stepper dots
    document.querySelectorAll('.stepper-dot').forEach((dot, idx) => {
      dot.className = 'stepper-dot';
      if (idx + 1 === this.currentStep) {
        dot.classList.add('active');
      } else if (idx + 1 < this.currentStep) {
        dot.classList.add('completed');
      }
    });

    // Update buttons
    const btnPrev = document.getElementById('btnTourPrev');
    const btnNext = document.getElementById('btnTourNext');

    if (btnPrev) {
      btnPrev.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    if (btnNext) {
      if (this.currentStep === this.totalSteps) {
        btnNext.innerText = 'Start Exploring →';
        btnNext.className = 'btn btn-primary';
      } else {
        btnNext.innerText = 'Continue →';
        btnNext.className = 'btn btn-primary';
      }
    }
  }
}

window.smartBioTour = new OnboardingTour();
