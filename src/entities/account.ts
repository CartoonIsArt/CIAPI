import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import Comment from "./comment"
import Document from "./document"
import Enrollment from "./enrollment"
import Profile from "./profile"
import Student, { MakeResponseStudent } from "./student"

export enum UserRole {
  SUPERUSER = "superuser",
  BOARD_MANAGER = "board manager",
  MANAGER = "manager",
  REGULAR = "regular",
  NON_REGULAR = "non-regular",
  LEAVER = "leaver",
}

@Entity()
export default class Account {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @Column({
    name: "username",
    type: "varchar",
    unique: true,
  })
  public username: string             // 아이디

  @Column({
    name: "password",
    type: "varchar",
  })
  public password: string             // 비밀번호

  @Column({
    name: "salt",
    type: "char",
    length: 128,
  })
  public salt: string                 // 비밀번호 솔트

  @CreateDateColumn({
    name: "join_date"
  })
  public joinDate: Date               // 회원가입 날짜

  @Column({
    name: "is_approved",
    type: "tinyint",
    default: false,
  })
  public isApproved: boolean          // 가입 승인 여부

  @Column({
    name: "is_active",
    type: "tinyint",
    default: false,
  })
  public isActive:	boolean           // 활동인구 여부

  @Column({
    name: "documents_count",
    type: "int",
    default: 0,
  })
  public documentsCount: number       // 게시글 수

  @Column({
    name: "comments_count",
    type: "int",
    default: 0,
  })
  public commentsCount:	number        // 댓글 수

  @Column({
    name: "liked_documents_count",
    type: "int",
    default: 0,
  })
  public likedDocumentsCount:	number  // 좋아요한 게시글 수

  @Column({
    name: "liked_comments_count",
    type: "int",
    default: 0,
  })
  public likedCommentsCount: number   // 좋아요한 댓글 수

  @OneToOne(() => Profile, profile => profile.account, {
    nullable: false,
  })
  @JoinColumn({
    name: "profile_id",
  })
  public profile: Profile             // 프로필 정보

  @OneToOne(() => Student, student => student.account, {
    nullable: false,
  })
  @JoinColumn({
    name: "student_id",
  })
  public student: Student             // 학생 정보
  
  @Column({
    name: "role",
    type: "enum",
    enum: UserRole,
    default: UserRole.NON_REGULAR,
  })
  public role: UserRole               // 접근 권한

  @OneToMany(() => Document, document => document.author, {
    nullable: false,
  })
  public documents: Document[]        // 작성 글 목록

  @OneToMany(() => Comment, comment => comment.author, {
    nullable: false,
  })
  public comments: Comment[]          // 작성 댓글 목록

  @ManyToMany(() => Document, document => document.likedAccounts, {
    nullable: false,
  })
  public likedDocuments: Document[]   // 좋아요한 게시글 목록

  @ManyToMany(() => Comment, comment => comment.likedAccounts, {
    nullable: false,
  })
  public likedComments: Comment[]     // 좋아요한 댓글 목록

  @ManyToMany(() => Enrollment, enrollment => enrollment.enrollees, {
    nullable: false,
  })
  public enrollments: Enrollment[]
}

export const MakeResponseAccount = ({
  id,
  username,
  isActive,
  documentsCount,
  commentsCount,
  likedDocumentsCount,
  profile,
  student,
  role,
}) => ({
  id,
  username,
  isActive,
  documentsCount,
  commentsCount,
  likedDocumentsCount,
  profile,
  student: MakeResponseStudent(student),
  role,
})

export const MakeMinimizedResponseAccount = ({
  id,
  username,
  isActive,
  documentsCount,
  commentsCount,
  likedDocumentsCount,
  student,
}) => ({
  id,
  username,
  isActive,
  documentsCount,
  commentsCount,
  likedDocumentsCount,
  student: MakeResponseStudent(student),
})