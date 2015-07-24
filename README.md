# archive.gg

## Database

In `.env`, export `DATABASE_URL`:

```
DATABASE_URL=postgres:///archivegg
```

To run migrations:

```
node node_modules/db-migrate/bin/db-migrate up
```
