# Resource Server

## 실행 방법

### 환경변수 작성

```
DB_PORT=
DB_HOST=
DB_DB=
DB_USER=
DB_PASSWORD=
MARIADB_ROOT_PASSWORD=
```

## DB 실행

```
npm run docker:up
```

## 설치 및 실행

```
npm i
npm run start
```

## 더미데이터 설정

- `POST localhost:9999/product/dummy` 호출

## DB 종료

```
npm run docker:down
```
