# BSBL-Scout

BSBL-Scout is an open source repo that provides valuable insights to pitchers of all ages, sizes, and styles. Our hope is to provide dashboards which can aid in development highlighting strengths and weaknesses so that players do not have to guess on their development. 

This application is available through Docker. 

1. Clone the repo 

2. create a .env in the root directory following: 

# PostgreSQL credentials (used by both docker-compose postgres service and backend)
DB_USER=#username for postgresql db 
DB_PASSWORD=#password for user account
DB_NAME=baseball
# Connection string for backend (host "postgres" = docker service name)
DATABASE_URL=postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

3. Docker compose up 