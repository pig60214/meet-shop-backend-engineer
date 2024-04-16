### Build Image and Run Service
```
docker compose up --build
```

### Run Tests
Must after building image
```
docker compose -f ./compose.test.yaml up -d
docker compose -f ./compose.test.yaml run test_server npm run test
docker compose -f ./compose.test.yaml down
```