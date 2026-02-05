// /assets/js/main.js
(() => {
  const COMPANY = "Ayyam Zaman Events";
  const WA_NUMBER = "971523932018";
  const WA_BASE = `https://wa.me/${WA_NUMBER}?text=`;

  // -----------------------------
  // Helpers
  // -----------------------------
  const encode = (s) => encodeURIComponent(s);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------
  // Set footer year
  // -----------------------------
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -----------------------------
  // Active nav link on scroll
  // -----------------------------
  const sections = ["home","services","portfolio","packages","about","testimonials","faq","contact"]
    .map(id => qs(`#${id}`))
    .filter(Boolean);

  const navLinks = qsa(".navbar .nav-link");
  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, { root: null, threshold: [0.25, 0.4, 0.6] });

  sections.forEach(s => sectionObserver.observe(s));

  // Collapse navbar on link click (mobile)
  qsa(".navbar .nav-link").forEach(link => {
    link.addEventListener("click", () => {
      const collapse = qs("#navMain");
      if (!collapse) return;
      if (collapse.classList.contains("show")) {
        qs(".navbar-toggler")?.click();
      }
    });
  });

  // -----------------------------
  // Scroll-to-top
  // -----------------------------
  const toTopBtn = qs("#toTop");
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (!toTopBtn) return;
    toTopBtn.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // -----------------------------
  // Scroll reveal (IntersectionObserver)
  // -----------------------------
  const revealEls = qsa(".reveal");
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  // -----------------------------
  // Portfolio filter
  // -----------------------------
  const filterButtons = qsa(".filter-group [data-filter]");
  const portfolioItems = qsa(".portfolio-item");

  const applyFilter = (filter) => {
    portfolioItems.forEach(item => {
      const cat = item.getAttribute("data-category");
      const show = (filter === "all") || (cat === filter);
      item.classList.toggle("is-hidden", !show);
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.getAttribute("data-filter") || "all");
    });
  });

  // -----------------------------
  // Portfolio modal (image lightbox)
  // -----------------------------
  const portfolioModal = qs("#portfolioModal");

  portfolioModal?.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;
    if (!trigger) return;

    const title = trigger.getAttribute("data-title") || "Portfolio Item";
    const category = trigger.getAttribute("data-category") || "Event";
    const image = trigger.getAttribute("data-image") || "";

    const modalTitle = qs("#portfolioModalTitle");
    const modalCategory = qs("#portfolioModalCategory");
    const modalImage = qs("#portfolioModalImage");
    const modalWA = qs("#portfolioModalWA");

    if (modalTitle) modalTitle.textContent = title;
    if (modalCategory) modalCategory.textContent = category;

    if (modalImage) {
      modalImage.src = image;
      modalImage.alt = title;
    }

    if (modalWA) {
      const msg = `Hi ${COMPANY}, I'm interested in a similar event to "${title}". My event date is ____ and the location is ____. Please share packages and availability.`;
      modalWA.href = WA_BASE + encode(msg);
    }
  });

  // -----------------------------
  // Package WhatsApp buttons
  // -----------------------------
  qsa(".js-wa-package").forEach(btn => {
    btn.addEventListener("click", () => {
      const pkg = btn.getAttribute("data-package") || "Package";
      const msg = `Hi ${COMPANY}, I'm interested in your "${pkg}" package. My event date is ____ and location is ____. Please share pricing, inclusions, and next steps.`;
      window.open(WA_BASE + encode(msg), "_blank", "noopener");
    });
  });

  // -----------------------------
  // Counters (animate when visible)
  // -----------------------------
  const counters = qsa(".counter");
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-target") || "0", 10);
    const duration = 1100;
    const start = performance.now();

    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  counters.forEach(c => counterObserver.observe(c));

  // -----------------------------
  // Form validation + Toast
  // -----------------------------
  const form = qs("#quoteForm");
  const toastEl = qs("#successToast");
  const toast = toastEl ? new bootstrap.Toast(toastEl, { delay: 4500 }) : null;

  const getFormData = () => {
    const name = (qs("#name")?.value || "").trim();
    const phone = (qs("#phone")?.value || "").trim();
    const email = (qs("#email")?.value || "").trim();
    const type = (qs("#type")?.value || "").trim();
    const message = (qs("#message")?.value || "").trim();
    return { name, phone, email, type, message };
  };

  const validateBasic = (data) => {
    if (data.name.length < 2) return false;
    if (data.phone.length < 7) return false;
    if (!data.email.includes("@") || data.email.length < 5) return false;
    if (!data.type) return false;
    if (data.message.length < 10) return false;
    return true;
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getFormData();

    form.classList.add("was-validated");
    if (!validateBasic(data)) return;

    toast?.show();

    setTimeout(() => {
      form.reset();
      form.classList.remove("was-validated");
    }, 600);
  });

  // Compose WhatsApp from form
  qs("#sendToWhatsApp")?.addEventListener("click", () => {
    const data = getFormData();

    form?.classList.add("was-validated");
    if (!validateBasic(data)) return;

    const msg = [
      `Hi ${COMPANY}, I'd like a quote for my event.`,
      "",
      `Name: ${data.name}`,
      `Phone/WhatsApp: ${data.phone}`,
      `Email: ${data.email}`,
      `Event Type: ${data.type}`,
      "",
      `Details: ${data.message}`
    ].join("\n");

    window.open(WA_BASE + encode(msg), "_blank", "noopener");
  });
})();
