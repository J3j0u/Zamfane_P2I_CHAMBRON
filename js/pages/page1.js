/* ============================================================
   pages/page1.js
   Page 1 : blindtest.
   Presentation de l'artiste, extrait audio mystere, indices
   et validation de la reponse.

   Les utilitaires communs (reset scroll, clamp01, normalize,
   bouton discover, texte lettre par lettre, surveillance du
   scroll) viennent de common.js via l'objet global "Zam".
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* Recuperation des elements de la page */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const reveal2 = document.getElementById("reveal2");
  const reveal2TextEl =
    document.getElementById("reveal2Text") ||
    (reveal2 ? reveal2.querySelector("p") : null);

  const audioWrap = document.getElementById("audioWrap");
  const answerWrap = document.getElementById("answerWrap");

  const audio = document.getElementById("audioExtrait");
  const audioBtn = document.getElementById("audioBtn");

  const hintImgBtn = document.getElementById("hintImgBtn");
  const hintTextBtn = document.getElementById("hintTextBtn");
  const hintImg = document.getElementById("hintImg");
  const hintText = document.getElementById("hintText");

  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const answerError = document.getElementById("answerError");

  /* Constantes de la page */
  const BONNE_REPONSE = "favaro";
  const SUCCESS_PAGE = "page2.html";

  const reveal2FullText =
    "Zamdane commence par des open mics, puis sort quelques morceaux sans grand succès au départ. " +
    "Cependant, en 2017, il dévoile un titre qui le fait découvrir à un public bien plus large.\n\n" +
    "Saurez-vous retrouver le titre de ce morceau à partir de cet extrait ?\n" +
    "Si vous avez du mal vous pouvez vous aider d'un indice !\n";

  /* Affiche la zone audio puis, un court instant apres,
     le champ de reponse. */
  function showAudioThenAnswer(immediate) {
    if (audioWrap) {
      audioWrap.classList.remove("hidden");
      audioWrap.classList.add("fade-in");
    }
    if (immediate) {
      if (answerWrap) {
        answerWrap.classList.remove("hidden");
        answerWrap.classList.add("fade-in");
      }
      return;
    }
    setTimeout(() => {
      if (answerWrap) {
        answerWrap.classList.remove("hidden");
        answerWrap.classList.add("fade-in");
      }
    }, 800);
  }

  /* Bouton "Presentation" : ouvre/ferme le bloc d'intro */
  Zam.setupDiscoverButton(btn, reveal1);

  /* Apparition du deuxieme bloc au scroll, puis affichage
     progressif du texte narratif et des zones de jeu. */
  Zam.watchScrollReveal(reveal1, reveal2, () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      showAudioThenAnswer(true);
    }
    Zam.typeLetters(reveal2FullText, reveal2TextEl, {
      msPerChar: 15,
      onComplete: () => showAudioThenAnswer(false)
    });
  });

  /* Extrait audio du blindtest : lecture / pause */
  if (audio && audioBtn) {
    audioBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        audioBtn.textContent = "Pause";
        audioBtn.setAttribute("aria-pressed", "true");
      } else {
        audio.pause();
        audioBtn.textContent = "Écouter l'extrait";
        audioBtn.setAttribute("aria-pressed", "false");
      }
    });

    audio.addEventListener("ended", () => {
      audioBtn.textContent = "Écouter l'extrait";
      audioBtn.setAttribute("aria-pressed", "false");
    });
  }

  /* Bouton d'indice visuel : affiche/cache l'image d'indice */
  if (hintImgBtn && hintImg) {
    hintImgBtn.addEventListener("click", () => {
      const isOpen = hintImg.classList.toggle("show");
      hintImgBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Bouton de solution : affiche/cache le texte de reponse */
  if (hintTextBtn && hintText) {
    hintTextBtn.addEventListener("click", () => {
      const isOpen = hintText.classList.toggle("show");
      hintTextBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Validation de la reponse : si correcte, on enregistre la
     progression et on part vers la page de revelation de la
     lettre ; sinon on affiche un message d'erreur. */
  if (answerForm && answerInput && answerError) {
    answerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const user = Zam.normalize(answerInput.value);
      const good = Zam.normalize(BONNE_REPONSE);

      if (user === good) {
        Zam.saveProgress(1);
        window.location.href =
          `page5.html?step=1&next=${encodeURIComponent(SUCCESS_PAGE)}`;
      } else {
        answerError.textContent = "Mauvaise réponse. Réessaie.";
      }
    });

    /* Efface le message d'erreur des que l'utilisateur retape */
    answerInput.addEventListener("input", () => {
      answerError.textContent = "";
    });
  }
});
