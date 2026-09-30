const business = {
  whatsappNumber: "",
  phoneNumber: "",
  tikTokUrl: ""
};

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const portfolioCards = [...document.querySelectorAll(".portfolio-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const portfolioCounter = document.querySelector("#portfolio-counter");
const projectDialog = document.querySelector("#project-dialog");
const enquiryForm = document.querySelector("#enquiry-form");
const formStatus = document.querySelector("#form-status");
const configuredWhatsAppNumber = business.whatsappNumber.replace(/\D/g, "");
const configuredPhoneNumber = business.phoneNumber.replace(/\D/g, "");

document.querySelector("#current-year").textContent = new Date().getFullYear();

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    siteNav.classList.toggle("is-open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("is-open");
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    portfolioCards.forEach((card) => {
      card.classList.toggle("is-hidden", activeFilter !== "all" && card.dataset.category !== activeFilter);
    });

    const visibleCount = portfolioCards.filter((card) => !card.classList.contains("is-hidden")).length;
    if (portfolioCounter) {
      portfolioCounter.textContent = `${String(visibleCount).padStart(2, "0")} — ${String(portfolioCards.length).padStart(2, "0")}`;
    }
  });
});

function updateProjectMetadata(card) {
  const category = card.querySelector(".project-meta span:first-child").textContent;
  const location = card.querySelector(".project-meta span:last-child").textContent;
  const title = card.querySelector("h3").textContent;
  const description = card.querySelector("p").textContent;
  const image = card.querySelector("img");

  document.querySelector("#dialog-category").textContent = category;
  document.querySelector("#dialog-location").textContent = location;
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-description").textContent = description;
  document.querySelector("#dialog-image").src = image.src;
  document.querySelector("#dialog-image").alt = image.alt;
  document.querySelector(".share-status").textContent = "";
  document.title = `${title} | Wohlstand Events`;
}

function openProject(card, updateHistory = true) {
  if (!card || !projectDialog || projectDialog.open) return;
  updateProjectMetadata(card);
  projectDialog.showModal();
  document.body.classList.add("dialog-open");
  if (updateHistory) {
    const projectUrl = new URL(window.location.href);
    projectUrl.searchParams.set("project", card.dataset.project);
    history.pushState({ project: card.dataset.project }, "", projectUrl);
  }
}

function closeProject(updateHistory = true) {
  if (!projectDialog || !projectDialog.open) return;
  projectDialog.close();
  document.body.classList.remove("dialog-open");
  document.title = "Wohlstand Events | Event Planner & Decorator in Abeokuta";
  if (updateHistory && new URLSearchParams(window.location.search).has("project")) {
    const projectUrl = new URL(window.location.href);
    projectUrl.searchParams.delete("project");
    history.replaceState({}, "", projectUrl);
  }
}

if (projectDialog) {
  portfolioCards.forEach((card) => {
    card.querySelector(".portfolio-image-button")?.addEventListener("click", () => openProject(card));
  });

  projectDialog.querySelector(".dialog-close").addEventListener("click", () => closeProject());
  projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) closeProject();
  });
  projectDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProject();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDialog.open) {
      event.preventDefault();
      closeProject();
    }
  });
  projectDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  window.addEventListener("popstate", () => {
    const projectId = new URLSearchParams(window.location.search).get("project");
    const card = portfolioCards.find((portfolioCard) => portfolioCard.dataset.project === projectId);
    if (card && !projectDialog.open) openProject(card, false);
    if (!card && projectDialog.open) closeProject(false);
  });

  const sharedProject = new URLSearchParams(window.location.search).get("project");
  if (sharedProject) {
    const card = portfolioCards.find((portfolioCard) => portfolioCard.dataset.project === sharedProject);
    if (card) openProject(card, false);
  }

  projectDialog.querySelector(".share-project").addEventListener("click", async () => {
    const shareStatus = projectDialog.querySelector(".share-status");
    const shareData = { title: document.querySelector("#dialog-title").textContent, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareStatus.textContent = "Project link ready to share.";
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        shareStatus.textContent = "Project link copied.";
      } else {
        shareStatus.textContent = "Copy this page address to share the project.";
      }
    } catch (error) {
      if (error.name !== "AbortError") shareStatus.textContent = "Copy this page address to share the project.";
    }
  });
}

function setContactFallback(event) {
  const isPhoneLink = event.currentTarget.matches("[data-phone-link]");
  if (isPhoneLink ? configuredPhoneNumber : configuredWhatsAppNumber) return;
  event.preventDefault();
  if (formStatus && document.querySelector("#enquiry")) {
    formStatus.textContent = "Business contact details are being added. Please use the enquiry form for now.";
    document.querySelector("#enquiry").scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.href = "contact.html#enquiry";
  }
}

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  if (configuredWhatsAppNumber) {
    link.href = `https://wa.me/${configuredWhatsAppNumber}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.addEventListener("click", setContactFallback);
  }
});

document.querySelectorAll("[data-phone-link]").forEach((link) => {
  if (configuredPhoneNumber) {
    link.href = `tel:+${configuredPhoneNumber}`;
  } else {
    link.addEventListener("click", setContactFallback);
  }
});

const tikTokUrl = business.tikTokUrl.trim();
document.querySelectorAll("[data-social-link]").forEach((link) => {
  if (tikTokUrl) {
    link.href = tikTokUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("title", "Add the verified Wohlstand Events TikTok URL in script.js");
    link.addEventListener("click", (event) => event.preventDefault());
  }
});

enquiryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  if (!configuredWhatsAppNumber) {
    formStatus.textContent = "The enquiry form is ready, but a business WhatsApp number must be added in script.js before enquiries can be sent.";
    return;
  }

  const values = new FormData(enquiryForm);
  const message = [
    "Hello Wohlstand Events, I would like to enquire about an event.",
    `Name: ${values.get("name")}`,
    `Phone / WhatsApp: ${values.get("phone")}`,
    values.get("email") && `Email: ${values.get("email")}`,
    `Event type: ${values.get("eventType")}`,
    values.get("eventDate") && `Event date: ${values.get("eventDate")}`,
    values.get("location") && `Location: ${values.get("location")}`,
    values.get("guestCount") && `Estimated guest count: ${values.get("guestCount")}`,
    values.get("message") && `Message: ${values.get("message")}`
  ].filter(Boolean).join("\n");

  formStatus.textContent = "Opening WhatsApp with your event enquiry…";
  window.open(`https://wa.me/${configuredWhatsAppNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});