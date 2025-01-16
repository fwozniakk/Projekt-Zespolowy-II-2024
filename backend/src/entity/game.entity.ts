import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startNotation: string;

  @Column()
  history: string;

  @Column()
  ended: boolean;

  @Column()
  bot: boolean;
}
