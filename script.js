const signupForm = document.getElementById("signup-form");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("form-message");
const year = document.getElementById("year");
const soundToggle = document.getElementById("sound-toggle");
const cursorGlow = document.getElementById("cursor-glow");

year.textContent = new Date().getFullYear();

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();

  if (!email || !emailInput.checkValidity()) {
    formMessage.textContent = "Please enter a valid email address.";
    emailInput.focus();
    return;
  }

  formMessage.textContent =
    "You’re on the list. Tokyo stories are coming your way.";
  signupForm.reset();
});

soundToggle.addEventListener("click", () => {
  const isActive = soundToggle.getAttribute("aria-pressed") === "true";
  soundToggle.setAttribute("aria-pressed", String(!isActive));

  // This demo uses a visual state only.
  // Connect an audio file here later if you want real city ambience.
});

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow) return;

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});
