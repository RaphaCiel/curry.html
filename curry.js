/* ========================================
   🍛 CURRY RECIPE - JAVASCRIPT FEATURES
   ======================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all features
  initNavbar();
  initThemeToggle();
  initServingsCalculator();
  initIngredientChecklist();
  initTimer();
  initScrollAnimations();
  initSmoothScroll();
});

/* ===== Navbar Scroll Effect ===== */
function initNavbar() {
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.querySelector(".nav-links");

  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
}

/* ===== Dark Mode Toggle ===== */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check for saved preference
  const savedTheme = localStorage.getItem("curry-theme");
  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("curry-theme", newTheme);
    updateThemeIcon(newTheme);

    // Add rotation animation
    themeToggle.style.transform = "rotate(360deg)";
    setTimeout(() => {
      themeToggle.style.transform = "";
    }, 300);
  });

  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }
}

/* ===== Servings Calculator ===== */
function initServingsCalculator() {
  const baseServings = 4;
  let currentServings = 4;

  const decreaseBtn = document.getElementById("decreaseServings");
  const increaseBtn = document.getElementById("increaseServings");
  const servingsDisplay = document.getElementById("servingsCount");
  const ingredientCards = document.querySelectorAll(".ingredient-card");

  // Store base amounts
  ingredientCards.forEach((card) => {
    const amount = parseFloat(card.dataset.amount) || 0;
    card.dataset.baseAmount = amount;
  });

  decreaseBtn.addEventListener("click", () => {
    if (currentServings > 1) {
      currentServings--;
      updateServings();
    }
  });

  increaseBtn.addEventListener("click", () => {
    if (currentServings < 12) {
      currentServings++;
      updateServings();
    }
  });

  function updateServings() {
    servingsDisplay.textContent = currentServings;

    // Update ingredient amounts
    ingredientCards.forEach((card) => {
      const baseAmount = parseFloat(card.dataset.baseAmount) || 0;
      const unit = card.dataset.unit;
      const multiplier = currentServings / baseServings;

      if (unit !== "ตามชอบ" && baseAmount > 0) {
        const newAmount = Math.round(baseAmount * multiplier * 10) / 10;
        const amountSpan = card.querySelector(".amount");
        if (amountSpan) {
          // Animate the number change
          amountSpan.style.transform = "scale(1.2)";
          amountSpan.style.color = "var(--primary)";
          setTimeout(() => {
            amountSpan.textContent = Number.isInteger(newAmount)
              ? newAmount
              : newAmount.toFixed(1);
            amountSpan.style.transform = "";
            amountSpan.style.color = "";
          }, 150);
        }
      }
    });

    // Update hero meta
    const metaValue = document.querySelector(
      ".meta-item:nth-child(3) .meta-value"
    );
    if (metaValue) {
      metaValue.textContent = `${currentServings} ที่`;
    }

    // Add pulse animation to calculator
    const calculator = document.getElementById("servingsCalc");
    calculator.style.transform = "scale(1.02)";
    setTimeout(() => {
      calculator.style.transform = "";
    }, 150);
  }
}

/* ===== Ingredient Checklist ===== */
function initIngredientChecklist() {
  const ingredientCards = document.querySelectorAll(".ingredient-card");

  // Load saved state
  const savedState = JSON.parse(
    localStorage.getItem("curry-ingredients") || "{}"
  );

  ingredientCards.forEach((card, index) => {
    // Restore saved state
    if (savedState[index]) {
      card.classList.add("checked");
      card.querySelector(".ingredient-checkbox").innerHTML = "✓";
    }

    card.addEventListener("click", () => {
      card.classList.toggle("checked");
      const checkbox = card.querySelector(".ingredient-checkbox");

      if (card.classList.contains("checked")) {
        checkbox.innerHTML = "✓";
        // Add check animation
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
          card.style.transform = "";
        }, 150);
      } else {
        checkbox.innerHTML = "";
      }

      // Save state
      const state = {};
      ingredientCards.forEach((c, i) => {
        if (c.classList.contains("checked")) {
          state[i] = true;
        }
      });
      localStorage.setItem("curry-ingredients", JSON.stringify(state));
    });
  });
}

/* ===== Cooking Timer ===== */
function initTimer() {
  let timerInterval = null;
  let timeRemaining = 20 * 60; // Default 20 minutes in seconds
  let isRunning = false;

  const display = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("timerStart");
  const resetBtn = document.getElementById("timerReset");
  const presetBtns = document.querySelectorAll(".timer-preset");

  // Preset buttons
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const minutes = parseInt(btn.dataset.minutes);
      timeRemaining = minutes * 60;

      // Update active state
      presetBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      updateDisplay();

      // Reset if running
      if (isRunning) {
        stopTimer();
        startTimer();
      }
    });
  });

  // Start/Pause button
  startBtn.addEventListener("click", () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  });

  // Reset button
  resetBtn.addEventListener("click", () => {
    stopTimer();
    const activePreset = document.querySelector(".timer-preset.active");
    const minutes = activePreset ? parseInt(activePreset.dataset.minutes) : 20;
    timeRemaining = minutes * 60;
    updateDisplay();
  });

  function startTimer() {
    if (timeRemaining <= 0) return;

    isRunning = true;
    startBtn.innerHTML = "⏸️ หยุด";
    startBtn.classList.remove("start");
    startBtn.classList.add("pause");

    timerInterval = setInterval(() => {
      timeRemaining--;
      updateDisplay();

      if (timeRemaining <= 0) {
        stopTimer();
        timerComplete();
      }
    }, 1000);
  }

  function stopTimer() {
    isRunning = false;
    startBtn.innerHTML = "▶️ เริ่ม";
    startBtn.classList.remove("pause");
    startBtn.classList.add("start");

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    display.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    // Color change when time is low
    if (timeRemaining <= 60 && timeRemaining > 0) {
      display.style.animation = "pulse 0.5s ease-in-out infinite";
    } else {
      display.style.animation = "";
    }
  }

  function timerComplete() {
    // Visual feedback
    display.textContent = "00:00";
    display.style.animation = "pulse 0.3s ease-in-out 5";

    // Sound notification (if supported)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🍛 แกงกะหรี่พร้อมแล้ว!", {
        body: "หมดเวลาแล้ว มาเช็คอาหารกันเถอะ!",
        icon: "🍛",
      });
    }

    // Alert fallback
    setTimeout(() => {
      alert("⏰ หมดเวลาแล้ว! มาเช็คแกงกะหรี่กันเถอะ 🍛");
    }, 100);
  }

  // Initial display
  updateDisplay();

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Stagger animation for child elements
          const cards = entry.target.querySelectorAll(
            ".ingredient-card, .instruction-card, .tip-card, .nutrition-card, .related-card"
          );
          cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";

            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, 100 + index * 100);
          });
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/* ===== Smooth Scroll ===== */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll(".nav-links a, .footer-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const navbarHeight = document.querySelector(".navbar").offsetHeight;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.scrollY -
            navbarHeight -
            20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

/* ===== Utility Functions ===== */

// Debounce function for performance
function debounce(func, wait) {
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

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

console.log("🍛 Curry Recipe Website Loaded Successfully!");
