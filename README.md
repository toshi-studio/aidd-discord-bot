# aidd-discord-bot


## Déclaration du bot et ajout de celui-ci au serveur Discord
- Se rendre dans l'espace développeur de Discord à l'adresse https://discord.com/developers/applications (Attention, l'application **ne peut pas** contenir le mot **discord**)
- Se connecter 
- Cliquer sur "Nouvelle application" en haut à droite
- Dans l'onglet des "Informations générales" 
  - Personaliser l'application' (nom, image, etc.) si besoin. C'est juste pour distinguer tes différentes applications 
- Se rendre dans l'onget "Bot"
  - Personaliser le bot : nom, avatar, etc.
  - Cliquer sur le bouton "Reset token"
  - Copier le token généré dans le fichier `.env` du projet, à la clé `DISCORD_TOKEN`. Il s'agit du token de connexion du bot et **doit absolument** rester secret
  - Désactiver l'option "Public Bot"
  - Activer l'option "Message Content Intent"
- Se rendre dans l'onget "OAuth2"
  - Sélectionner la sous-section "URL Generator"
  - Cocher le scope "bot"
  - Donner la permission "Administrator"
  - Copier l'URL générée. Exemple : `https://discord.com/api/oauth2/authorize?client_id=1234567890&permissions=8&scope=bot`

Une fois le bot déclaré :
- Se rendre sur un canal du serveur Discord, poster en message l'URL précédemment copiée
- Cliquer sur le lien
- Confirmer l'ajout du bot au serveur (rire un coup, à cause du message, avant)
- Confirmer le droit "Admnistrateur" accordé au bot

## Base de données firebase
- Se rendre sur https://console.firebase.google.com
- Se connecter avec un compte Google
- Ajouter un projet 
- Saisir le nom du projet / Cliquer sur "Continuer"
- Décocher Google Analytics (C'est par principe mais tu peux faire comme tu le sens)
- Valider autant de fois que nécessaire pour arriver sur le dashboard
- Cliquer sur la roue crantée en haut à gauche de l'écran, à droite de "🏠 Vue d'ensemble" et sélectionner "Paramètres du projet"
- Ajouter une application web au projet en cliquant sur l'icône `</>` 
- Ajouter un pseudo à l'application
- Cocher l'option hosting si besoin
- Valider
- Dans le fichier `.env` ajouter les informations de configuration fournies par firebase, dans l'objet `firebaseConfig` généré et affiché à l'écran
  - `apiKey => FIREBASE_API_KEY`
  - `authDomain => FIREBASE_AUTH_DOMAIN`
  - `projectId => FIREBASE_PROJECT_ID`
  - `storageBucket => FIREBASE_STORAGE_BUCKET`
  - `messagingSenderId => FIREBASE_MESSAGING_SENDER_ID`
  - `appId => FIREBASE_APP_ID`

## Poste de développement
Le projet utilise nodeJS pour 
- L'installation des dépendances (lancer la commande `npm install`, en étant à la racine du projet, pour récupérer les dépendances du projet avant exécution)
- Pouvoir exécuter le code javascript du robot en ligne de commande (lancer la commande `node .`)

Il est nécessaire de créer un fichier `.env` à la racine du projet. Se baser sur le fichier `env.sample` pour le créer.

## Documentation
- [Documentation de la librairie **discord.js**](https://discord.js.org/docs/packages/discord.js/14.14.1)
- [Documentation de **firebase**](https://firebase.google.com/docs/database/web/start?hl=fr&authuser=0)