import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import Users from "./users"

/* 댓글 테이블 스키마 */
@Entity()
export default class Comments {

    /* 댓글을 작성한 유저 */
  @ManyToOne( type => Users, author => author.comment, { nullable : false })
  public author: Users

    /* 댓글 pk */
  @PrimaryGeneratedColumn()
  public id: number

    /* 댓글이 달릴 글의 pk */
  @Column("int")
  public documentId: number

    /* 댓댓글이 달릴 글의 pk */
  @Column("int")
  public commentId: number

    /* 댓글이 달린 시각 */
  @CreateDateColumn()
  public createdAt: Date

    /* 댓글 내용 */
  @Column("text")
  public text: string
}
