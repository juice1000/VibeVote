# VibeVote

Host a party and vote on what song plays next.

![UI](https://i.ibb.co/tBk37v1/ui-screenshot.png)

The host requires a Spotify Premium account. Guests can join without logging in!

# Set up:

- Register a spotify developer account.
- Create a .env file following the .env.example file provided.

# Tech Stack:

- Postgres database with Prisma as ORM
- Express.js for the server
- Passport.js for authentication
- Angular for the frontend
- For styling I used Tailwind, Angular Materials and PostCSS with autoprefixer
- Socket.io for real-time communication
- Spotify Web API to edit playlist in realtime
- Spotify Web Playback SDK for playback
-testing
