import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import orgconfig from './orm-config';

@Module({
  imports: [TypeOrmModule.forRoot(orgconfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
