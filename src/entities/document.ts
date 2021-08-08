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
import Comment from "./comment"

@Entity()
export default class Document {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date          // 작성일

  @Column({
    name: "content",
    type: "text",
  })
  public content: string          // 글 내용

  @Column({
    name: "is_notification",
    type: "tinyint",
    default: false,
  })
  public isNotification: boolean  // 공지글 여부

  @ManyToOne(() => Account, author => author.documents, {
    eager: true,
    nullable : false,
  })
  @JoinColumn({
    name: "author_id",
  })
  public author: Account          // 작성자

  @ManyToMany(() => Account, {
    eager: true,
    nullable: false,
  })
  @JoinTable({
    name: "documents_accounts",
    joinColumn: {
      name: "document_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "account_id",
      referencedColumnName: "id",
    },
  })
  public likedAccounts: Account[]    // 좋아요한 유저들

  @OneToMany(() => Comment, comment => comment.rootDocument, {
    eager: true,
    nullable: false,
  })
  public comments: Comment[]      // 댓글들
}
