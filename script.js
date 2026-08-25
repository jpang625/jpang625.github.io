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
const slideLabels = ['City sunset', 'Lake sunset', 'Blue harbor'];
const rotationDelay = 9000;
let activeSlide = 0;
let rotationTimer;
let rotationPaused = reduceMotion.matches;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === activeSlide);
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
