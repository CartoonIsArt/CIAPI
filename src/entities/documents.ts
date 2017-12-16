import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import Users from "./users"

/* 게시글 테이블 스키마 */
@Entity()
export default class Documents {

  @ManyToOne( type => Users, author => author.document, { nullable : false })
  public author: Users

  /* 게시글 작성자의 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 게시글 내용 */
  @Column("text")
  public text: string

  /* 작성된 시간 */
  @CreateDateColumn()
  public createdAt: Date

}
