// Phase 0: no backend required.
// This script validates input, shows a "Thanks" message, stores a local copy,
// and opens a prefilled email (fallback) so you still receive leads.

(() => {
  const form = document.getElementById("interestForm");
  const statusEl = document.getElementById("formStatus");

  // Change these once Google Workspace is live
  const RECEIVER_EMAIL = "info@SouthLanarkshireBedAndCare.co.uk";
  const SUBJECT = "New register interest (website)";

  const setStatus = (msg, type = "ok") => {
    statusEl.textContent = msg;
    statusEl.className = `form-status ${type}`;
  };

  const normalisePostcode = (pc) =>
    pc
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/[^A-Z0-9 ]/g, "");

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      postcode: normalisePostcode(String(data.get("postcode") || "")),
      email: String(data.get("email") || "").trim(),
      day: String(data.get("day") || "").trim(),
      type: String(data.get("type") || "").trim(),
      message: String(data.get("message") || "").trim(),
      submittedAt: new Date().toISOString(),
      source: "landing-page"
    };

    // Basic validation
    if (!payload.name) return setStatus("Please enter your name.", "bad");
    if (!payload.postcode || payload.postcode.length < 5) return setStatus("Please enter a valid postcode.", "bad");
    if (!payload.email || !isEmail(payload.email)) return setStatus("Please enter a valid email address.", "bad");

    // Store locally (useful for debugging, doesn't replace real capture)
    try {
      const key = "slbc_interest_submissions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    setStatus("Thanks — we’ll email you when we launch in your area.", "ok");
    form.reset();

    // Prefilled mailto fallback so you still get the lead without a backend
    const lines = [
      `Name: ${payload.name}`,
      `Postcode: ${payload.postcode}`,
      `Email: ${payload.email}`,
      payload.day ? `Collection day: ${payload.day}` : null,
      payload.type ? `Type: ${payload.type}` : null,
      payload.message ? `Message: ${payload.message}` : null,
      "",
      `Submitted: ${payload.submittedAt}`,
    ].filter(Boolean);

    const body = encodeURIComponent(lines.join("\n"));
    const subject = encodeURIComponent(SUBJECT);

    // Delay a touch so the success message is visible first
    setTimeout(() => {
      window.location.href = `mailto:${RECEIVER_EMAIL}?subject=${subject}&body=${body}`;
    }, 450);
  });
})();