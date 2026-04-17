import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing');
    }

    const adapter = new PrismaMariaDb(databaseUrl);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Kết nối Database thành công!');
    } catch (error) {
      console.error('❌ Lỗi kết nối Database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}