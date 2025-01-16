import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Game } from "./entity/game.entity";
import * as path from "node:path";

@Module({
  imports: [
    GameModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.resolve(__dirname, '../db/main.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
