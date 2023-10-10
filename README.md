# Chess Telegram

Welcome to the Telegram Mini App / Bot that allows you to play chess with your friends or with bot itself inside the Telegram! The application is made using TypeScript, [Vue 3](https://vuejs.org/guide/introduction.html), [Telegraf.js](https://telegraf.js.org), [Vite](https://vitejs.dev/guide/), [Chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) and [Howler](https://github.com/goldfire/howler.js#documentation). You may check it out here: @[ChessTgOnlineBot](https://t.me/ChessTgOnlineBot) 

# Table of Contents

- [Chess Telegram](https://github.com/DasAnonas/chess-mini-app/#chess-telegram)
- [Table of Contents](https://github.com/DasAnonas/chess-mini-app/#table-of-contents)
- [About](https://github.com/DasAnonas/chess-mini-app/#about)
- [Quick Start Guide](https://github.com/DasAnonas/chess-mini-app/#quick-start-guide)
    - [Basics](https://github.com/DasAnonas/chess-mini-app/#basics)
    - [Front-end application setup](https://github.com/DasAnonas/chess-mini-app/#front-end-application-setup)
    - [Back-end application setup](https://github.com/DasAnonas/chess-mini-app/#back-end-application-setup)
- [Setting up the production environment](https://github.com/DasAnonas/chess-mini-app/#setting-up-the-production-environment)
    - [Front-end application setup](https://github.com/DasAnonas/chess-mini-app/#front-end-application-setup-1)
    - [Back-end application setup](https://github.com/DasAnonas/chess-mini-app/#back-end-application-setup-1)
- [Front-end application structure](https://github.com/DasAnonas/chess-mini-app/#front-end-application-structure)
    - [UI components structure](https://github.com/DasAnonas/chess-mini-app/#ui-components-structure)
        - [Buttons](https://github.com/DasAnonas/chess-mini-app/#buttons)
        - [Modals](https://github.com/DasAnonas/chess-mini-app/#modals)
        - [Layouts](https://github.com/DasAnonas/chess-mini-app/#layouts)
    - [Business logics structure](https://github.com/DasAnonas/chess-mini-app/#business-logics-structure)
        - [Game Master](https://github.com/DasAnonas/chess-mini-app/#game-master)
        - [WebSocket client](https://github.com/DasAnonas/chess-mini-app/#websocket-client)
        - [User Actions](https://github.com/DasAnonas/chess-mini-app/#user-actions)
        - [WebSocket Actions](https://github.com/DasAnonas/chess-mini-app/#websocket-actions)
        - [Bot AI](https://github.com/DasAnonas/chess-mini-app/#bot-ai)
        - [Cloud Storage](https://github.com/DasAnonas/chess-mini-app/#cloud-storage)
        - [Locale](https://github.com/DasAnonas/chess-mini-app/#locale)
        - [Sound Engine](https://github.com/DasAnonas/chess-mini-app/#sound-engine)
- [Back-end application structure](https://github.com/DasAnonas/chess-mini-app/#back-end-application-structure)
    - [Telegram Bot](https://github.com/DasAnonas/chess-mini-app/#telegram-bot)
    - [Game server](https://github.com/DasAnonas/chess-mini-app/#game-server)
        - [websocket-manager/index.ts](https://github.com/DasAnonas/chess-mini-app/#websocket-managerindexts)
        - [game-manager/base-game-wrap.ts](https://github.com/DasAnonas/chess-mini-app/#game-managerbase-game-wrapts)
        - [game-manager/game-client.ts](https://github.com/DasAnonas/chess-mini-app/#game-managergame-clientts)
        - [game-manager/game-wrap.ts](https://github.com/DasAnonas/chess-mini-app/#game-managergame-wrapts)
        - [game-manager/index.ts](https://github.com/DasAnonas/chess-mini-app/#game-managerindexts)
- [Credits](https://github.com/DasAnonas/chess-mini-app/#credits)

# About
![photo_2023-10-08_02-34-21.jpg](https://github.com/DasAnonas/chess-mini-app/blob/main/frontend/public/screenshot.jpg?raw=true)

This is a simple chess game implementation in Telegram Mini Apps ecosystem. The application can:

- Run multiplayer games with your friends in Telegram in a few clicks
- Run single player games with a simplistic chess computer
- Save game progress and share it among all of the user’s Telegram devices
- Send notifications about game status directly in Telegram (e. g. about your opponent’s move when the app is minimised)

# Quick Start Guide

The following instructions are applicable for setting up the development environment. Do not use this setup for production!

## Basics

Clone the repository with the frontend and backend layers of the application:

```bash
git clone https://github.com/DasAnonas/chess-mini-app
```

Make sure that [Node.js](https://nodejs.org/en) is installed on your system and install the dependencies for each part of the application (use `cd frontend` and `cd ../backend` to navigate between the folders):

```bash
npm install
```

## Front-end application setup

We suggest using the [serveo](https://serveo.net) (or [ngrok](http://ngrok.com)) for proxying the front-end application from your system due to the requirements of running the web application with SSL in the Telegram Mini Apps. Run the following:

```bash
npm run dev
```

By default, Vite applications are served on port `5173`. You may change it in `packages.json` by your personal preference. Simply add the flag `--port <Your port here>` to the line:

```json
"dev": "vite --host",
```

Then run the serveo proxy (make sure you’ve provided a valid port):

```bash
ssh -R 80:localhost:5173 serveo.net
```

The serveo will provide you the https-link to the application, which you may use in the following steps.

## Back-end application setup

Firstly, set up the environmental variables inside the `.env` file in root directory according to the reference:

| Variable | Description |
| --- | --- |
| TG_TOKEN | Your Telegram Bot Token provided to you by BotFather |
| FRONT_URL | URL of the front-end application server. In case of our development workflow - the link provided by serveo |

Compile the TypeScript code and run the application

```bash
npx tsc
node dist/index.js
```

The application is running the front-end application websocket communication channel on port `8080`, the Telegram bot is polling and the app is ready to play!

# Setting up the production environment

The basics steps including cloning the repositories, installing the dependencies and setting up `.env` are similar to the previous section. 

## Front-end application setup

To build the application, type the following command:

```bash
npm run build
```

Vite will generate the static application files in `dist` folder which are ready to be served by your prefered https-server. We suggest using [nginx](https://nginx.org/en/docs/) and generate/manage SSL-certificates with [Certbot](https://certbot.eff.org/instructions). Here’s an example of the simplest nginx config for single-instance setup with front-end and back-end applications:

```bash
upstream websocket {
        server 127.0.0.1:8080; #Make sure you've provided valid port for WebSocket server
        keepalive_timeout 86400s;
}
server{
    server_name google.com #Your host URL goes here

    location /websockets {
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    root /home/user/chess-frontend/dist; #Path to your static folder of the front-end app
    location / {
        index index.html;
        keepalive_timeout 60;
    }
}

server{
    server_name google.com #Your host URL goes here
    listen 80;
}
```

## Back-end application setup

We suggest using [Docker](https://www.docker.com/get-started/) for back-end application deployment. Valid Dockefile is provided in repository. Run the following:

```bash
docker build --no-cache -t chess-backend --platform=linux/amd64 .
docker run -p 8080:8080 -d --name=chess-backend --restart=unless-stopped chess-backend
```

You may also like to automate your CI/CD (e.g. via [GitHub actions](https://docs.github.com/en/actions)) and use [docker-compose](https://docs.docker.com/compose/) to set up more complex architecture.

# Front-end application structure

The front-end application structure consists of two main parts - Vue UI components and business logics. Vue UI components include HTML-code, relevant JavaScript logics and CSS style definitions. 

## UI components structure

### Buttons

- `SoundButton` - sounds toggler, recieves `click` as an emit and `isOn` as a prop
- `SurrenderButton` - surrender modal window toggler, recieves `GameMaster` object as a prop

### Modals

- `StatusPopup` - popup for displaying game status or errors. recieves its `type`, `text` (for error) and `Locale` object as props
- `SurrenderPopup` - popup for surrender, recieves emits for `surrender` and `cancel` actions and `Locale` object as a prop

### Layouts

- `OpponentLayout` - row with opponent’s avatar, username and sound button, recieves `GameMaster` object as a prop
- `StatusBarLayout` - row with status label, recieves `GameMaster` object as a prop
- `BoardLayout` - main layout of the application, gather all the components and the chessboard itself alltogether and also includes some important logic - initialization of the `GameMaster` object, board and websockets connection, launching `checkQueue` function for checking the queue of websocket incoming messages and further proceeding it into the handler.

## Business logics structure

### Game Master

The core chess engine is implemented by the [Chess.js](https://github.com/jhlywa/chess.js) library, which is contained in the instance of `GameMaster` class in `src/game/gameMaster.js.` It also initializes the chessboard, stores the game state and all the necessary handlers which are listed below. Notable method of the class is:

```jsx
getSecurityString()
```

The method extracts extracts initial Telegram user data (`window.Telegram.WebApp.initData`) as URL parameters and then proceeds it into the string of the following format: `auth_date=${authDate}\nquery_id=${queryId}\nuser=${user}`, which is being returned with the hash of this string. Later on this values are send during the initial handshake with the server checking the identity of the client.

### WebSocket client

The application uses WebSocket communication with JSON to interact with the server. The WebSocket client is defined in `src/wsClient.js` , it sends and recieves data about various actions like joining a game, making and receiving moves and restoring the game state.

### User Actions

User interactions, including drag-and-drop moves and surrendering the game, are handled by the `UserActions` class in `src/game/userActions.js` for multiplayer mode and `UserActionsSingle` for single-player mode.

### WebSocket Actions

Opponent actions, which are recieved from server are handled by the `UserActions` class in `src/game/wsActions.js`. It includes the handlers for all server messages - moves, game endings and recovering the saved game state in case of errors or re-opening the match.

### Bot AI

The AI bot for single-player mode is implemented in the `Bot` class in `src/game/bot.js`. It uses minimax with alpha-beta pruning algorithm based on [this](https://github.com/zeyu2001/chess-ai) method and returns the best move for the bot in single player matcher. 

### Cloud Storage

The application uses [Telegram Cloud Storage](https://core.telegram.org/bots/webapps#cloudstorage) to save data of single player games in JSON format. The `CloudStorage` class in `src/game/cloudStorage.js` is responsible for saving, loading, and deleting game data after the game is over to prevent overflowing the storage.

```jsx
SaveGame()
```

Saves current single player game fen-string and turn order as JSON in Cloud Storage by game ID as a key.

```jsx
LoadGame()
```

Loads the current single game match saved data by game ID as a key and returns it to be further proceed by the game state recovery method of the class `WsActions`.

```jsx
DeleteGame()
```

Deletes the record in the Cloud Storage by game ID as a key.

### Locale

Localization and text messages are managed by the `Locale` class in `src/game/locale.js`. It provides localized messages and labels for the user interface to be easily customized according to the preferred language.

### Sound Engine

The sound effects for user interactions are managed by the `SoundEngine` class in `src/game/soundEngine.js`. It uses the [Howler](https://github.com/goldfire/howler.js#documentation) library for audio playback. The methods responsible for playing sounds also utilise Mini App [Haptic Engine API](https://core.telegram.org/bots/webapps#hapticfeedback) what allows to provide additional tactile feedback in the supported devices.

# Back-end application structure

The back-end application structure also consists of two main parts - Telegram Bot and core game server, responsible for controlling the game flow on server side and communications with clients

## Telegram Bot

The bot is pretty simple and trivial, based on [Telegraf.js](https://telegraf.js.org) library and utilises only few user actions - creating games and showing the general information. It uses `userRequest` button for choosing the opponent in multiplayer and inline keyboards for navigation. Initialised game is being sent to user by the link in Mini App button.

## Game server

Game server module includes several components, which are responsible for controlling the game flow and websocket connections.

### **`websocket-manager/index.ts`**

- Purpose: Manages WebSocket connections for real-time communication between clients and game instances.
- Key Components:
    - **`WebSocketManager`** class: Manages WebSocket connections.
    - **`WebSocketClient`** class: Represents a WebSocket client with all the necessary methods for handling and sending messages and checking its health.

### **`game-manager/base-game-wrap.ts`**

- Purpose: Defines the base class for managing single or multiplayer chess games, including game logic and player interactions.
- Key Components:
    - **`GameWrap`** class: An abstract base class for managing individual chess games.
    - Functions for game state management, message handling, and notifications, including the one for validating the client security string:

```tsx
checkAuthenticity(wsClient: WebSocketClient, data: any): boolean
```

The method hashes the security string by Bot token and compares it with hash from initial data. Returns `true` if the client is valid otherwise immediatly shuts down the connection and returns `false`.

### **`game-manager/game-client.ts`**

- Purpose: Represents a player in a chess game, storing their information and game-related data.
- Key Components:
    - **`GameClient`** class: Represents a player in a chess game.
    - Stores player-related data such as Telegram ID, notifications messages IDs, and sound settings.

### **`game-manager/game-wrap.ts`**

- Purpose: Extends the base game management class to provide specific game logic for private chess games.
- Key Components:
    - **`PrivateGameWrap`** class: Extends the **`GameWrap`** class for private chess games.
    - Functions for handling game actions like joining, making moves, and managing game state.

### **`game-manager/index.ts`**

- Purpose: Manages chess games, including creating, deleting, and cleaning up game instances.
- Key Components:
    - **`GameManager`** class: Manages chess games and game-related operations.
    - Functions for creating games, deleting games, and cleaning up inactive games.

# Credits

- [Chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md)
- [Axios](https://axios-http.com/docs/intro)
- [Moment.js](https://momentjs.com)
- [Telegraf.js](https://telegraf.js.org)
- [Chessboard2](https://github.com/oakmac/chessboard2/)
- [Howler](https://github.com/goldfire/howler.js#documentation)
- [Vue 3](https://vuejs.org/guide/introduction.html)
- [Chess AI](https://github.com/zeyu2001/chess-ai) by [zeyu2001](https://github.com/zeyu2001)
