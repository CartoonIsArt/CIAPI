import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm"
import Content from "./content"
import Document from "./document"
import User from "./user"

/* 댓글 테이블 스키마 */
@Entity()
export default class Comment extends Content {
  /* 작성자 */
  @ManyToOne(type => User, author => author.comments, {
    nullable : false,
  })
  public author: User

  /* 댓글이 달린 게시물 */
  @ManyToOne(type => Document, documents => documents.comments, {
    nullable: false,
  })
  public rootDocument: Document

  /* 좋아요한 유저들 */
  @ManyToMany(type => User)
  @JoinTable()
  public likedUsers: User[]

  // 이하 대댓글 옵션

  /* 이 대댓글이 달린 댓글 */
  @ManyToOne(type => Comment, comment => comment.comments)
  public rootComment: Comment

  /* 가지고 있는 대댓글 리스트 */
  @OneToMany(type => Comment, comment => comment.rootComment)
  public comments: Comment[]
}
