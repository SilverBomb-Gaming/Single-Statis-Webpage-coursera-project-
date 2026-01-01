const recName = document.getElementById("recName");
const recText = document.getElementById("recText");
const submitRec = document.getElementById("submitRec");
const recList = document.getElementById("recommendationList");
const formError = document.getElementById("formError");

const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");

// escape to keep it safe if reviewers paste odd characters
function escapeText(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Task 7: New recommendations get added to existing list
function addRecommendation(name, text) {
  const div = document.createElement("div");
  div.className = "recommendation";
  div.textContent = `“${text}” — ${name}`;
  recList.appendChild(div);
}

// Task 9: pop-up confirmation dialog
function openModal() {
  modalOverlay.classList.add("show");
  modalOverlay.setAttribute("aria-hidden", "false");
  closeModal.focus();
}

function closeModalFn() {
  modalOverlay.classList.remove("show");
  modalOverlay.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", closeModalFn);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModalFn();
});

submitRec.addEventListener("click", () => {
  formError.textContent = "";

  const name = recName.value.trim();
  const text = recText.value.trim();

  if (!name || !text) {
    formError.textContent = "Please enter your name and a recommendation before submitting.";
    return;
  }

  // sanitize (even though we use textContent, this keeps things tidy)
  const safeName = escapeText(name);
  const safeText = escapeText(text);

  addRecommendation(safeName, safeText);

  recName.value = "";
  recText.value = "";

  openModal();
});
