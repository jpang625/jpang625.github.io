const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

function closeNavigation() {
  navToggle?.setAttribute('aria-expanded', 'false');
  navLinks?.classList.remove('is-open');
  document.body.classList.remove('nav-open');
}

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navLinks?.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('nav-open', !isOpen);
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeNavigation);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeNavigation();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960) closeNavigation();
});

const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.hero-dot')];
const caption = document.querySelector('.hero-caption');
const rotationToggle = document.querySelector('.rotation-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const slideLabels = slides.map((slide, index) => slide.dataset.label || `Background ${index + 1}`);
// Rotate sooner while keeping the existing 9-second zoom pace.
const rotationDelay = 7500;
const slideExitCleanupDelay = 850;
const slideExitTimers = new WeakMap();
const slideExitHandlers = new WeakMap();
let activeSlide = 0;
let rotationTimer;
let rotationPaused = reduceMotion.matches;

function prepareSlide(index) {
  if (!slides.length) return;
  slides[(index + slides.length) % slides.length].loading = 'eager';
}

function clearSlideExit(slide) {
  window.clearTimeout(slideExitTimers.get(slide));
  slideExitTimers.delete(slide);
  slide.removeEventListener('transitionend', slideExitHandlers.get(slide));
  slideExitHandlers.delete(slide);
  slide.classList.remove('is-leaving');
  slide.style.removeProperty('--hero-exit-transform');
}

function deactivateSlide(slide) {
  if (!slide.classList.contains('is-active')) return;

  slide.style.setProperty('--hero-exit-transform', getComputedStyle(slide).transform);
  slide.classList.remove('is-active');
  slide.classList.add('is-leaving');

  const finishSlideExit = (event) => {
    if (event && (event.target !== slide || event.propertyName !== 'opacity')) return;
    if (!slide.classList.contains('is-active')) clearSlideExit(slide);
  };
  slide.addEventListener('transitionend', finishSlideExit);
  slideExitHandlers.set(slide, finishSlideExit);

  const exitTimer = window.setTimeout(finishSlideExit, slideExitCleanupDelay);
  slideExitTimers.set(slide, exitTimer);
}

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  prepareSlide(activeSlide);
  prepareSlide(activeSlide + 1);

  slides.forEach((slide, slideIndex) => {
    if (slideIndex === activeSlide) {
      if (!slide.classList.contains('is-active')) {
        clearSlideExit(slide);
        slide.classList.add('is-active');
      }
    } else {
      deactivateSlide(slide);
    }
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-pressed', String(isActive));
  });

  if (caption) {
    caption.textContent = `${slideLabels[activeSlide]} · ${activeSlide + 1} of ${slides.length}`;
  }
}

function stopRotation() {
  window.clearInterval(rotationTimer);
  rotationTimer = undefined;
}

function startRotation() {
  stopRotation();
  if (rotationPaused || reduceMotion.matches || slides.length < 2) return;
  rotationTimer = window.setInterval(() => showSlide(activeSlide + 1), rotationDelay);
}

function updateRotationControl() {
  if (!rotationToggle) return;
  rotationToggle.textContent = rotationPaused ? 'Play' : 'Pause';
  rotationToggle.setAttribute(
    'aria-label',
    rotationPaused ? 'Play background rotation' : 'Pause background rotation'
  );
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    startRotation();
  });
});

rotationToggle?.addEventListener('click', () => {
  rotationPaused = !rotationPaused;
  updateRotationControl();
  startRotation();
});

reduceMotion.addEventListener('change', (event) => {
  rotationPaused = event.matches;
  updateRotationControl();
  startRotation();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopRotation();
  else startRotation();
});

showSlide(0);
updateRotationControl();
startRotation();

const currentYear = document.querySelector('#current-year');
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
