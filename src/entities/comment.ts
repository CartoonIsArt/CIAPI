import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import Account from "./account"
import Document from "./document"

@Entity()
export default class Comment {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date        // 작성일

  @Column({
    name: "content",
    type: "text",
  })
  public content: string        // 내용

  @ManyToOne(() => Account, author => author.comments, {
    nullable : false,
  })
  @JoinColumn({
    name: "author_id",
  })
  public author: Account        // 작성자

  @ManyToMany(() => Account, {
    nullable: false,
  })
  @JoinTable({
    name: "comments_accounts",
    joinColumn: {
      name: "comment_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "account_id",
      referencedColumnName: "id",
    },
  })
  public likedAccounts: Account[]  // 좋아요한 유저들

  @ManyToOne(() => Document, documents => documents.comments, {
    nullable: false,
  })
  @JoinColumn({
    name: "root_document_id",
  })
  public rootDocument: Document // 본 글

  @ManyToOne(() => Comment, comment => comment.comments, {
    nullable: true,
  })
  @JoinColumn({
    name: "root_comment_id",
  })
  public rootComment: Comment   // 본 댓글 

  @OneToMany(() => Comment, comment => comment.rootComment, {
    nullable: false,
  })
  public comments: Comment[]    // 댓글들
}
