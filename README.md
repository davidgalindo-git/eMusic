# eMusic

Développé par David Galindo (SI-CA2a) avec [Vue 3](https://vuejs.org/) et [Vite](https://vitejs.dev/).
## Installation de l'app
1. Avoir installé [Node.js](https://nodejs.org/fr)
2. Cloner localement le repository git dans un repertoire appelé "emusic-app"
```bash
git clone [https://github.com/davidgalindo-git/TPI_David_Galindo_2026](https://github.com/davidgalindo-git/eSample.git)
```
3. Installer les dépendances
```bash
cd emusic-app
```
```bash
npm install
```
## Lancement de l'app
Dev (développement): Mise à jour dynamique pendant le développement
```bash
npm run dev
```  

ou  

Build (production): Compile et minifie le code pour la production
```bash
npm run build
```
Preview : Teste le build pour détecter d'éventuels bugs spécifiques à la production
```bash
npm run preview
```

## Tests
Exécuter les tests du dossier src/tests  
Mode Standard (Console)
```bash
npm run test
```
Mode Interface Graphique (UI)  
```bash
npm run test:ui
```
Rapport de Couverture (Coverage)  
```bash
npm run test:coverage
```

## Déploiment
Build (production): Compile et minifie le code pour la production
```bash
npm run build
```
### Hébergement Statique
Transférez le dossier /dist vers des services comme Vercel, Netlify ou GitHub Pages.

### VPS Traditionnel
Utilisez un serveur web comme Nginx ou Apache pour servir le contenu du répertoire /dist.

### Stockage Cloud
Hébergez via un bucket AWS S3 ou Google Cloud Storage configuré pour l'hébergement de sites web statiques.

## Architecture & Data Flow
![Component Diagram](./src/docs/architecture-diagram.png)
![Diagram Legend](./src/docs/diagram_legend.png)
