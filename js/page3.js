window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  /* Récupération des éléments utiles sur cette page :
     bouton d’introduction, bloc de texte,
     pochettes d’album à déplacer
     et bouton de validation du jeu */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const covers = document.querySelectorAll(".album-cover");
  const validateBtn = document.getElementById("validateAlbumsBtn");

  /* Ordre correct des pochettes :
     sert à vérifier si le joueur a bien associé
     chaque album au bon titre */
  const goodOrder = ["cover3", "cover1", "cover5", "cover2", "cover4"];
  const SUCCESS_PAGE = "page4.html";

  /* Variable temporaire :
     garde en mémoire la pochette actuellement déplacée
     pendant le drag and drop */
  let draggedCover = null;

  /* Passage à l’étape suivante :
     met à jour la progression du joueur
     puis ouvre la page de révélation avant le prochain mini-jeu */
  function goToRevealPage() {
    const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
    localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, 3)));
    window.location.href = `page5.html?step=3&next=${encodeURIComponent(SUCCESS_PAGE)}`;
  }

  if (btn && reveal1) {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal1.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Gestion du système de glisser-déposer :
     le joueur peut cliquer sur une pochette et la faire glisser
     sur une autre pour échanger leurs positions */
  covers.forEach((cover) => {
    /* Début du déplacement :
       on garde la pochette sélectionnée
       et on lui ajoute un style visuel pendant le drag */
    cover.addEventListener("dragstart", () => {
      draggedCover = cover;
      cover.classList.add("dragging");
    });

    /* Fin du déplacement :
       vidage de la référence de la pochette déplacée */
    cover.addEventListener("dragend", () => {
      cover.classList.remove("dragging");
      cover.classList.remove("drag-over");
      draggedCover = null;
    });

    /* Autorise le dépôt sur une autre pochette */
    cover.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    /* Quand une pochette passe au-dessus d’une autre :
       on ajoute un effet visuel pour montrer la zone d’échange */
    cover.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (cover !== draggedCover) {
        cover.classList.add("drag-over");
      }
    });

    /* Retire l’effet visuel quand on quitte la zone */
    cover.addEventListener("dragleave", () => {
      cover.classList.remove("drag-over");
    });

    /* Échange réel entre deux pochettes :
       on inverse leurs images, leurs textes alternatifs
       et leur identifiant de couverture */
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

      /* Après un échange :
         on enlève les anciens retours visuels de validation (vert si vrai, rouge si faux)
         pour que le joueur puisse retester proprement */
      firstCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("drag-over");

      /* Animation pour rendre l’échange plus visible */
      setTimeout(() => {
        firstCover.classList.remove("swap-animate");
        secondCover.classList.remove("swap-animate");
      }, 300);
    });
  });

  /* Validation finale du jeu :
     compare l’ordre actuel des pochettes avec l’ordre attendu,
     colore chaque réponse juste ou fausse,
     puis passe à la suite si tout est bon */
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

      /* Si toutes les associations sont bonnes :
         on laisse un petit temps pour voir le résultat
         avant la redirection */
      if (allCorrect) {
        setTimeout(() => {
          goToRevealPage();
        }, 500);
      }
    });
  }
});