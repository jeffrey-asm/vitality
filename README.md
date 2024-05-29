# Vitality

Your all-in-one modern fitness tracker for progress and performance to fuel your fitness goals. A current work in progress. Feel free to use any of the related code for your own projects!

## Development

To start development processes.

``` bash
docker compose up 
```

To pause development processes.

```bash

docker compose stop
```

To restart completely by clearing all associated containers, networks, and volumes.

```bash
docker compose down -v --remove-orphans 
```

The application can be accessed [http://localhost:3000/](http://localhost:3000/), which represents output from the app container.

### Logs

View logs for all services in realtime.

```bash
docker compose logs -f
```

View most recent logs for all services.

```bash
docker compose logs 
```

View most recent logs for specific services, which could also be realtime with the `-f` clause.

```bash
docker logs <container-name> 
```

## Database

There are 2 ways to currently access the database for viewing current state or making adjustments to manually records.

Through the docker container.

``` bash
docker exec -it vitality_postgres psql -U postgres -d vitality
```

Through the Prisma ORM service.

``` bash
docker exec -it vitality_app npx prisma studio
```

Currently all database changes are made via `init.sql`. In the future, we will use Prisma ORM to efficiently make migrations needed while preserving sensitive user information through the following:

- Add the proposed changes to the model located at `prisma/schema.prisma`
- Run the following command to apply the changes

``` bash
docker exec -it vitality_app npx prisma migrate dev --name <migration-name>
```

## Testing

### Jest

Run unit tests.

```bash
npm run unit
```

Run integration tests.

```bash
npm run integration
```

### Cypress

Pausing the development processes with the steps above is recommended for Cypress testing to save resources. This will create a new instance of the application that can be found at [http://localhost:3001/](http://localhost:3001/)

Test specific end-to-end tests with incrementing changes. Please end tests by closing the Cypress popup window for proper cleanup.

```bash
npm run e2e:test
```

Run end-to-end tests.

```bash
npm run e2e:run
```

## Linting

View current potential linting errors / warnings based on `.eslintrc.json` specifications.

```bash
npx eslint . --fix
```
