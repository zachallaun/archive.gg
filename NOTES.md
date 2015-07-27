
# New user flow, from registering to viewing a replay

- http://archive.gg/ -> Search for region/summoner ->
  http://archive.gg/:region/:summonerName
- See "Summoner Name isn't registered", click "Register" button
- See registration instructions, the email address to be used, and
  link to replay.gg
- Sign up on replay.gg, then return to archive.gg and click "Complete"
- See "Waiting for first replay"
- Play a game, replay.gg records it and emails it to archive.gg
- Click "Refresh" or reload archive.gg summoner page, can now see the
  match info and replay

# Match list

To start, I think the match list should contain only a small amount of
information:

- Victory/Loss
- Champion name and avatar
- K/D/A
- Timestamp
- Link to Riot's match info
- Link to replay.gg's replay page

# What happens when visiting `/:region/:summonerName`?

Check if summoner exists in our DB. If not, look up summoner using
Riot's API and save relevant info in DB, marking that summoner as not
registered. If the summoner doesn't actually exist, mark the search
form field as errored and report it to user.

Should then show the summoner's name, region, division/tier, and then
either registration status if they're not registered/confirmed, or
match list.

# What happens when an email from replay.gg comes in?

- Verify the email origin (e.g. Mailgun)
- Figure out which summoner the email is for based on the archiveEmail
- Parse the raw email using `parseReplaygg`, discard if invalid
- Look up match data using Riot's API and the matchId
- Confirm that summoner was a part of match, discard if not
- Confirm that we don't have this match in the DB already
- Save match info to DB, using replay.gg data and API data
