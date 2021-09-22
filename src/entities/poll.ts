import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import Account from "./account"
import Vote from "./vote"
import BitTransformer from "../transformer/BitTransformer"

@Entity()
export default class Poll {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date

  @ManyToOne(() => Vote, vote => vote.polls, {
    nullable: false,
  })
  @JoinColumn({
    name: "vote_id",
  })
  public vote: Vote         // 투표 종류

  @ManyToOne(() => Account, account => account.polls, {
    nullable: false,
  })
  @JoinColumn({
    name: "account_id",
  })
  public account: Account   // 투표한 사람

  @Column({
    name: "selection",
    type: "bit",
    width: 4,
    transformer: new BitTransformer<number>(),
    nullable: false,
  })
  public selection: number  // 선택
}
