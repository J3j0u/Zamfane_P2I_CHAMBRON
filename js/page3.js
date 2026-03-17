window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const covers = document.querySelectorAll(".album-cover");
  const validateBtn = document.getElementById("validateAlbumsBtn");

  const goodOrder = ["cover3", "cover1", "cover5", "cover2", "cover4"];

  let draggedCover = null;

  if (btn && reveal1) {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal1.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  covers.forEach((cover) => {
    cover.addEventListener("dragstart", () => {
      draggedCover = cover;
      cover.classList.add("dragging");
    });

    cover.addEventListener("dragend", () => {
      cover.classList.remove("dragging");
      cover.classList.remove("drag-over");
      draggedCover = null;
    });

    cover.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    cover.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (cover !== draggedCover) {
        cover.classList.add("drag-over");
      }
    });

    cover.addEventListener("dragleave", () => {
      cover.classList.remove("drag-over");
    });

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

      firstCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("correct", "wrong");
      secondCover.classList.remove("drag-over");

      setTimeout(() => {
        firstCover.classList.remove("swap-animate");
        secondCover.classList.remove("swap-animate");
      }, 300);
    });
  });

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
        window.location.href = "page4.html";
      }
    });
  }
});