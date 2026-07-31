const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const scrollProgress = document.querySelector('.scroll-progress span');
const updateScrollProgress = () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? window.scrollY / height : 0;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  if (scrollProgress) scrollProgress.style.transform = `scaleX(${clampedProgress})`;
};

updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });

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

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach((counter) => {
      const target = Number(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      if (reducedMotion) {
        counter.textContent = `${target}${suffix}`;
        return;
      }
      const start = performance.now();
      const duration = 1200;
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.45 });

document.querySelectorAll('.stats').forEach((stats) => counterObserver.observe(stats));

const workflow = document.querySelector('.workflow');
const workflowProgress = document.querySelector('.workflow-progress');
const workflowSteps = workflow?.querySelectorAll('.workflow-step');
const updateWorkflow = () => {
  if (!workflow || !workflowProgress || !workflowSteps) return;
  if (reducedMotion) {
    workflowProgress.style.setProperty('--workflow-progress', '1');
    workflowSteps.forEach((step) => step.classList.add('is-active'));
    return;
  }
  const bounds = workflow.getBoundingClientRect();
  const range = Math.max(1, bounds.height + window.innerHeight * 0.35);
  const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - bounds.top) / range));
  workflowProgress.style.setProperty('--workflow-progress', progress);
  workflowSteps.forEach((step, index) => step.classList.toggle('is-active', progress >= index / workflowSteps.length));
};

updateWorkflow();
window.addEventListener('scroll', updateWorkflow, { passive: true });

if (canHover && !reducedMotion) {
  document.querySelectorAll('.gallery-item').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

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
