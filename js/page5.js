window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  const albumWord = document.getElementById("albumWord");
  const finalLetterGame = document.getElementById("finalLetterGame");
  const finalChoices = document.getElementById("finalChoices");
  const finalError = document.getElementById("finalError");
  const promoBlock = document.getElementById("promoBlock");
  const promoCover = document.getElementById("promoCover");
  const finalAudio = document.getElementById("finalAudio");
  const revealText = document.getElementById("revealText");

  const validationAudio = new Audio("../audios/validation.mp3");
  validationAudio.preload = "auto";
  validationAudio.volume = 0.6;

  const params = new URLSearchParams(window.location.search);
  const nextPage = params.get("next");
  const stepFromUrl = Number(params.get("step") || "1");
  const title = "RAHMA";
  const step = Math.max(1, Math.min(title.length - 1, stepFromUrl));

  const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
  localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, step)));

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function playValidationSound() {
    validationAudio.pause();
    validationAudio.currentTime = 0;
    validationAudio.play().catch(() => {});
  }

  function buildLetters() {
    if (!albumWord) return;

    albumWord.innerHTML = "";

    [...title].forEach((letter, index) => {
      const span = document.createElement("span");
      span.className = "album-letter";

      if (index < step - 1) {
        span.textContent = letter;
        span.classList.add("revealed");
      } else if (index === step - 1) {
        span.textContent = letter;
        span.style.opacity = "0";
        span.style.transform = "translateY(16px)";
      } else {
        span.textContent = "_";
      }

      albumWord.appendChild(span);
    });
  }

  function revealCurrentLetter() {
    const letters = albumWord.querySelectorAll(".album-letter");
    const current = letters[step - 1];

    if (!current) return;

    setTimeout(() => {
      current.classList.add("revealed");
      current.style.opacity = "";
      current.style.transform = "";
      playValidationSound();
    }, 400);

    if (step < 4 && nextPage) {
      setTimeout(() => {
        window.location.href = nextPage;
      }, 3200);
    }

    if (step === 4) {
      setTimeout(() => {
        if (revealText) {
          revealText.textContent = "Trouve maintenant la dernière lettre.";
        }

        if (finalLetterGame) {
          finalLetterGame.classList.add("show");
        }

        animateFinalChoices();
      }, 1700);
    }
  }

  function revealLastLetter() {
    const letters = albumWord.querySelectorAll(".album-letter");
    const lastLetter = letters[4];

    if (!lastLetter) return;

    lastLetter.textContent = "A";
    lastLetter.style.opacity = "0";
    lastLetter.style.transform = "translateY(16px)";

    setTimeout(() => {
      lastLetter.classList.add("revealed");
      lastLetter.style.opacity = "";
      lastLetter.style.transform = "";
      playValidationSound();
    }, 120);

    localStorage.setItem("rahmaProgress", "5");
  }

  function showPromo() {
    if (promoBlock) {
      promoBlock.classList.add("show");
    }
  }

  function shakeButton(button) {
    button.classList.add("shake");

    setTimeout(() => {
      button.classList.remove("shake");
    }, 350);
  }

  function startFinalMusic() {
    if (!finalAudio) return;

    finalAudio.volume = 0.18;
    finalAudio.play();
  }

  function toggleFinalMusic() {
    if (!finalAudio || !promoBlock || !promoBlock.classList.contains("show")) return;

    if (finalAudio.paused) {
      finalAudio.play();
    } else {
      finalAudio.pause();
    }
  }

  function buildFinalChoices() {
    if (!finalChoices) return;

    const otherLettersPool = ["E", "I", "O", "U", "Y"];
    const shuffledPool = shuffle(otherLettersPool);
    const choices = shuffle(["A", shuffledPool[0], shuffledPool[1]]);

    finalChoices.innerHTML = "";

    choices.forEach((letter) => {
      const button = document.createElement("button");
      button.className = "final-choice";
      button.type = "button";
      button.dataset.letter = letter;
      button.textContent = letter;

      button.addEventListener("click", () => {
        if (letter === "A") {
          const buttons = finalChoices.querySelectorAll(".final-choice");

          buttons.forEach((btn) => {
            btn.disabled = true;
          });

          button.classList.add("correct");

          if (finalError) {
            finalError.textContent = "";
          }

          revealLastLetter();

          setTimeout(() => {
            if (finalLetterGame) {
              finalLetterGame.classList.remove("show");
            }
          }, 700);

          setTimeout(() => {
            if (revealText) {
              revealText.textContent = "Le dernier album se révèle enfin.";
            }

            showPromo();
            startFinalMusic();
          }, 1200);

          return;
        }

        button.classList.add("wrong");
        shakeButton(button);

        if (finalError) {
          finalError.textContent = "Ce n'est pas la bonne lettre.";
        }

        setTimeout(() => {
          button.classList.remove("wrong");
        }, 500);
      });

      finalChoices.appendChild(button);
    });
  }

  function animateFinalChoices() {
    const buttons = document.querySelectorAll(".final-choice");

    buttons.forEach((button, index) => {
      button.classList.remove("rise-in");
      void button.offsetWidth;

      setTimeout(() => {
        button.classList.add("rise-in");
      }, index * 220);
    });
  }

  if (promoCover) {
    promoCover.addEventListener("click", () => {
      toggleFinalMusic();
    });
  }

  buildLetters();
  buildFinalChoices();
  revealCurrentLetter();
});