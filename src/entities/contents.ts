import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm"
import Comments from "./comments"
import Documents from "./documents"
import Users from "./users"

export default abstract class Contents {
  /* 컨텐츠 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 작성 시각 */
  @CreateDateColumn()
  public createdAt: Date

  /* 제목 */
  @Column({
    default: "",
  })
  public title: string

  /* 내용 */
  @Column("text")
  public text: string
}
