/* ============================================================
   pages/page5.js
   Page 5 : revelation.
   Affichage progressif du mot final (RAHMA), dernier mini-jeu
   pour trouver la derniere lettre, puis bloc de conclusion
   avec la pochette, la musique et les liens des plateformes.

   Utilitaires communs fournis par common.js (objet "Zam").
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* Recuperation des elements de la page */
  const albumWord = document.getElementById("albumWord");
  const finalLetterGame = document.getElementById("finalLetterGame");
  const finalChoices = document.getElementById("finalChoices");
  const finalError = document.getElementById("finalError");
  const promoBlock = document.getElementById("promoBlock");
  const promoCover = document.getElementById("promoCover");
  const finalAudio = document.getElementById("finalAudio");
  const revealText = document.getElementById("revealText");

  /* Son joue a chaque revelation de lettre */
  const validationAudio = new Audio("../assets/audio/validation.mp3");
  validationAudio.preload = "auto";
  validationAudio.volume = 0.6;

  /* Parametres d'URL :
     - "next" : page vers laquelle revenir apres la revelation
     - "step" : quelle lettre du mot RAHMA doit etre affichee */
  const params = new URLSearchParams(window.location.search);
  const nextPage = params.get("next");
  const stepFromUrl = Number(params.get("step") || "1");
  const title = "RAHMA";
  const step = Math.max(1, Math.min(title.length - 1, stepFromUrl));

  /* Sauvegarde de la progression du joueur */
  Zam.saveProgress(step);

  /* Joue le son de validation. */
  function playValidationSound() {
    validationAudio.pause();
    validationAudio.currentTime = 0;
    validationAudio.play().catch(() => {});
  }

  /* Construit le mot final : lettres deja gagnees, lettre en
     cours prete a apparaitre, "_" pour celles qui restent. */
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

  /* Revele la lettre de l'etape courante, puis :
     - etapes 1 a 3 : retour vers la page du mini-jeu suivant
     - etape 4 : ouverture du dernier mini-jeu */
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

  /* Revele la toute derniere lettre, quand le joueur trouve
     la bonne reponse du mini-jeu final. */
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

    /* Le mot complet a ete decouvert */
    localStorage.setItem("rahmaProgress", "5");
  }

  /* Affiche le bloc de conclusion. */
  function showPromo() {
    if (promoBlock) {
      promoBlock.classList.add("show");
    }
  }

  /* Lance la musique finale de conclusion. */
  function startFinalMusic() {
    if (!finalAudio) return;
    finalAudio.volume = 0.18;
    finalAudio.play();
  }

  /* Lecture / pause de la musique finale (clic sur la pochette). */
  function toggleFinalMusic() {
    if (!finalAudio || !promoBlock ||
        !promoBlock.classList.contains("show")) {
      return;
    }
    if (finalAudio.paused) {
      finalAudio.play();
    } else {
      finalAudio.pause();
    }
  }

  /* Construit le dernier mini-jeu : 3 boutons de lettres,
     avec la bonne reponse "A" et 2 lettres pieges. */
  function buildFinalChoices() {
    if (!finalChoices) return;

    const otherLettersPool = ["E", "I", "O", "U", "Y"];
    const shuffledPool = Zam.shuffle(otherLettersPool);
    const choices = Zam.shuffle(["A", shuffledPool[0], shuffledPool[1]]);

    finalChoices.innerHTML = "";

    choices.forEach((letter) => {
      const button = document.createElement("button");
      button.className = "final-choice";
      button.type = "button";
      button.dataset.letter = letter;
      button.textContent = letter;

      /* Clic sur une lettre : si bonne, revelation de la
         derniere lettre puis conclusion ; sinon erreur. */
      button.addEventListener("click", () => {
        if (letter === "A") {
          const buttons = finalChoices.querySelectorAll(".final-choice");

          buttons.forEach((b) => {
            b.disabled = true;
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

        /* Mauvaise lettre : effet d'erreur + message */
        button.classList.add("wrong");
        Zam.shakeElement(button);

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

  /* Animation d'apparition des lettres proposees : les 3
     choix montent l'un apres l'autre. */
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

  /* Clic sur la pochette : pause / relance de la musique. */
  if (promoCover) {
    promoCover.addEventListener("click", () => {
      toggleFinalMusic();
    });
  }

  /* Initialisation de la page */
  buildLetters();
  buildFinalChoices();
  revealCurrentLetter();
});
