
window.history.scrollRestoration = "manual";
window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  /* Récupération des éléments principaux de la page :
     zone du mot final, mini-jeu de la dernière lettre,
     bloc de conclusion, musique finale et texte principal */
  const albumWord = document.getElementById("albumWord");
  const finalLetterGame = document.getElementById("finalLetterGame");
  const finalChoices = document.getElementById("finalChoices");
  const finalError = document.getElementById("finalError");
  const promoBlock = document.getElementById("promoBlock");
  const promoCover = document.getElementById("promoCover");
  const finalAudio = document.getElementById("finalAudio");
  const revealText = document.getElementById("revealText");

  /* Préparation du son joué à chaque révélation de lettre */
  const validationAudio = new Audio("../audios/validation.mp3");
  validationAudio.preload = "auto";
  validationAudio.volume = 0.6;

  /* Récupération des paramètres d’URL :
     "next" sert à savoir vers quelle page revenir après la révélation,
     "step" sert à savoir quelle lettre du mot RAHMA doit être affichée */
  const params = new URLSearchParams(window.location.search);
  const nextPage = params.get("next");
  const stepFromUrl = Number(params.get("step") || "1");
  const title = "RAHMA";
  const step = Math.max(1, Math.min(title.length - 1, stepFromUrl));

  /* Sauvegarde de la progression du joueur :
     permet de garder en mémoire jusqu’où il est allé
     dans la découverte du mot final */
  const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
  localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, step)));

  /* Mélange aléatoire d’un tableau :
     utilisé ici pour ne pas afficher les mêmes lettres
     dans le même ordre au dernier mini-jeu */
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* Lecture du son de validation :
     joué quand une nouvelle lettre du mot final apparaît */
  function playValidationSound() {
    validationAudio.pause();
    validationAudio.currentTime = 0;
    validationAudio.play().catch(() => {});
  }

  /* Construction visuelle du mot final :
     affiche les lettres déjà gagnées,
     prépare la lettre en cours à apparaître,
     et laisse des "_" pour celles qui restent à découvrir */
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

  /* Révélation de la lettre correspondant à l’étape actuelle :
     la lettre apparaît avec un petit délai,
     puis selon le cas la page repart vers le mini-jeu suivant
     ou ouvre le dernier jeu pour trouver la dernière lettre */
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

    /* Pour les étapes 1 à 3 :
       après la révélation de la lettre,
       retour automatique vers la page du mini-jeu suivant */
    if (step < 4 && nextPage) {
      setTimeout(() => {
        window.location.href = nextPage;
      }, 3200);
    }

    /* À l’étape 4 :
       changement du texte principal,
       affichage du mini-jeu final
       puis lancement de l’animation des lettres proposées */
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

  /* Révélation de la toute dernière lettre du mot :
     utilisée quand le joueur trouve la bonne réponse
     dans le mini-jeu final */
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

    /* Mise à jour de la progression :
       le mot complet a été découvert */
    localStorage.setItem("rahmaProgress", "5");
  }

  /* Affichage du bloc de conclusion :
     texte final, pochette de l’album et liens externes */
  function showPromo() {
    if (promoBlock) {
      promoBlock.classList.add("show");
    }
  }

  /* Animation d’erreur sur une mauvaise réponse :
     petit effet visuel de secousse sur la lettre choisie */
  function shakeButton(button) {
    button.classList.add("shake");

    setTimeout(() => {
      button.classList.remove("shake");
    }, 350);
  }

  /* Lancement de la musique finale de conclusion */
  function startFinalMusic() {
    if (!finalAudio) return;

    finalAudio.volume = 0.18;
    finalAudio.play();
  }

  /* Lecture / pause de la musique finale :
     utilisée quand l’utilisateur clique sur la pochette */
  function toggleFinalMusic() {
    if (!finalAudio || !promoBlock || !promoBlock.classList.contains("show")) return;

    if (finalAudio.paused) {
      finalAudio.play();
    } else {
      finalAudio.pause();
    }
  }

  /* Construction du dernier mini-jeu :
     création de 3 boutons de lettres,
     avec la bonne réponse "A" et 2 lettres pièges */
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

      /* Gestion du clic sur une lettre :
         si la réponse est bonne, révélation de la dernière lettre
         puis affichage de la conclusion ;
         sinon affichage d’une erreur */
      button.addEventListener("click", () => {
        if (letter === "A") {
          const buttons = finalChoices.querySelectorAll(".final-choice");

          /* Une fois la bonne réponse trouvée :
             désactivation des autres boutons */
          buttons.forEach((btn) => {
            btn.disabled = true;
          });

          button.classList.add("correct");

          if (finalError) {
            finalError.textContent = "";
          }

          revealLastLetter();

          /* Fermeture du mini-jeu final après la bonne réponse */
          setTimeout(() => {
            if (finalLetterGame) {
              finalLetterGame.classList.remove("show");
            }
          }, 700);

          /* Mise à jour du texte principal,
             affichage du bloc final
             puis lancement de la musique */
          setTimeout(() => {
            if (revealText) {
              revealText.textContent = "Le dernier album se révèle enfin.";
            }

            showPromo();
            startFinalMusic();
          }, 1200);

          return;
        }

        /* Si la mauvaise lettre est choisie :
           effet d’erreur visuel + message sous les boutons */
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

  /* Animation d’apparition des lettres proposées :
     les 3 choix montent l’un après l’autre
     quand le mini-jeu final s’affiche */
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

  /* Clic sur la pochette de l’album :
     permet de mettre la musique finale en pause
     ou de la relancer */
  if (promoCover) {
    promoCover.addEventListener("click", () => {
      toggleFinalMusic();
    });
  }

  /* Initialisation de la page :
     construction du mot,
     création des choix du dernier mini-jeu
     puis révélation de la lettre liée à cette étape */
  buildLetters();
  buildFinalChoices();
  revealCurrentLetter();
});