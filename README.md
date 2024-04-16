# 💰 Simple Banking System 💴
[![Docker](https://img.shields.io/badge/Docker-grey?logo=docker)](https://github.com/pig60214/meet-shop-backend-engineer/blob/master/README.Docker.md)
[![Coverage](https://img.shields.io/badge/Coverage-97%25-green)](https://github.com/pig60214/meet-shop-backend-engineer)
[![TDD](https://img.shields.io/badge/TDD-%E2%9C%94-green)](https://github.com/pig60214/meet-shop-backend-engineer)
## Description
### Requirements
- Implement System by restful API
- Account balance cannot be negative
- Create an account with name and balance
- Able to deposit money to an account
- Able to withdraw money from an account
- Able to transfer money from one account to another account
- Generate transaction logs for each account transfer(when, how much, to what account)
- Support atomic transaction
- Include unit tests & integration test
- provide a docker container run server

### Implemetaion
Framework: [Node.js](https://nodejs.org) + [Express](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/) + [tsoa](https://tsoa-community.github.io/docs/)

Database: [Redis](https://redis.io)

Test Framework: [Jest](https://jestjs.io/) + [SuperTest](https://www.npmjs.com/package/supertest)

## Set Up Service
### Local
```
docker run -d --name redis-for-meetshop -p 6379:6379 redis
npm i && npm run build && npm run serve
```

### Docker
```
docker compose up --build
```

## Swagger
http://localhost:8000/api-docs

## Run Tests
### Local
```
docker run -d --name redis-for-meetshop-test -p 8001:6379 redis
npm run swagger && npm run test
```


### Docker
Must after building image
```
docker compose -f ./compose.test.yaml up -d
docker compose -f ./compose.test.yaml run test_server npm run test
docker compose -f ./compose.test.yaml down
```