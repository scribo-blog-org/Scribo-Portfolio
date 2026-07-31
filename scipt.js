const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('nav a');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

sections.forEach((section) => {
  section.classList.add('reveal');
  if (reducedMotion) section.classList.add('is-visible');
  else revealObserver.observe(section);
});

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || !entry.target.id) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

document.querySelectorAll('section[id]').forEach((section) => navObserver.observe(section));

document.querySelectorAll('.stat-card, .workflow-step, .feature-card, .stack-card, .challenge-card, .gallery-item').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (reducedMotion) return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  });
});

const preview = document.querySelector('.hero-preview');
const hero = document.querySelector('.hero');
if (preview && hero && !reducedMotion) {
  hero.addEventListener('pointermove', (event) => {
    preview.style.transform = `translate(${(event.clientX / window.innerWidth - .5) * 10}px, ${(event.clientY / window.innerHeight - .5) * 10}px)`;
  });
  hero.addEventListener('pointerleave', () => { preview.style.transform = ''; });
}

document.querySelectorAll('.gallery-item img, .window img').forEach((image) => {
  image.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    overlay.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
    document.body.append(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', () => overlay.remove());
  });
});
