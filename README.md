# Antho parle web - Three JS Init

![APW for Three.js](apw.png)

## Objectif
- Mise en place d'une expérience créative et interactive via l'utilisation de la technologie Websocket
- Pour l'animation :
    - tous types de context canvas autorisés (2D, WebGL, WebGL2, etc )
    - utilisation de librairies et frameworks tierces autorisés (THREE / PIXI / GSAP / etc)

## Livrable
- Une vidéo de démonstration de l'expérience (backup au cas où l'expérience plante pendant le live)
- Code à push sur le repo dans votre branche 'ft-pseudo'
- URL de prod NON obligatoire même si préférable pour le jour de la démo

## Date de livraison
12 Novembre 2021 / 18h00 (heure FR)

## Installation

Installation des dépendances :

```
yarn
```

- Insérer l'URL de votre IP locale dans les fichiers suivants :
```
src/script.js => ligne 25
src/World.js => ligne 72
```

- Ouvrir un premier terminal pour lancer le serveur websocket (le garder ouvert)

```
yarn serve
```
Ouvrir un deuxième terminal pour compiler la partie front

```
yarn watch
```

Ouvrir le localhost sur le port 8000 (http://localhost:8000) un device d'une taille supérieure à 1200px ET sur un deuxième device d'une taille inférieure à 1200px.


## Inspiration

- https://blockrage.pgs-soft.com/
- https://medium.com/active-theory/paper-planes-6b0008c56c17

![Active Theory - Paper Planes](./active-theory-paper-planes.gif)
