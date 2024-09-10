-- 트랜잭션 시작
START TRANSACTION;

-- 'user' 테이블 생성
CREATE TABLE `user` (
    `id` int NOT NULL AUTO_INCREMENT,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `username` varchar(128) NOT NULL,
    `password` varchar(255) NOT NULL,
    `refresh_token` varchar(255) NULL,
    `state` enum('LIVE', 'REMOVED') NOT NULL DEFAULT 'LIVE',
    UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 트랜잭션 커밋
COMMIT;