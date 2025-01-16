import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async createGame(@Query('bot') bot: string | undefined): Promise<string> {
    console.log(bot);
    if (bot && bot === 'true') {
      return await this.gameService.createGame(true);
    }
    return await this.gameService.createGame();
  }

  @Get()
  async findGames() {
    return await this.gameService.getGames();
  }

  @Get(':id')
  async findGame(@Param('id') id: string) {
    return await this.gameService.getGame(id);
  }
}
