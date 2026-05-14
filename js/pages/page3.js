/* ============================================================
   pages/page3.js
   Page 3 : mini-jeu d'association des pochettes.
   Le joueur glisse-depose les pochettes pour les placer en
   face des bons titres, puis valide.

   Utilitaires communs fournis par common.js (objet "Zam").
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* Recuperation des elements de la page */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const covers = document.querySelectorAll(".album-cover");
  const validateBtn = document.getElementById("validateAlbumsBtn");

  /* Ordre correct des pochettes (pour la verification) */
  const goodOrder = ["cover3", "cover1", "cover5", "cover2", "cover4"];
  const SUCCESS_PAGE = "page4.html";

  /* Pochette actuellement deplacee pendant le drag and drop */
  let draggedCover = null;

  /* Passage a la page de revelation de la lettre. */
  function goToRevealPage() {
    Zam.saveProgress(3);
    window.location.href =
      `page5.html?step=3&next=${encodeURIComponent(SUCCESS_PAGE)}`;
  }

  /* Bouton "Envol" : ouvre/ferme le bloc d'intro */
  Zam.setupDiscoverButton(btn, reveal1);

  /* Systeme de glisser-deposer : on echange deux pochettes
     en faisant glisser l'une sur l'autre. */
  covers.forEach((cover) => {
    /* Debut du deplacement */
    cover.addEventListener("dragstart", () => {
      draggedCover = cover;
      cover.classList.add("dragging");
    });

    /* Fin du deplacement */
    cover.addEventListener("dragend", () => {
      cover.classList.remove("dragging");
      cover.classList.remove("drag-over");
      draggedCover = null;
    });

    /* Autorise le depot sur une autre pochette */
    cover.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    /* Survol d'une autre pochette : effet visuel de zone cible */
    cover.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (cover !== draggedCover) {
        cover.classList.add("drag-over");
      }
    });

    /* Sortie de la zone : on retire l'effet visuel */
    cover.addEventListener("dragleave", () => {
      cover.classList.remove("drag-over");
    });

    /* Echange reel entre deux pochettes : on inverse leurs
       images, textes alternatifs et identifiants. */
    cover.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!draggedCover || draggedCover === cover) return;

      const firstCover = draggedCover;
      const secondCover = cover;

      firstCover.classList.add("swap-animate");
      secondCover.classList.add("swap-animate");

      const draggedSrc = firstCover.src;
      const draggedAlt = firstCover.alt;
      const draggedData = firstCover.dataset.cover;

      firstCover.src = secondCover.src;
      firstCover.alt = secondCover.alt;
      firstCover.dataset.cover = secondCover.dataset.cover;

      secondCover.src = draggedSrc;
      secondCover.alt = draggedAlt;
      secondCover.dataset.cover = draggedData;

      /* On enleve les anciens retours de validation pour
         que le joueur puisse retester proprement. */
      firstCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("drag-over");

      setTimeout(() => {
        firstCover.classList.remove("swap-animate");
        secondCover.classList.remove("swap-animate");
      }, 300);
    });
  });

  /* Validation finale : on compare l'ordre actuel a l'ordre
     attendu, on colore chaque pochette, et si tout est bon
     on passe a la suite. */
  if (validateBtn) {
    validateBtn.addEventListener("click", () => {
      const currentCovers = document.querySelectorAll(".album-cover");
      let allCorrect = true;

      currentCovers.forEach((cover, index) => {
        cover.classList.remove("correct", "wrong");

        if (cover.dataset.cover === goodOrder[index]) {
          cover.classList.add("correct");
        } else {
          cover.classList.add("wrong");
          allCorrect = false;
        }
      });

      if (allCorrect) {
        setTimeout(() => {
          goToRevealPage();
        }, 500);
      }
    });
  }
});
