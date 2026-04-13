-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `code` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `device` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParkingLot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `location` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IoTDevice` (
    `macAddress` VARCHAR(50) NOT NULL,
    `lotId` INTEGER NULL,
    `deviceName` VARCHAR(50) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ERROR') NOT NULL DEFAULT 'ACTIVE',

    INDEX `IoTDevice_lotId_idx`(`lotId`),
    PRIMARY KEY (`macAddress`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParkingSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(10) NOT NULL,
    `lotId` INTEGER NOT NULL,
    `deviceMac` VARCHAR(50) NOT NULL,
    `portNumber` INTEGER NOT NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTAIN') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ParkingSlot_status_idx`(`status`),
    INDEX `ParkingSlot_lotId_idx`(`lotId`),
    INDEX `ParkingSlot_deviceMac_idx`(`deviceMac`),
    UNIQUE INDEX `ParkingSlot_deviceMac_portNumber_key`(`deviceMac`, `portNumber`),
    UNIQUE INDEX `ParkingSlot_lotId_name_key`(`lotId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IoTDevice` ADD CONSTRAINT `IoTDevice_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `ParkingLot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParkingSlot` ADD CONSTRAINT `ParkingSlot_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `ParkingLot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParkingSlot` ADD CONSTRAINT `ParkingSlot_deviceMac_fkey` FOREIGN KEY (`deviceMac`) REFERENCES `IoTDevice`(`macAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;
