import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import Poll from "./poll"
import BitTransformer from "../transformer/BitTransformer"

@Entity()
export default class Vote {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date

  @Column({
    name: "title",
    type: "varchar",
    nullable: false,
  })
  public title: string          // 투표 제목

  @Column({
    name: "end_time",
    type: "datetime",
    nullable: false,
  })
  public endTime: Date          // 투표 종료 시각

  @Column({
    name: "has_multiple",
    type: "bit",
    transformer: new BitTransformer<boolean>(),
    default: false,
  })
  public hasMultiple: boolean   // 다중 항목 투표 가능 여부

  @Column({
    name: "item1",
    type: "varchar",
    nullable: false,
  })
  public item1: string          // 투표 항목 1
  
  @Column({
    name: "item2",
    type: "varchar",
    nullable: false,
  })
  public item2: string          // 투표 항목 2
  
  @Column({
    name: "item3",
    type: "varchar",
    nullable: true,
  })
  public item3: string          // 투표 항목 3
  
  @Column({
    name: "item4",
    type: "varchar",
    nullable: true,
  })
  public item4: string          // 투표 항목 4
  
  @OneToMany(() => Poll, poll => poll.vote, {
    nullable: false,
  })
  public polls: Poll[]          // 투표들
}

export const MakeResponseVoteItems = ({ item1, item2, item3, item4 }) => 
  [item1, item2, item3, item4].filter(item => !!item)

export const MakeResponseVoteResult = (result, items) => {
  if (result.length === 0)
    return []

  const total = result.reduce((prev, cur) => (prev + cur))

  return result
    .slice(0, items.length)
    .map((x, idx) => ({
      item: items[idx],
      count: x,
      percent: (total > 0) ? (x / total * 100) : 0,
    }))
    .sort((lhs, rhs) => rhs.count - lhs.count)
}

export const MakeResponseVote = ({
  id,
  title,
  endTime,
  hasMultiple,
  item1,
  item2,
  item3,
  item4,
  polls,
},
selections = [],
result = []) => ({
  id,
  title,
  endTime,
  hasMultiple,
  items: MakeResponseVoteItems({ item1, item2, item3, item4 }),
  selections: hasMultiple ? selections : selections[0],
  result: MakeResponseVoteResult(result, MakeResponseVoteItems({ item1, item2, item3, item4 })),
  polls,
})
