const CONFIG = {
  businessEmail: window.WNY_AUTOMATION_CONFIG?.businessEmail || "ethan@wnyautomation.com",
  leadEndpoint: window.WNY_AUTOMATION_CONFIG?.leadEndpoint || "/api/leads",
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Install support should never block the marketing site.
    });
  });
}

const mobileMenuButton = document.querySelector(".mobile-menu-button");
const mobileNav = document.querySelector(".mobile-nav-panel");
const mobileNavBackdrop = document.querySelector(".mobile-nav-backdrop");

function setMobileNav(open) {
  if (!mobileMenuButton || !mobileNav || !mobileNavBackdrop) return;
  mobileMenuButton.setAttribute("aria-expanded", open ? "true" : "false");
  mobileNav.hidden = !open;
  mobileNavBackdrop.hidden = !open;
  document.body.classList.toggle("nav-open", open);
}

mobileMenuButton?.addEventListener("click", () => {
  setMobileNav(mobileMenuButton.getAttribute("aria-expanded") !== "true");
});

document.querySelectorAll("[data-mobile-nav-close]").forEach((item) => {
  item.addEventListener("click", () => setMobileNav(false));
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMobileNav(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMobileNav(false);
});

if (window.lucide) {
  window.lucide.createIcons();
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

function getUtmValues() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };
}

function trackEvent(name, params = {}) {
  const payload = {
    event_category: "lead_capture",
    ...params,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, payload);
  }
}

function serializeWorkflowForm(form) {
  const data = new FormData(form);
  const utm = getUtmValues();

  return {
    submittedAt: new Date().toISOString(),
    name: value(data, "name"),
    email: value(data, "email"),
    phone: value(data, "phone"),
    businessName: value(data, "businessName") || value(data, "business"),
    website: value(data, "website"),
    industry: value(data, "industry"),
    manualTask: value(data, "manualTask") || value(data, "task"),
    source: value(data, "pageSource") || form.dataset.source || "website",
    pageUrl: window.location.href,
    pageTitle: document.title,
    utmSource: utm.utmSource,
    utmMedium: utm.utmMedium,
    utmCampaign: utm.utmCampaign,
    userAgent: navigator.userAgent,
    companyWebsite: value(data, "companyWebsite"),
    formVariant: value(data, "formVariant") || form.dataset.formVariant || "",
    conversionPath: value(data, "conversionPath") || form.dataset.conversionPath || "",
    detailFieldsProvided: getProvidedDetailFields(data).join(","),
  };
}

function value(data, key) {
  return data.get(key)?.toString().trim() || "";
}

function getProvidedDetailFields(data) {
  return ["name", "businessName", "business", "industry", "phone", "website"].filter((key) => value(data, key));
}

function draftKey(form) {
  return `wny_workflow_draft:${window.location.pathname}:${form.dataset.conversionPath || form.id || "form"}`;
}

function saveFormDraft(form) {
  try {
    const data = new FormData(form);
    const draft = {};
    for (const [key, value] of data.entries()) {
      if (key !== "companyWebsite") draft[key] = value.toString();
    }
    localStorage.setItem(draftKey(form), JSON.stringify({
      fields: draft,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }));
  } catch (error) {
    // Drafts are a convenience; form submission still works without storage.
  }
}

function restoreFormDraft(form) {
  try {
    const stored = JSON.parse(localStorage.getItem(draftKey(form)) || "{}");
    if (!stored.expiresAt || stored.expiresAt <= Date.now()) {
      localStorage.removeItem(draftKey(form));
      return;
    }
    Object.entries(stored.fields || {}).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field && "value" in field && !field.value) field.value = value;
    });
  } catch (error) {
    // Ignore corrupt local drafts.
  }
}

function clearFormDraft(form) {
  try {
    localStorage.removeItem(draftKey(form));
  } catch (error) {
    // Ignore storage errors.
  }
}

async function sendLead(payload) {
  const response = await fetch(CONFIG.leadEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    body = {};
  }

  if (!response.ok || body.ok === false) {
    throw new Error("Lead submission failed");
  }

  return body;
}

function buildMailto(payload) {
  const subject = encodeURIComponent(`New WNY Business Automation workflow audit request from ${payload.businessName || "website lead"}`);
  const body = encodeURIComponent(
    [
      "New WNY Business Automation workflow audit request",
      "",
      `Task: ${payload.manualTask}`,
      `Business: ${payload.businessName}`,
      `Industry: ${payload.industry}`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || "Not provided"}`,
      `Website: ${payload.website || "Not provided"}`,
      `Page: ${payload.pageUrl}`,
      `Submitted: ${payload.submittedAt}`,
    ].join("\n"),
  );

  return `mailto:${CONFIG.businessEmail}?subject=${subject}&body=${body}`;
}

function setFormStatus(form, message, options = {}) {
  const status = form.querySelector(".form-status");
  if (!status) return;

  const { isError = false, mailto = "" } = options;
  status.textContent = "";
  status.classList.toggle("active", Boolean(message));
  status.classList.toggle("error", isError);

  if (!message) return;

  const text = document.createElement("span");
  text.textContent = message;
  status.append(text);

  if (mailto) {
    const actions = document.createElement("div");
    actions.className = "status-actions";

    if (mailto) {
      actions.append(createStatusLink("Email us directly", mailto));
    }

    status.append(actions);
  }
}

function createStatusLink(label, href, variant = "button-secondary") {
  const link = document.createElement("a");
  link.className = `button ${variant}`;
  link.href = href;
  link.textContent = label;

  if (href.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noopener";
  }

  return link;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href") || "";
  const label = link.textContent.trim().replace(/\s+/g, " ");

  if (href.includes("#workflow-form")) {
    trackEvent("cta_click", {
      conversion_path: "workflow_form",
      cta_label: label,
      cta_href: href,
    });
  }

  if (href.startsWith("mailto:")) {
    trackEvent("email_click", {
      conversion_path: "email",
      cta_label: label,
      cta_href: href,
    });
  }

  if (
    link.classList.contains("header-login") ||
    link.classList.contains("client-login-continue") ||
    href.includes("client-login") ||
    href.includes("client-portal")
  ) {
    trackEvent("client_login_click", {
      conversion_path: "client_portal",
      cta_label: label,
      cta_href: href,
    });
  }
});

const workflowForms = new Set(document.querySelectorAll(".workflow-form, #workflow-form"));

workflowForms.forEach((form) => {
  restoreFormDraft(form);

  form.addEventListener("input", () => saveFormDraft(form));

  form.addEventListener(
    "input",
    () => {
      trackEvent("form_start", {
        conversion_path: form.dataset.conversionPath || "",
        form_variant: form.dataset.formVariant || "",
      });
    },
    { once: true },
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const payload = serializeWorkflowForm(form);

    if (!navigator.onLine) {
      setFormStatus(form, "You appear to be offline. Your draft is saved on this device - reconnect and submit again.", {
        isError: true,
        mailto: buildMailto(payload),
      });
      return;
    }

    submitButton.disabled = true;
    setFormStatus(form, "Sending your workflow request...");

    try {
      await sendLead(payload);
      form.reset();
      clearFormDraft(form);
      trackEvent("lead_submit_success", {
        conversion_path: payload.conversionPath,
        detail_fields_provided: payload.detailFieldsProvided,
        form_variant: payload.formVariant,
      });
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "Free Workflow Audit",
          conversion_path: payload.conversionPath,
        });
      }
      setFormStatus(form, "Thanks - WNY Business Automation will review your workflow and send back a few practical automation ideas.");
    } catch (error) {
      trackEvent("lead_submit_error", {
        conversion_path: payload.conversionPath,
        detail_fields_provided: payload.detailFieldsProvided,
        form_variant: payload.formVariant,
      });
      setFormStatus(form, "Something went wrong. Please try again or email us directly.", {
        isError: true,
        mailto: buildMailto(payload),
      });
    } finally {
      submitButton.disabled = false;
    }
  });
});

const answersSearch = document.querySelector("[data-answers-search]");
const answerFilterButtons = [...document.querySelectorAll("[data-answer-filter]")];
const answerCards = [...document.querySelectorAll(".answer-card")];
const answersStatus = document.querySelector("[data-answers-status]");
const answersEmpty = document.querySelector("[data-answers-empty]");
let activeAnswerCategory = "all";

function normalizeAnswerQuery(value) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function updateAnswerResults() {
  if (!answerCards.length) return;

  const query = normalizeAnswerQuery(answersSearch?.value || "");
  let visibleCount = 0;

  answerCards.forEach((card) => {
    const matchesCategory = activeAnswerCategory === "all" || card.dataset.answerCategory === activeAnswerCategory;
    const matchesQuery = !query || normalizeAnswerQuery(card.dataset.answerSearch || card.textContent).includes(query);
    const isVisible = matchesCategory && matchesQuery;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (answersStatus) {
    answersStatus.textContent = query || activeAnswerCategory !== "all"
      ? `${visibleCount} answer${visibleCount === 1 ? "" : "s"} found`
      : "";
  }
  if (answersEmpty) answersEmpty.hidden = visibleCount !== 0;
}

answerFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAnswerCategory = button.dataset.answerFilter || "all";
    answerFilterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
    updateAnswerResults();
  });
});

answersSearch?.addEventListener("input", updateAnswerResults);

const answerMobileCta = document.querySelector(".answer-mobile-cta");

function updateAnswerMobileCta() {
  if (!answerMobileCta) return;
  const shouldShow = window.innerWidth <= 760 && window.scrollY > 520;
  answerMobileCta.classList.toggle("is-visible", shouldShow);
}

if (answerMobileCta) {
  updateAnswerMobileCta();
  window.addEventListener("scroll", updateAnswerMobileCta, { passive: true });
  window.addEventListener("resize", updateAnswerMobileCta);
}
