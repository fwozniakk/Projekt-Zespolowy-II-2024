import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Game as GameEntity } from '../entity/game.entity';
import { Move, Game, Board } from 'engine';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';

function gameEntityToGame(gameEntity: GameEntity): Game {
  const game = new Game(
    new Board({ startNotation: gameEntity.startNotation }),
    JSON.parse(gameEntity.history).map((element: string) => {
      const move = Move.fromString(element);
      return move;
    }),
  );
  return game;
}

@Injectable()
export class GameService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(GameEntity)
    private usersRepository: Repository<GameEntity>,
  ) {}

  async createGame(bot: boolean = false) {
    const id = randomUUID();
    await this.dataSource.transaction(async (manager) => {
      await manager.save(GameEntity, {
        id: id,
        startNotation: new Board().notation,
        history: JSON.stringify([]),
        ended: false,
        bot: bot,
      });
    });
    return { id: id };
  }

  async getGames() {
    return (await this.usersRepository.find()).map((g: GameEntity) => {
      return g.id;
    });
  }

  async getGame(id: string) {
    const gameEntity = await this.usersRepository.findBy({ id: id });
    if (!gameEntity) {
      throw new NotFoundException();
    }
    const game = gameEntityToGame(gameEntity[0]);

    return {
      startBoard: game.currentBoard.notation,
      history: game.history.map((m: Move) => m.toString()),
    };
  }

  async makeMove(id: string, move: string) {
    const gameEntity = await this.usersRepository.findBy({ id: id });
    if (!gameEntity) {
      throw new NotFoundException();
    }
    const game = gameEntityToGame(gameEntity[0]);
    game.makeMove(Move.fromString(move));
    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        GameEntity,
        { id: id },
        {
          history: JSON.stringify(game.history.map((m: Move) => m.toString())),
        },
      );
    });
  }
}
