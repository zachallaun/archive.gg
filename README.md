**Note:** I'll be shutting down archive.gg when I get some time.
Replay.gg now does everything I do and more. Go check it out!

# archive.gg

League of Legends replay archive. Provides folks with a unique email
address with which to register at [replay.gg](http://replay.gg).
Archive.gg stores replays sent to it via replay.gg, and provides a
match history of these games to summoners.

## Local development

**Dependencies:** Node.js, npm, Postgres. Install application
dependencies by running `npm install` in this project's root
directory.

**Environment:** Copy `.env.example` to `.env` and modify with your
own Riot Games development API key.

**Database:** Run `node node_modules/db-migrate/bin/db-migrate up` to
create DB tables.

**Development server:** Run `npm run dev`, visit
`localhost:3000`. Almost no code changes to the client or server
require the development server to be restarted or the browser to be
refreshed - code will be hot-loaded.
