-- 트랜잭션 시작
START TRANSACTION;

-- 'product' 테이블 생성
CREATE TABLE `product` (
    `id` int NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `name` varchar(30) NOT NULL,
    `purity` float NOT NULL,
    `type` enum('SALE', 'PURCHASE') NOT NULL,
    `amount` float NOT NULL,
    `price` int NOT NULL,
    `state` enum('DRAFT', 'DISPLAYED', 'HIDDEN') NOT NULL DEFAULT 'DISPLAYED',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 'invoice' 테이블 생성
CREATE TABLE `invoice` (
    `id` int NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `order_number` varchar(27) NOT NULL,
    `user_id` int NOT NULL,
    `state` enum('DRAFT', 'CANCELED', 'ORDER_COMPLETED', 'PAYMENT_COMPLETED', 'FULFILLMENT_COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `product_id` int NOT NULL,
    `amount` float NOT NULL,
    `price` int NOT NULL,
    `zipcode` varchar(6) NULL,
    `shipping_address` varchar(255) NULL,
    `shipping_address_detail` varchar(255) NULL,
    `shipping_name` varchar(255) NULL,
    `shipping_phone_number` varchar(15) NULL,
    `type` enum('SALE', 'PURCHASE') NOT NULL,
    UNIQUE INDEX `IDX_10fb820d71f78e53206abf0d44` (`order_number`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 'invoice' 테이블에 외래 키 제약 조건 추가
ALTER TABLE `invoice`
ADD CONSTRAINT `FK_d79d227662ea59bababb37f2553`
FOREIGN KEY (`product_id`) REFERENCES `product`(`id`)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

-- 트랜잭션 커밋
COMMIT;