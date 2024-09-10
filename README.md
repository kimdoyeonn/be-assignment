# BE-assginment

## Quick Start

### 인증서버 (`/auth-server`)

#### 환경변수 세팅

```
DB_PORT=
DB_HOST=
DB_DB=
DB_USER=
DB_PASSWORD=
MYSQL_ROOT_PASSWORD=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

```
cd auth-server
npm i
npm run docker:up # DB 실행
npm run start # 실행
```

### 자원서버 (`/resource-server`)

#### 환경변수 세팅

```
DB_PORT=
DB_HOST=
DB_DB=
DB_USER=
DB_PASSWORD=
MARIADB_ROOT_PASSWORD=
```

```
cd resource-server
npm i
npm run docker:up # DB 실행
npm run start # 실행
```

### api 실행

1. `localhost:9999/products/dummy` 를 실행하여 상품을 생성합니다.

## ERD

### 인증서버

![인증서버ERD](/erd/authERD.png)

### 자원서버

![자원서버ERD](/erd/resourceERD.png)

## 고민기록

- 사용자가 주문을 생성할 때 한 번에 모든 정보를 입력하고 처리하는 것과 주문의 유효성(재고, 가격 등)을 사전에 검증하는 과정을 분리하는 것 사이에서 고민

  -> 주문을 생성하기 전 먼저 주문 요청이 올바른지(수량 확인, 가격 검증 등)를 확인하는 API를 별도로 구현했습니다. 이 검증을 통과한 주문은 `DRAFT` 상태로 저장되며, 이후 필요한 정보를 추가하여 최종적으로는 `ORDER_COMPLETED` 상태로 변경됩니다.

  제가 생각한 이 방식의 이점:

  - 사용자 경험 개선: 사용자는 자신의 주문이 올바르게 처리되었는지 개인 정보를 입력하기 전에 인지할 수 있습니다.
  - 유연한 주문 관리: 주문이 단계별로 처리되기 때문에 필요에 따라 주문 정보를 수정하는 것이 용이합니다.
