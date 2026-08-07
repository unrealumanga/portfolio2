(() => {
  "use strict";

  const featuredGrid = document.getElementById("featured-grid");
  const indexList = document.getElementById("project-index-list");
  const dialog = document.getElementById("project-dialog");
  const dialogClose = document.getElementById("dialog-close");
  const dialogPrev = document.getElementById("dialog-prev");
  const dialogNext = document.getElementById("dialog-next");
  const menuButton = document.getElementById("menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const header = document.getElementById("site-header");
  const progressBar = document.getElementById("scroll-progress-bar");

  let activeProjectIndex = 0;
  let projectTrigger = null;

  const projectByKey = new Map(PROJECTS.map((project) => [project.key, project]));

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function projectFor(key) {
    return projectByKey.get(key);
  }

  function firstImage(key) {
    return GALLERIES[key]?.images?.[0];
  }

  function renderFeatured() {
    featuredGrid.innerHTML = FEATURED_PROJECTS.map((key, index) => {
      const project = projectFor(key);
      const image = firstImage(key);
      if (!project || !image) return "";

      return `
        <button class="project-card" type="button" data-project="${escapeHtml(key)}" data-reveal>
          <span class="project-card-media">
            <img
              src="${escapeHtml(image.src)}"
              width="1600"
              height="1000"
              loading="lazy"
              decoding="async"
              alt="${escapeHtml(project.name)} — ${escapeHtml(image.cap)}"
            />
            <span class="project-card-action" aria-hidden="true">↗</span>
          </span>
          <span class="project-card-meta">
            <span class="project-card-number">${String(index + 1).padStart(2, "0")}</span>
            <span>
              <span class="project-card-heading">${escapeHtml(project.name)}</span>
              <span class="project-card-client">${escapeHtml(project.client)}</span>
            </span>
            <span class="project-card-detail">${escapeHtml(project.sector)} · ${escapeHtml(project.year)}</span>
          </span>
        </button>`;
    }).join("");
  }

  function renderIndex() {
    indexList.innerHTML = PROJECTS.map((project, index) => `
      <button class="index-button" type="button" data-project="${escapeHtml(project.key)}">
        <span class="index-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="index-name">${escapeHtml(project.name)}<span class="index-client">${escapeHtml(project.client)}</span></span>
        <span class="index-sector">${escapeHtml(project.sector)}</span>
        <span class="index-year">${escapeHtml(project.year)}</span>
        <span class="index-arrow" aria-hidden="true">↗</span>
      </button>`).join("");
  }

  function renderDialog(project) {
    const gallery = GALLERIES[project.key];
    const images = gallery?.images || [];

    document.getElementById("dialog-kicker").textContent = `${project.sector} — ${project.year}`;
    document.getElementById("dialog-title").textContent = project.name;
    document.getElementById("dialog-counter").textContent = `${String(activeProjectIndex + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`;
    document.getElementById("dialog-meta").innerHTML = `
      <div><dt>Client</dt><dd>${escapeHtml(project.client)}</dd></div>
      <div><dt>Type</dt><dd>${escapeHtml(project.sector)}</dd></div>
      <div><dt>Year</dt><dd>${escapeHtml(project.year)}</dd></div>`;

    document.getElementById("dialog-gallery").innerHTML = images.map((image, index) => `
      <figure class="gallery-item">
        <img
          src="${escapeHtml(image.src)}"
          width="1600"
          height="1000"
          ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
          decoding="async"
          alt="${escapeHtml(project.name)} — ${escapeHtml(image.cap)}"
        />
        <figcaption><span>${escapeHtml(image.cap)}</span><span>${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}</span></figcaption>
      </figure>`).join("");
  }

  function openProject(key, trigger) {
    const index = PROJECTS.findIndex((project) => project.key === key);
    if (index < 0 || !GALLERIES[key]) return;

    activeProjectIndex = index;
    projectTrigger = trigger || projectTrigger;
    renderDialog(PROJECTS[index]);

    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("is-locked");
    }
    dialog.scrollTop = 0;
  }

  function closeProject() {
    if (!dialog.open) return;
    dialog.close();
    document.body.classList.remove("is-locked");
    projectTrigger?.focus({ preventScroll: true });
  }

  function stepProject(direction) {
    activeProjectIndex = (activeProjectIndex + direction + PROJECTS.length) % PROJECTS.length;
    renderDialog(PROJECTS[activeProjectIndex]);
    dialog.scrollTop = 0;
  }

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileMenu.hidden = true;
    document.body.classList.remove("is-locked");
  }

  function toggleMenu() {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
      return;
    }
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    mobileMenu.hidden = false;
    document.body.classList.add("is-locked");
    mobileMenu.querySelector("a")?.focus();
  }

  function updateScrollUi() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function initReveal() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll("[data-reveal]");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealItems.forEach((item) => observer.observe(item));
  }

  renderFeatured();
  renderIndex();
  initReveal();
  updateScrollUi();

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-project]");
    if (trigger) openProject(trigger.dataset.project, trigger);
  });

  dialogClose.addEventListener("click", closeProject);
  dialogPrev.addEventListener("click", () => stepProject(-1));
  dialogNext.addEventListener("click", () => stepProject(1));
  menuButton.addEventListener("click", toggleMenu);
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProject();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeProject();
  });

  document.addEventListener("keydown", (event) => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") stepProject(-1);
    if (event.key === "ArrowRight") stepProject(1);
  });

  window.addEventListener("scroll", updateScrollUi, { passive: true });
})();
