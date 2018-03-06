import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm"
import Comments from "./comments"
import Contents from "./contents"
import Users from "./users"

/* 게시글 테이블 스키마 */
@Entity()
export default class Documents extends Contents {
  /* 작성자 */
  @ManyToOne( type => Users, author => author.documents, {
    nullable : false,
  })
  public author: Users

  /* 게시글에 달린 댓글 */
  @OneToMany(type => Comments, comments => comments.rootDocument)
  public comments: Comments[]

  /* 좋아요 수 */
  @ManyToMany(type => Users)
  @JoinTable()
  public likedBy: Users[]
}
