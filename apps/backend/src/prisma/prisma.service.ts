import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Prisma 6 reads the datasource URL from schema.prisma (DATABASE_URL env).
  // For Prisma 7, you'd pass { accelerateUrl } or an adapter; we rolled back
  // to 6 because Prisma 7's adapter requirement is incompatible with the
  // Supabase session pooler without an extra adapter package.
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}
