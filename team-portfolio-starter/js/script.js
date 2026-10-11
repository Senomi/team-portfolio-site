document.addEventListener("DOMContentLoaded", function () {
  initTypingEffect();
  initThemeToggle();
  initMobileMenu();
  initActiveLinkHighlight();
  initContactForm();
  setFooterYear();
});

function findElement(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
}


function initTypingEffect() {
  const target = document.getElementById("typing-text");
  if (!target) return;

  const phrases = [
    "web developers.",
    "a team of four.",
    "Git & GitHub collaborators.",
    "problem solvers."
  ];

  const typingSpeed = 90;     
  const deletingSpeed = 45;   
  const pauseAfterWord = 1500;
  const pauseBeforeNext = 400;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    target.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let letterCount = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      letterCount++;
      target.textContent = phrase.slice(0, letterCount);

      if (letterCount === phrase.length) {
        deleting = true;
        setTimeout(tick, pauseAfterWord);
        return;
      }
      setTimeout(tick, typingSpeed);
    } else {
      letterCount--;
      target.textContent = phrase.slice(0, letterCount);

      if (letterCount === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, pauseBeforeNext);
        return;
      }
      setTimeout(tick, deletingSpeed);
    }
  }

  tick();
}


function initThemeToggle() {
  const button = findElement([
    "#theme-toggle", "#themeToggle",
    "#dark-mode-toggle", "#darkModeToggle",
    ".theme-toggle"
  ]);

  const swapIcon = button !== null &&
    button.children.length === 0 &&
    button.textContent.trim().length <= 2;

  function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);

    if (!button) return;
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.title = isDark ? "Light mode" : "Dark mode";
    if (swapIcon) {
      button.textContent = isDark ? "\u2600" : "\u263E"; 
    }
  }

  applyTheme(loadTheme() === "dark");

  if (!button) return;

  button.addEventListener("click", function () {
    const isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    saveTheme(isDark ? "dark" : "light");
  });
}

function loadTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {
    // Ignore: the theme still changes, it just isn't remembered.
  }
}

function initMobileMenu() {
  const menuButton = findElement([
    "#menu-toggle", "#menuToggle",
    "#menu-btn", "#menuBtn",
    ".menu-toggle", ".hamburger"
  ]);
  const navLinks = findElement([
    "#nav-links", "#navLinks",
    ".nav-links", "header nav ul"
  ]);
  if (!menuButton || !navLinks) return;

  menuButton.setAttribute("aria-expanded", "false");
  if (navLinks.id) {
    menuButton.setAttribute("aria-controls", navLinks.id);
  }

  function setMenuOpen(open) {
    navLinks.classList.toggle("open", open);
    menuButton.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  }

  menuButton.addEventListener("click", function (event) {
    event.stopPropagation();
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}


function initActiveLinkHighlight() {
  let links = document.querySelectorAll('header nav a[href^="#"]');
  if (links.length === 0) {
    links = document.querySelectorAll('nav a[href^="#"]');
  }
  const sections = document.querySelectorAll("main section[id]");
  if (links.length === 0 || sections.length === 0) return;

  function updateActiveLink() {
    const header = document.querySelector("header");
    const headerHeight = header ? header.offsetHeight : 0;
    const checkPoint = window.scrollY + headerHeight + 80;

    let currentId = sections[0].id;
    sections.forEach(function (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (checkPoint >= sectionTop) {
        currentId = section.id;
      }
    });

    const atBottom = window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) {
      currentId = sections[sections.length - 1].id;
    }

    links.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const formMessage = document.getElementById("formMessage");
  if (!form || !nameInput || !emailInput || !messageInput) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.noValidate = true;

  function showMessage(text, isSuccess) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.classList.toggle("success-message", isSuccess);
    formMessage.classList.toggle("error-message", !isSuccess);
    formMessage.style.color = isSuccess ? "" : "#d93025";
    formMessage.setAttribute("role", isSuccess ? "status" : "alert");
  }

  function markInvalid(input, message) {
    input.setAttribute("aria-invalid", "true");
    input.focus();
    showMessage(message, false);
  }

  [nameInput, emailInput, messageInput].forEach(function (input) {
    input.addEventListener("input", function () {
      input.removeAttribute("aria-invalid");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    [nameInput, emailInput, messageInput].forEach(function (input) {
      input.removeAttribute("aria-invalid");
    });

    if (name === "") {
      markInvalid(nameInput, "Please enter your name.");
      return;
    }
    if (email === "") {
      markInvalid(emailInput, "Please enter your email address.");
      return;
    }
    if (!emailPattern.test(email)) {
      markInvalid(emailInput, "Please enter a valid email address (e.g. you@example.com).");
      return;
    }
    if (message === "") {
      markInvalid(messageInput, "Please enter a message.");
      return;
    }

    showMessage("Thanks " + name + "! Your message was sent.", true);
    form.reset();
  });
}


function setFooterYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("#year, #current-year, #currentYear, .year")
    .forEach(function (element) {
      element.textContent = year;
    });
}
