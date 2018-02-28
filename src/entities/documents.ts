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
import Users from "./users"

/* 게시글 테이블 스키마 */
@Entity()
export default class Documents {

  @ManyToOne( type => Users, author => author.documents, { nullable : false })
  public author: Users

    /* 현재 게시글에 달린 댓글 */
  @OneToMany(type => Comments, comments => comments.rootDocument)
  public comments: Comments[]

  /* 게시글 작성자의 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 게시글 내용 */
  @Column("text")
  public text: string

  /* 작성된 시간 */
  @CreateDateColumn()
  public createdAt: Date

  /*좋아요 받은 갯수*/
  @ManyToMany(type => Users)
  @JoinTable()
  public likedBy: Users[]
}
