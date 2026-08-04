/* ==========================================================================
   Pin Me — notify-me form
   ==========================================================================

   The design mock showed "You're on the list ✓" straight after submit, with
   nothing behind it. Shipping that verbatim would tell people they'd
   subscribed while the address went nowhere, so this has two honest modes:

   - NOTIFY_ENDPOINT empty (the default): the form opens the visitor's mail
     client with a pre-filled message. Nothing is collected by this page, and
     the address only reaches you if they actually press send.
   - NOTIFY_ENDPOINT set: the address is POSTed as JSON to that URL. Works
     as-is with Formspree, Buttondown, ConvertKit, a Cloudflare Worker, or
     anything else that accepts a JSON body.

   Set the endpoint and the success state becomes truthful automatically.
   ========================================================================== */

const NOTIFY_ENDPOINT = "";
const CONTACT_EMAIL = "pinme.dk@gmail.com";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const form = document.querySelector("[data-notify-form]");

if (form) {
  const input = form.querySelector("input[type='email']");
  const button = form.querySelector("button[type='submit']");
  const error = document.querySelector("[data-notify-error]");
  const done = document.querySelector("[data-notify-done]");
  const doneText = done?.querySelector("[data-notify-done-text]");

  const showError = (message) => {
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  };

  const clearError = () => {
    if (error) error.hidden = true;
  };

  const succeed = (message) => {
    if (doneText && message) doneText.textContent = message;
    form.hidden = true;
    clearError();
    if (done) {
      done.hidden = false;
      // Move focus to the confirmation so screen readers announce the change
      // rather than landing on a form that has just vanished.
      done.setAttribute("tabindex", "-1");
      done.focus();
    }
  };

  input?.addEventListener("input", clearError);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = (input?.value || "").trim();

    if (!EMAIL_RE.test(email)) {
      showError("Enter a valid email address");
      input?.focus();
      return;
    }

    if (!NOTIFY_ENDPOINT) {
      // No backend wired up yet — hand off to the visitor's mail client.
      const subject = encodeURIComponent("Notify me when Pin Me launches");
      const body = encodeURIComponent(
        `Please let me know when Pin Me is on the App Store.\n\n${email}\n`,
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      succeed("Your mail app should open — press send and you're on the list.");
      return;
    }

    const originalLabel = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }

    try {
      const response = await fetch(NOTIFY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      succeed("You're on the list ✓");
    } catch {
      showError(
        `Couldn't sign you up just now. Email ${CONTACT_EMAIL} and I'll add you.`,
      );
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  });
}

/* Stamp the current year into the footer so it never goes stale. */
document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
