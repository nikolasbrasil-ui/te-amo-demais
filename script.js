const slides = [...document.querySelectorAll(".slide")];
const index = document.querySelector("#slide-index");
const progressFill = document.querySelector("#progress-fill");
const progressCurrent = document.querySelector("#progress-current");
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");
const textSmallerButton = document.querySelector("#text-smaller");
const textLargerButton = document.querySelector("#text-larger");
const contrastButton = document.querySelector("#contrast-toggle");
const motionButton = document.querySelector("#motion-toggle");
const accessibilityStatus = document.querySelector("#accessibility-status");
const textSizes = ["normal", "large", "larger"];
let textSizeIndex = 0;
let activeSlide = 0;

function setTextSize(nextSizeIndex) {
  textSizeIndex = Math.max(0, Math.min(textSizes.length - 1, nextSizeIndex));
  document.documentElement.dataset.textSize = textSizes[textSizeIndex];
  textSmallerButton.disabled = textSizeIndex === 0;
  textLargerButton.disabled = textSizeIndex === textSizes.length - 1;
  accessibilityStatus.textContent = `Tamanho do texto: ${textSizeIndex + 1} de ${textSizes.length}.`;
}

textSmallerButton.addEventListener("click", () => setTextSize(textSizeIndex - 1));
textLargerButton.addEventListener("click", () => setTextSize(textSizeIndex + 1));

contrastButton.addEventListener("click", () => {
  const enabled = contrastButton.getAttribute("aria-pressed") !== "true";
  document.documentElement.dataset.highContrast = String(enabled);
  contrastButton.setAttribute("aria-pressed", String(enabled));
  contrastButton.setAttribute("aria-label", `${enabled ? "Desativar" : "Ativar"} alto contraste`);
  contrastButton.title = `${enabled ? "Desativar" : "Ativar"} alto contraste`;
  accessibilityStatus.textContent = `Alto contraste ${enabled ? "ativado" : "desativado"}.`;
});

motionButton.addEventListener("click", () => {
  const enabled = motionButton.getAttribute("aria-pressed") !== "true";
  document.documentElement.dataset.reducedMotion = String(enabled);
  motionButton.setAttribute("aria-pressed", String(enabled));
  motionButton.setAttribute("aria-label", `${enabled ? "Ativar" : "Reduzir"} animações`);
  motionButton.title = `${enabled ? "Ativar" : "Reduzir"} animações`;
  accessibilityStatus.textContent = `Animações ${enabled ? "reduzidas" : "ativadas"}.`;
});

function showSlide(nextIndex) {
  activeSlide = Math.max(0, Math.min(slides.length - 1, nextIndex));

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlide;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
  });

  index.querySelectorAll("button").forEach((button, buttonIndex) => {
    const isCurrent = buttonIndex === activeSlide;
    button.classList.toggle("is-current", isCurrent);
    if (isCurrent) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  const page = String(activeSlide + 1).padStart(2, "0");
  progressCurrent.textContent = page;
  progressFill.style.width = `${((activeSlide + 1) / slides.length) * 100}%`;
  previousButton.disabled = activeSlide === 0;
  nextButton.disabled = activeSlide === slides.length - 1;
  history.replaceState(null, "", `#slide-${activeSlide + 1}`);
}

slides.forEach((slide, slideIndex) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "index-button";
  button.setAttribute("aria-label", `Ir para o slide ${slideIndex + 1}: ${slide.dataset.title}`);
  const number = document.createElement("span");
  number.textContent = String(slideIndex + 1).padStart(2, "0");
  const title = document.createElement("span");
  title.textContent = slide.dataset.title;
  button.append(number, title);
  button.addEventListener("click", () => showSlide(slideIndex));
  index.append(button);
});

previousButton.addEventListener("click", () => showSlide(activeSlide - 1));
nextButton.addEventListener("click", () => showSlide(activeSlide + 1));

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => showSlide(Number(button.dataset.go)));
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest(".answer-options, input, textarea, select, [contenteditable='true']")) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") showSlide(activeSlide + 1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") showSlide(activeSlide - 1);
  if (event.key === "Home") showSlide(0);
  if (event.key === "End") showSlide(slides.length - 1);
});

const questions = [...document.querySelectorAll(".quiz-question")];
const scoreValues = [...document.querySelectorAll(".score-value")];
const quizSummaries = [...document.querySelectorAll(".quiz-summary")];
const resetQuizButtons = [...document.querySelectorAll(".reset-quiz")];
const answers = new Map();

function renderQuizProgress() {
  const correctAnswers = [...answers.values()].filter(Boolean).length;
  scoreValues.forEach((score) => {
    score.textContent = `${correctAnswers} / ${questions.length}`;
  });

  let summary;
  if (answers.size !== questions.length) {
    summary = answers.size === 0
      ? "Responda às questões; a explicação aparecerá após cada escolha."
      : `${answers.size} de ${questions.length} respondidas. Confira a explicação após cada escolha.`;
  } else if (correctAnswers === questions.length) {
    summary = "Excelente: você conectou os exemplos aos princípios de cada reação.";
  } else {
    summary = `Resultado: ${correctAnswers} de ${questions.length}. Leia as explicações e tente novamente.`;
  }

  quizSummaries.forEach((item) => {
    item.textContent = summary;
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-choice]");
  if (!button) return;

  const question = button.closest(".quiz-question");
  if (!question || answers.has(question)) return;

  const isCorrect = button.dataset.choice === question.dataset.answer;
  answers.set(question, isCorrect);
  question.querySelectorAll("[data-choice]").forEach((option) => {
    option.disabled = true;
    if (option.dataset.choice === question.dataset.answer) option.classList.add("correct-choice");
    else if (option === button) option.classList.add("incorrect-choice");
  });

  question.querySelector(".answer-feedback").textContent = question.dataset.explanation;
  renderQuizProgress();
});

function resetQuiz() {
  answers.clear();
  questions.forEach((question) => {
    question.querySelectorAll("[data-choice]").forEach((button) => {
      button.disabled = false;
      button.classList.remove("correct-choice", "incorrect-choice");
    });
    question.querySelector(".answer-feedback").textContent = "";
  });
  renderQuizProgress();
}

resetQuizButtons.forEach((button) => {
  button.addEventListener("click", resetQuiz);
});

const hashSlide = Number(location.hash.match(/^#slide-(\d+)$/)?.[1] ?? 1);
showSlide(Number.isFinite(hashSlide) && hashSlide > 0 ? hashSlide - 1 : 0);