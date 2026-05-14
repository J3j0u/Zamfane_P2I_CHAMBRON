# ZAMFANE

Site interactif retracant l'univers musical de l'artiste Zamdane.
Le visiteur parcourt 5 etapes, chacune avec un mini-jeu, et decouvre
a la fin une lettre du titre du dernier album.

## Lancement

Ouvrir `index.html` dans un navigateur.

## Structure du projet

```
zamfane/
├── index.html              Page d'accueil
├── pages/                  Les 5 etapes du parcours
│   ├── page1.html              Blindtest
│   ├── page2.html              Jeu des paroles
│   ├── page3.html              Association des pochettes (drag & drop)
│   ├── page4.html              Quiz des titres
│   └── page5.html              Revelation finale
├── css/
│   ├── base.css                Reset, variables, fond, page d'accueil
│   ├── layout.css              Structure commune a toutes les pages de jeu
│   └── pages/                  Styles propres a chaque mini-jeu
│       ├── page2.css
│       ├── page3.css
│       ├── page4.css
│       └── page5.css
├── js/
│   ├── common.js               Code partage (helpers, scroll, bouton discover...)
│   └── pages/                  Logique propre a chaque mini-jeu
│       ├── page1.js
│       ├── page2.js
│       ├── page3.js
│       ├── page4.js
│       └── page5.js
└── assets/
    ├── audio/                  Extraits et sons du site
    └── images/                 Pochettes, indices, logos des plateformes
```

## Organisation du code

### CSS
- `base.css` : ce qui est global au site (reset, variables de couleur et
  de police, fond, et styles de la page d'accueil).
- `layout.css` : le squelette commun a toutes les pages de jeu (en-tete,
  zone de contenu, bouton "discover", blocs reveal, zone de blindtest...).
  C'est l'ancien `page1.css`, renomme car il n'a jamais ete propre a la
  page 1 : toutes les pages l'importaient.
- `css/pages/pageN.css` : uniquement ce qui est specifique a un mini-jeu.

L'animation de secousse d'erreur (`@keyframes shake`), qui etait recopiee
dans trois fichiers, est maintenant definie une seule fois dans `layout.css`.

### JavaScript
- `common.js` : tout le code qui etait duplique dans les 5 anciens
  fichiers (reset de la position de scroll, helpers `clamp01`, `normalize`,
  `shuffle`, gestion du bouton "discover", affichage de texte lettre par
  lettre, surveillance du scroll, sauvegarde de la progression).
  Il expose un objet global `Zam` utilise par les scripts de page.
- `js/pages/pageN.js` : uniquement la logique propre a un mini-jeu.

Chaque page HTML charge `common.js` puis son script de page, les deux
en `defer` pour garantir l'ordre d'execution.

## Note

Le commentaire d'origine reste valable : le CSS n'est commente que sur
les elements d'animation, pas sur les elements purement graphiques.
