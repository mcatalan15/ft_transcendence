# ft_transcendence
_version 16.1_

## Overview

**ft_transcendence** is a full-stack, single-page web application developed as the final project of the Common Core at 42 Barcelona. It is a modern recreation of the Pong game featuring real-time gameplay, user management, live chat, blockchain integration, secure authentication system, and many more features. The project is built with a microservices architecture using Docker.

---

## Features

- **Modern Pong Game**: Play classic or extended Pong, locally or online, with up to 8 players in tournaments.
- **User Management**: Secure sign-up and sign-in, update your profile and add friends.
- **Two-Factor Authentication (2FA)**: Secure accounts with TOTP-based 2FA.
- **JWT Authentication**: Secure session management using JSON Web Tokens.
- **Live Chat**: Global and private chat with commands and moderation.
- **Blockchain Integration**: Match results are tracked on Avalanche blockchain.
- **Monitoring & DevOps**: Prometheus and Grafana for metrics and dashboards.
- **Internationalization (i18n)**: Multi-language support (EN, FR, ES, CAT).
- **Microservices Architecture**: Modular backend using Node.js & Fastify, frontend using Typescript & Tailwind CSS (Pixi.js for the game), an SQLite database and Redis to handle websockets.

---

## Architecture

The project is structured as a set of loosely-coupled microservices, each running in its own Docker container:

| Service       | Description                                  |
|---------------|----------------------------------------------|
| **frontend**  | TypeScript SPA + Tailwind CSS                |
| **backend**   | Node.js + Fastify                            |
| **redis**     | Websocket management                         |
| **grafana**   | Monitoring dashboards                        |
| **prometheus**| Metrics collection                           |
| **blockchain**| Avalanche/Hardhat for smart contracts        |
| **nginx**     | Reverse proxy and SSL termination            |
| **adminer**   | UI to manage the SQLite database             |

All services are orchestrated via **Docker** for easy development and deployment.

---

## Security

- **2FA**: Users can enable Two-Factor Authentication via authenticator apps (TOTP).
- **JWT**: All authentication and authorization is handled via signed JWTs.
- **Refresh Tokens**: Secure session renewal using HTTP-only cookies.
- **Password Hashing**: User passwords are securely hashed and salted in the database.

---

## Setup & Usage

### Prerequisites

- Docker
- (Optional) cloudflared for tunneling, useful to host on a free domain to test the live chat and online gaming

### Quick start

```bash
# Clone the repository
git clone https://github.com/mcatalan15/ft_transcendence.git
cd ft_transcendence

# Start in production mode
make prod

# (Optional) Start a Cloudflare tunnel
make tunnel
```

- Access the app at [https://localhost:1443](https://localhost:1443) (or your tunnel URL).

---

## Evaluation guide

### List of modules implemented

- **Node.js + Fastify**: Use of a framework to build the backend.
- **Tailwind CSS**: Use of a CSS framework for the frontend.
- **Database**: SQLite for storing user info, match history and all necessary data.
- **Blockchain**: Blockchain integration using Avalanche for storing match results.
- **User Management**: Secure user registration, login, profile management, avatar upload, match history and friend system.
- **Google Sign-In**: Integration for easy user authentication using Google accounts.
- **Remote play**: Real-time online multiplayer Pong game supported by WebSockets.
- **Game customization**: Choice of classic or extended Pong, with custom maps and power-ups.
- **Live Chat**: Global chat, private messages, and chat commands for user interaction.
- **AI Opponent**: Play against an AI in Pong and try to beat it (you won't!).
- **2FA Auth and JWT**: Secure user authentication with Two-Factor Authentication and JSON Web Tokens.
- **Monitoring**: Use of Prometheus and Grafana to collect metrics and display them in dashboards.
- **Microservices**: Modular architecture with separate services for frontend, backend, and other components.
- **Internationalisation**: Support for multiple languages (EN, ES, CAT, FR).

### Suggested user flow to test the application

1. **Register and Login**: Create a user, verify the 2FA QR Code, log in and choose your language.
2. **Chat**: Use chat commands, block/unblock users, test private messages or send a game invitation.
3. **Play Pong**: Start a match against friends or the AI, or join a tournament.
4. **Check Blockchain**: View match results stored on Avalanche.
5. **History and friends**: Check out other users' profiles, statistics and game history as well as yours.
6. **Monitor**: Access Grafana dashboards for live metrics.
7. **API endpoints**: Check out the API documentation at localhost:3100/docs to see all available routes and manually test them.

---

## References

- [Definition of Single Page Application (SPA)](https://developer.mozilla.org/en-US/docs/Glossary/SPA)
- [Mozilla Developer Network (MDN)](https://developer.mozilla.org/)
- [Typescript official documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS official documentation](https://tailwindcss.com/docs)
- [Pixi.js official page](https://pixijs.com/)
- [Redis official documentation](https://redis.io/documentation)
- [SQLite official documentation](https://www.sqlite.org/docs.html)
- [Avalanche official documentation](https://docs.avax.network/)
- [Grafana official documentation](https://grafana.com/docs/)
- [Prometheus official documentation](https://prometheus.io/docs/introduction/overview/)
- [Cloudflare Tunnel documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-app)

---

## Authors

- [Marc Catalán - mcatalan](mailto:mcatalan@student.42barcelona.com)
- [Eva Ferré Mur - eferre-m](mailto:eferre-m@student.42barcelona.com)
- [Hugo Muñoz Gris - hmunoz-g](mailto:hmunoz-g@student.42barcelona.com)
- [Nicolas Ponchon - nponchon](mailto:nponchon@student.42barcelona.com)

---

## License

MIT
