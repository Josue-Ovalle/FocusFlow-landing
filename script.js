// === CONFIGURACIÓN Y CONSTANTES ===
const CONFIG = {
  animationOffset: 100,
  scrollOffset: 80,
  debounceDelay: 50,
  apiEndpoints: {
    contact: '/api/contact',
    subscribe: '/api/subscribe'
  }
};

// === ESTADO DE LA APLICACIÓN ===
const APP_STATE = {
  menuOpen: false,
  formSubmitting: false,
  animationsEnabled: true,
  currentSection: 'hero'
};

// === ELEMENTOS DEL DOM ===
const DOM = {
  navToggle: document.querySelector('.nav__toggle'),
  navList: document.querySelector('.nav__list'),
  header: document.querySelector('.header'),
  contactForm: document.getElementById('signup-form'),
  formEmail: document.getElementById('email'),
  emailError: document.getElementById('email-error'),
  animatedElements: document.querySelectorAll('.feature-card, .testimonial, .pricing-card'),
  navigationLinks: document.querySelectorAll('.nav__link'),
  skipLink: document.querySelector('.skip-link'),
  videoModal: document.getElementById('demo-modal'),
  modalClose: document.querySelector('.modal__close')
};

// === INICIALIZACIÓN DE LA APLICACIÓN ===
class FocusFlowApp {
  constructor() {
    this.init = this.init.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    
    document.addEventListener('DOMContentLoaded', this.init);
  }

  init() {
    this.checkReducedMotion();
    this.initNavigation();
    this.initFormValidation();
    this.initScrollEffects();
    this.initAnimations();
    this.initAccessibility();
    this.initModal();
    this.initServiceWorker();
    
    console.log('FocusFlow App initialized successfully');
  }

  // === MANEJO DE NAVEGACIÓN ===
  initNavigation() {
    if (!DOM.navToggle || !DOM.navList) return;

    DOM.navToggle.addEventListener('click', this.toggleMobileMenu);
    
    DOM.navigationLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleNavigationClick(e);
      });
    });
    
    document.addEventListener('click', (e) => {
      this.handleDocumentClick(e);
    });

    window.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  toggleMobileMenu() {
    APP_STATE.menuOpen = !APP_STATE.menuOpen;
    DOM.navToggle.setAttribute('aria-expanded', APP_STATE.menuOpen);
    DOM.navList.setAttribute('aria-expanded', APP_STATE.menuOpen);
    
    if (APP_STATE.menuOpen) {
      DOM.navList.style.transform = 'translateY(0)';
      DOM.navList.style.opacity = '1';
      DOM.navList.style.visibility = 'visible';
      DOM.navToggle.setAttribute('aria-label', 'Cerrar menú');
    } else {
      DOM.navList.style.transform = 'translateY(-100%)';
      DOM.navList.style.opacity = '0';
      DOM.navList.style.visibility = 'hidden';
      DOM.navToggle.setAttribute('aria-label', 'Abrir menú');
    }
  }

  handleNavigationClick(e) {
    if (APP_STATE.menuOpen) {
      this.toggleMobileMenu();
    }
    
    // Smooth scroll para enlaces internos
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      this.scrollToSection(href.substring(1));
    }
  }

  handleDocumentClick(e) {
    if (APP_STATE.menuOpen && 
        !DOM.navList.contains(e.target) && 
        !DOM.navToggle.contains(e.target)) {
      this.toggleMobileMenu();
    }
  }

  handleKeydown(e) {
    // Cerrar menú con ESC
    if (e.key === 'Escape' && APP_STATE.menuOpen) {
      this.toggleMobileMenu();
    }
    
    // Navegación por teclado en menú
    if (APP_STATE.menuOpen && e.key === 'Tab') {
      this.handleMenuTabNavigation(e);
    }
  }

  handleMenuTabNavigation(e) {
    const focusableElements = DOM.navList.querySelectorAll('a');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - DOM.header.offsetHeight;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  // === VALIDACIÓN DE FORMULARIO ===
  initFormValidation() {
    if (!DOM.contactForm) return;

    DOM.contactForm.addEventListener('submit', this.handleFormSubmit);
    
    if (DOM.formEmail) {
      DOM.formEmail.addEventListener('blur', (e) => this.validateField(e.target));
      DOM.formEmail.addEventListener('input', (e) => this.clearFieldError(e.target));
    }
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
      case 'email':
        if (!value) {
          isValid = false;
          errorMessage = 'El email es requerido';
        } else if (!this.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Por favor ingresa un email válido';
        }
        break;
      default:
        if (!value) {
          isValid = false;
          errorMessage = 'Este campo es requerido';
        }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('error');
    
    if (DOM.emailError) {
      DOM.emailError.textContent = message;
      DOM.emailError.setAttribute('role', 'alert');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    if (DOM.emailError) {
      DOM.emailError.textContent = '';
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (APP_STATE.formSubmitting) return;
    
    // Validar todos los campos
    const fields = DOM.contactForm.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    
    fields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });
    
    if (!allValid) {
      this.showNotification('Por favor corrige los errores en el formulario', 'error');
      return;
    }
    
    APP_STATE.formSubmitting = true;
    
    const submitButton = DOM.contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    
    try {
      const formData = new FormData(DOM.contactForm);
      const response = await this.submitForm(formData);
      
      if (response.success) {
        this.showNotification('¡Gracias por tu interés! Te contactaremos pronto.', 'success');
        DOM.contactForm.reset();
      } else {
        throw new Error(response.message || 'Error en el servidor');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('Error al enviar el formulario. Intenta nuevamente.', 'error');
    } finally {
      APP_STATE.formSubmitting = false;
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  async submitForm(formData) {
    // Simular envío a API - En producción, reemplazar con fetch real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Form submitted successfully'
        });
      }, 1500);
    });
    
    // Código para producción:
    /*
    try {
      const response = await fetch(CONFIG.apiEndpoints.contact, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      
      return await response.json();
    } catch (error) {
      throw new Error('Network error');
    }
    */
  }

  // === EFECTOS DE SCROLL ===
  initScrollEffects() {
    if (!DOM.header) return;
    
    this.lastScrollY = window.scrollY;
    this.ticking = false;
    
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll(); // Ejecutar una vez al cargar
  }

  handleScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateScrollEffects();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  updateScrollEffects() {
    const currentScrollY = window.scrollY;
    
    // Header effects
    if (currentScrollY > 50) {
      DOM.header.classList.add('scrolled');
    } else {
      DOM.header.classList.remove('scrolled');
    }
    
    // Hide header on scroll down
    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      DOM.header.style.transform = 'translateY(-100%)';
    } else {
      DOM.header.style.transform = 'translateY(0)';
    }
    
    this.lastScrollY = currentScrollY;
    
    // Update current section for navigation
    this.updateCurrentSection();
  }

  updateCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + DOM.header.offsetHeight;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        APP_STATE.currentSection = section.id;
        this.updateActiveNavLink(section.id);
      }
    });
  }

  updateActiveNavLink(sectionId) {
    DOM.navigationLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // === ANIMACIONES ===
  initAnimations() {
    if (!APP_STATE.animationsEnabled || !('IntersectionObserver' in window)) return;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.handleElementInViewport(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    DOM.animatedElements.forEach(el => {
      this.observer.observe(el);
    });
  }

  handleElementInViewport(element) {
    element.classList.add('animate-in');
    this.observer.unobserve(element);
  }

  // === MODAL ===
  initModal() {
    const videoButtons = document.querySelectorAll('[data-video-modal]');
    
    if (videoButtons.length && DOM.videoModal && DOM.modalClose) {
      videoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.openModal();
        });
      });
      
      DOM.modalClose.addEventListener('click', () => {
        this.closeModal();
      });
      
      DOM.videoModal.addEventListener('click', (e) => {
        if (e.target === DOM.videoModal) {
          this.closeModal();
        }
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.videoModal.getAttribute('aria-hidden') === 'false') {
          this.closeModal();
        }
      });
    }
  }

  openModal() {
    if (DOM.videoModal) {
      DOM.videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (DOM.videoModal) {
      DOM.videoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // === ACCESIBILIDAD ===
  initAccessibility() {
    if (DOM.skipLink) {
      DOM.skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.focusMainContent();
      });
    }
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.documentElement.classList.remove('keyboard-nav');
    });
  }

  focusMainContent() {
    const target = document.getElementById('main-content');
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      setTimeout(() => target.removeAttribute('tabindex'), 1000);
    }
  }

  // === SERVICIO WORKER (PWA) ===
  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  // === NOTIFICACIONES ===
  showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span class="notification__icon">${this.getNotificationIcon(type)}</span>
      <span class="notification__message">${message}</span>
    `;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type] || icons.info;
  }

  // === UTILIDADES ===
  checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      APP_STATE.animationsEnabled = false;
      document.body.classList.add('reduced-motion');
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// === MANEJO DE ERRORES GLOBALES ===
window.addEventListener('error', (e) => {
  console.error('Error capturado:', e.error);
  // En producción, enviar estos errores a un servicio de tracking
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejection capturada:', e.reason);
  e.preventDefault();
});

// === INICIALIZAR APLICACIÓN ===
const app = new FocusFlowApp();

// === EXPORTAR PARA USO GLOBAL (si es necesario) ===
window.FocusFlow = {
  showNotification: app.showNotification.bind(app),
  validateEmail: app.validateField.bind(app),
  toggleMobileMenu: app.toggleMobileMenu.bind(app)
};

// === POLYFILLS PARA COMPATIBILIDAD ===
// Intersection Observer polyfill para navegadores antiguos
if (!('IntersectionObserver' in window) &&
    !('IntersectionObserverEntry' in window) &&
    !('intersectionRatio' in window.IntersectionObserverEntry.prototype)) {
  
  // Cargar polyfill desde CDN en lugar de importar el paquete
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.js';
  script.onload = () => {
    console.log('Intersection Observer polyfill loaded');
    app.initAnimations();
  };
  script.onerror = (err) => {
    console.warn('Intersection Observer polyfill failed to load:', err);
  };
  document.head.appendChild(script);
}

window.FocusFlowApp = app;