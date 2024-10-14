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

## POSTMAN

[Postman 링크](https://lunar-crescent-491034.postman.co/workspace/Personal-Workspace~9c235865-9856-4546-969e-640bf1b6e875/collection/17978117-a18abeb4-6455-4e92-ac01-380aa6b64c2d?action=share&creator=17978117)

## 과제 분석

### 자원 서버

상품을 구매, 판매할 때 필요한 API 기능 구현

- 상품: `99.9% 금`, `99.99% 금`

- 고객은 상품을 사거나 팔 수 있습니다.
- 거래 수량의 단위는 `g`이며, 소숫점 둘째자리까지 거래 가능합니다.
- 주문 상태는 판매한 고객, 구매한 고객 모두 동일하게 관리하며, 주문 유형에 따라 클라이언트에서 다르게 노출됩니다.

  - 주문 상태: `DRAFT`, `ORDER_COMPLETED`, `PAYMENT_COMPLETED`, `FULFILLMENT_COMPLETED` , `CANCELED`
  - 주문 타입: SALE, `PURCHASE`
    => 예를 들어, 구매한 고객(`PURCHASE`)의 주문 상태가 `PAYMENT_COMPLETED`인 경우 '입금 완료', 판매한 고객(`SALE`)의 주문상태가 `PAYMENT_COMPLETED`인 경우 '발송 완료'가 표시됩니다.

- 상품 구매 / 판매 주문서 생성 및 업데이트

  - 주문서 작성 시작 시 상품의 정보가 올바른지 확인 후 `DRAFT` 상태의 주문서를 생성합니다.
    - 주문번호는 `YYMMDD-xxxxxxxx` 패턴으로 자동 생성됩니다.
    - 상품의 남은 수량이 부족한 경우, 에러를 반환합니다.
    - 상품의 가격이 유효하지 않은 경우, 에러를 반환합니다.
  - 주문서 작성이 완료되면 `ORDER_COMPLETED` 상태로 주문 데이터가 생성됩니다.
    - 주문번호가 유효하지 않을 경우 에러를 반환합니다.
    - `shippingAddress`와 `zipcode`를 업데이트합니다.
  - 입금 완료 이벤트가 발생 시 해당 상품의 상태가 `PAYMENT_COMPLETED`로 업데이트됩니다.
    - `PAYMENT_COMPLETED`로 업데이트하는 경우 `priceAmount`는 필수값입니다.
    - 주문번호와 결제된 금액이 일치하지 않으면 에러를 반환합니다.
  - 수령 완료 이벤트가 발생하면 해당 상품의 상태가 `FULFILLMENT_COMPLETED`로 업데이트됩니다.

- 주문 조회

  - 유저는 자신이 작성한 주문서만 조회할 수 있습니다.
  - 목록 조회

    - 배송 정보를 제외한 주문 정보를 조회합니다.
    - `pagination`이 적용되어 일정 조건에 따라 조회할 수 있습니다.

      - `date`, `limit`, `offset`, `invoice type`
      - response는 다음과 같습니다.

        ```json
        {
          "success": true,
          "message": "Success to search invoices",
          "data": [
            {
              // 구매 또는 판매 주문 detail
            }
            // ...
          ]
        }
        ```

  - 상세 조회
    - `orderNumber`에 해당하는 주문정보를 조회합니다.
    - 배송 정보를 포함한 모든 주문 정보를 조회합니다.

## 고민기록

- 사용자가 주문을 생성할 때 한 번에 모든 정보를 입력하고 처리하는 것과 주문의 유효성(재고, 가격 등)을 사전에 검증하는 과정을 분리하는 것 사이에서 고민

  -> 주문을 생성하기 전 먼저 주문 요청이 올바른지(수량 확인, 가격 검증 등)를 확인하는 API를 별도로 구현했습니다. 이 검증을 통과한 주문은 `DRAFT` 상태로 저장되며, 이후 필요한 정보를 추가하여 최종적으로는 `ORDER_COMPLETED` 상태로 변경됩니다.

  제가 생각한 이 방식의 이점:

  - 사용자 경험 개선: 사용자는 자신의 주문이 올바르게 처리되었는지 개인 정보를 입력하기 전에 인지할 수 있습니다.
  - 유연한 주문 관리: 주문이 단계별로 처리되기 때문에 필요에 따라 주문 정보를 수정하는 것이 용이합니다.
