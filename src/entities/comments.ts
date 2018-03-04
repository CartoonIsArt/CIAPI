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
import Documents from "./documents"
import Users from "./users"

/* 댓글 테이블 스키마 */
@Entity()
export default class Comments {
  /* 댓글 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 댓글이 달린 게시물 pk */
  @Column("int", {
    nullable: false,
  })
  public documentId: number

  /* 내용 */
  @Column("text")
  public text: string

  /* 작성 시각 */
  @CreateDateColumn()
  public createdAt: Date

  /* 작성자 */
  @ManyToOne(type => Users, author => author.comments, {
    nullable : false,
  })
  public author: Users

  /* 댓글이 달린 게시물 */
  @ManyToOne(type => Documents, documents => documents.comments, {
    nullable: false,
  })
  public rootDocument: Documents

  /* 좋아요 수 */
  @ManyToMany(type => Users)
  @JoinTable()
  public likedBy: Users[]

  // 이하 대댓글 옵션

  /* 이 대댓글이 달린 댓글 */
  @ManyToOne(type => Comments, comments => comments.replies)
  public rootComment: Comments

  /* 가지고 있는 대댓글 리스트 */
  @OneToMany(type => Comments, comments => comments.rootComment)
  public replies: Comments[]
}
