import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { ConversationsModule } from './conversations/conversations.module';
import { UsageModule } from './usage/usage.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AgentsModule,
    ConversationsModule,
    UsageModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
