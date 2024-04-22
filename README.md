## Vitality


## Starting development

## Development
The local development process is simplified using docker containers:
``` bash
docker-compose up 
```

To stop containers, run the following:
```bash

docker-compose down
```

To reset local environment, including all database data, run the following:
```bash
docker-compose down -v --remove-orphans

docker-compose up 
```

The application can be accessed [here](http://localhost:3000/) once the server is up and running. Any local changes should be reflected relatively quickly.



## Connecting to the database 
All relevant credentials are stored in `docker-compose.yaml`
``` bash
psql -h localhost -p 5432 -U prisma -d vitality
or
docker exec -it vitality_postgres_container psql -U prisma -d vitality
```

To exit:
```bash
\q 

If the above is causing local port conflicts, you can change the `docker-compose.yaml` file to change the following host port:
``` yaml
ports:
      - "desired port:5432"
```

Database migrations:
``` bash
Add formatted model to schema.prisma

docker exec -it vitality_nextjs_container npx prisma generate
docker exec -it vitality_nextjs_container npx prisma migrate dev --name <migration-name>
```

Testing

Logs:

<!-- View logs in realtime -->
docker-compose logs -f

<!--  Most recent logs -->
docker-compose logs

<!-- Specific container -->
docker logs <vitality_postgres_container | vitality_nextjs_container>

<!-- Section about Nginx server -->
http://localhost for server...