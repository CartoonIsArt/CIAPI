import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import Documents from "./documents"
import Users from "./users"

/* 댓글 테이블 스키마 */
@Entity()
export default class Comments {
  /* 댓글 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 댓글이 달린 게시물의 pk */
  @Column("int", { nullable: false })
  public documentId: number

  /* 현재 댓글이 달린 게시물 */
  @ManyToOne(type => Documents, documents => documents.comments)
  public rootDocument: Documents

  /* 현재 대댓글이 달린 댓글 */
  @ManyToOne(type => Comments, comments => comments.replies)
  public rootComment: Comments

  /* 현재 댓글이 가지고 있는 대댓글 리스트 */
  @OneToMany(type => Comments, comments => comments.rootComment)
  public replies: Comments[]

  /* 댓글이 달린 시각 */
  @CreateDateColumn()
  public createdAt: Date

  /* 댓글 내용 */
  @Column("text")
  public text: string

  /* 댓글을 작성한 유저 */
  @ManyToOne( type => Users, author => author.comment, { nullable : false })
  public user: Users
}
