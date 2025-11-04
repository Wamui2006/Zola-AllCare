/* ===========================================================
   Zola AllCare — Global Script (assets/script.js)
   Handles: Header nav, year, cookie banner, contact form,
            floating quick nav, and URL prefill.
   =========================================================== */

(function () {
  "use strict";

  // -------------- Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -------------- Header: Mobile Navigation
  function initHeaderNav() {
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    if (!toggle || !menu) return;

    const openMenu = () => {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    };
    const closeMenu = () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const toggleMenu = () => {
      const isOpen = menu.classList.contains("open");
      isOpen ? closeMenu() : openMenu();
    };

    toggle.addEventListener("click", toggleMenu);

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close when clicking a nav link
    $$("#navMenu a").forEach((a) =>
      a.addEventListener("click", () => closeMenu())
    );

    // Close when clicking outside (mobile)
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    });
  }

  // -------------- Footer: Current Year
  function setCurrentYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // -------------- Cookie Banner
  function initCookieBanner() {
    const bar = $("#cookie");
    if (!bar) return;

    const ACCEPT_KEY = "zola_cookie_ok";
    const accepted = localStorage.getItem(ACCEPT_KEY) === "1";
    const btnAccept = $("#cookieAccept");
    const btnMore = $("#cookieMore");

    if (!accepted) {
      // gentle delay to avoid layout jank on load
      setTimeout(() => bar.classList.add("show"), 600);
    }

    btnAccept &&
      btnAccept.addEventListener("click", () => {
        localStorage.setItem(ACCEPT_KEY, "1");
        bar.classList.remove("show");
      });

    btnMore &&
      btnMore.addEventListener("click", () => {
        // If you later add a /privacy.html, scroll or navigate there:
        // location.href = "privacy.html";
        alert(
          "We use essential cookies to improve your browsing experience. No third-party tracking."
        );
      });
  }

  // -------------- Contact Form: Validation + UX
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const status = $("#formStatus");
    const submitBtn = $("#submitBtn");
    const label = submitBtn ? submitBtn.querySelector(".btn-label") : null;
    const spinner = submitBtn ? submitBtn.querySelector(".btn-spinner") : null;

    function setStatus(msg) {
      if (status) status.textContent = msg || "";
    }

    function validateEmail(val) {
      // Simple, safe email check
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    form.addEventListener("submit", (e) => {
      setStatus("");

      const requiredIds = [
        "first_name",
        "last_name",
        "email",
        "service",
        "message",
        "consent",
      ];

      for (const id of requiredIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const isCheckbox = el.type === "checkbox";
        const empty = (el.value || "").trim() === "";

        if ((isCheckbox && !el.checked) || (!isCheckbox && empty)) {
          e.preventDefault();
          setStatus("Please fill in all required fields.");
          try {
            el.focus();
          } catch {}
          return;
        }
      }

      // Extra email sanity
      const email = $("#email");
      if (email && !validateEmail(email.value)) {
        e.preventDefault();
        setStatus("Please enter a valid email address.");
        email.focus();
        return;
      }

      // Loading state for nicer UX (non-blocking)
      if (label && spinner) {
        label.style.display = "none";
        spinner.style.display = "inline-block";
      }
      setStatus("Sending…");
    });
  }

  // -------------- Floating Quick Navigation
  function initQuickNav() {
    const btn = $("#quickNav");
    const menu = $("#quickMenu");
    if (!btn || !menu) return;

    function toggle() {
      const open = menu.classList.contains("show");
      menu.classList.toggle("show", !open);
      menu.setAttribute("aria-hidden", open ? "true" : "false");
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== btn) {
        menu.classList.remove("show");
        menu.setAttribute("aria-hidden", "true");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        menu.classList.remove("show");
        menu.setAttribute("aria-hidden", "true");
      }
    });
  }

  // -------------- URL Prefill for Contact (works if elements exist)
  function prefillFromURL() {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s"); // ZTalk/ZSpace/ZCommunity/AAA/...
    const svc = params.get("svc"); // Adults/Teens/Workspace/...

    const hiddenSubsidiary = $("#subsidiary");
    const hiddenServiceSelected = $("#service_selected");
    const serviceSelect = $("#service");

    if (s && hiddenSubsidiary) hiddenSubsidiary.value = s;
    if (svc && hiddenServiceSelected) hiddenServiceSelected.value = svc;

    // Best-effort selection for the main pillars
    if (s && serviceSelect) {
      const map = { ZTalk: "Z-Talk", ZSpace: "Z-Space", ZCommunity: "Z-Community" };
      if (map[s]) serviceSelect.value = map[s];
    }
  }

  // -------------- Kickoff
  document.addEventListener("DOMContentLoaded", () => {
    initHeaderNav();
    setCurrentYear();
    initCookieBanner();
    initContactForm();
    initQuickNav();
    prefillFromURL();
  });
})();
