/* ============================================================
   pages/page2.js
   Page 2 : mini-jeu "n'oubliez pas les paroles".
   Trois questions a choix multiples qui se devoilent l'une
   apres l'autre, avec des indices audio.

   Utilitaires communs fournis par common.js (objet "Zam").
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* Recuperation des elements de la page */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const reveal2 = document.getElementById("reveal2");
  const reveal2TextEl = document.getElementById("reveal2Text");

  const board1 = document.getElementById("board1");
  const board2 = document.getElementById("board2");

  const board1Cards = document.querySelectorAll("#board1 .board-card");
  const board2Cards = document.querySelectorAll("#board2 .board-card");
  const board3Cards = document.querySelectorAll("#board3 .board-card");

  const board1Good = document.querySelector(".board1-good");
  const board2Good = document.querySelector(".board2-good");
  const board3Good = document.querySelector(".board3-good");

  const board2Wrap = document.getElementById("board2Wrap");
  const board3Wrap = document.getElementById("board3Wrap");

  const boardError1 = document.getElementById("boardError1");
  const boardError2 = document.getElementById("boardError2");
  const boardError3 = document.getElementById("boardError3");

  const hintAudioBtn1 = document.getElementById("hintAudioBtn1");
  const hintAudioBtn2 = document.getElementById("hintAudioBtn2");
  const hintAudioBtn3 = document.getElementById("hintAudioBtn3");

  const hintAudio1 = document.getElementById("hintAudio1");
  const hintAudio2 = document.getElementById("hintAudio2");
  const hintAudio3 = document.getElementById("hintAudio3");

  /* Constantes de la page */
  const SUCCESS_PAGE = "page3.html";

  const reveal2FullText =
    "Maintenant, n'oubliez-pas les paroles ! Choisissez parmi 4 réponses pour " +
    "compléter les paroles de chansons connues de Zamdane. En cas de doute vous " +
    "pourrez vous aider d'un indice audio.";

  /* Etat de la page : questions 2 et 3 deja affichees ? */
  let board2Shown = false;
  let board3Shown = false;

  /* References de delais pour les messages d'erreur :
     evitent que plusieurs timers se superposent. */
  let errorTimeout1;
  let errorTimeout2;
  let errorTimeout3;

  /* Affiche un message d'erreur sous une question. */
  function showError(errorEl, message, timeoutRefSetter, currentTimeout) {
    if (!errorEl) return;
    clearTimeout(currentTimeout);
    errorEl.classList.remove("show");

    timeoutRefSetter(
      setTimeout(() => {
        errorEl.textContent = message;
        errorEl.classList.add("show");
      }, 120)
    );
  }

  /* Nettoie le message d'erreur d'une question. */
  function clearBoardError(errorEl, timeoutRef) {
    if (!errorEl) return;
    clearTimeout(timeoutRef);
    errorEl.classList.remove("show");
    errorEl.textContent = "";
  }

  /* Defilement anime vers la prochaine question. */
  function smoothScrollToElement(element, duration = 900, offset = 40) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const startY = window.scrollY;
    const targetY = startY + rect.top - offset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const finalY = Math.max(0, Math.min(targetY, maxScroll));
    const distance = finalY - startY;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* Indice audio : un clic lance l'extrait, un second l'arrete
     et le remet au debut. */
  function playHintAudio(button, audio) {
    if (!button || !audio) return;
    button.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  /* Redirection vers la page de revelation de la lettre. */
  function goToRevealPage() {
    Zam.saveProgress(2);
    window.location.href =
      `page5.html?step=2&next=${encodeURIComponent(SUCCESS_PAGE)}`;
  }

  /* Bouton "Decollage" : ouvre/ferme le bloc d'intro */
  Zam.setupDiscoverButton(btn, reveal1);

  /* Apparition du deuxieme bloc au scroll + texte progressif */
  Zam.watchScrollReveal(reveal1, reveal2, () => {
    Zam.typeLetters(reveal2FullText, reveal2TextEl, { msPerChar: 15 });
  });

  /* Question 1 : bonne reponse -> on devoile la question 2 */
  board1Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board1Good) {
        clearBoardError(boardError1, errorTimeout1);
        card.classList.add("correct");

        if (board2Wrap) {
          if (board1) {
            board1.classList.add("board-fade-out");
          }
          if (!board2Shown) {
            board2Shown = true;
            board2Wrap.classList.add("show");
          }
          setTimeout(() => {
            smoothScrollToElement(board2Wrap, 900, 20);
          }, 120);
        }
        return;
      }

      Zam.shakeElement(card);
      showError(
        boardError1,
        "Mauvaise réponse. Réessaie.",
        (t) => { errorTimeout1 = t; },
        errorTimeout1
      );
    });
  });

  /* Question 2 : bonne reponse -> on devoile la question 3 */
  board2Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board2Good) {
        clearBoardError(boardError2, errorTimeout2);
        card.classList.add("correct");

        if (board3Wrap) {
          if (board2) {
            board2.classList.add("board-fade-out");
          }
          if (!board3Shown) {
            board3Shown = true;
            board3Wrap.classList.add("show");
          }
          setTimeout(() => {
            smoothScrollToElement(board3Wrap, 900, 20);
          }, 120);
        }
        return;
      }

      Zam.shakeElement(card);
      showError(
        boardError2,
        "Mauvaise réponse. Réessaie.",
        (t) => { errorTimeout2 = t; },
        errorTimeout2
      );
    });
  });

  /* Question 3 : bonne reponse -> page de revelation */
  board3Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board3Good) {
        clearBoardError(boardError3, errorTimeout3);
        card.classList.add("correct");

        setTimeout(() => {
          goToRevealPage();
        }, 500);
        return;
      }

      Zam.shakeElement(card);
      showError(
        boardError3,
        "Mauvaise réponse. Réessaie.",
        (t) => { errorTimeout3 = t; },
        errorTimeout3
      );
    });
  });

  /* Activation des 3 boutons d'indice audio */
  playHintAudio(hintAudioBtn1, hintAudio1);
  playHintAudio(hintAudioBtn2, hintAudio2);
  playHintAudio(hintAudioBtn3, hintAudio3);
});
