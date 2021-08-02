import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import Comment from "./comment"
import Document from "./document"
import File from "./file"

/* 유저 테이블 스키마 */
@Entity()
export default class User {
  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  // 회원가입 시 입력받는 정보

  /* 이름 */
  @Column("text")
  public fullname: string

  /* 기수 */
  @Column("int")
  public nTh:	number

  /* 생일 */
  @Column("date")
  public birthdate: Date

  /* 아이디 */
  @Column("varchar", {
    unique: true,
  })
  public username: string

  /* 비밀번호 */
  @Column("text")
  public password: string

  /* 비밀번호 솔트 */
  @Column("text")
  public salt: string

  /* 전공 */
  @Column("text")
  public major: string

  /* 학번 */
  @Column("int")
  public studentNumber:	number

  /* 이메일 주소 */
  @Column("text")
  public email: string

  /* 핸드폰 번호 */
  @Column("text")
  public phoneNumber: string

  /* 좋아하는 만화 */
  @Column("text", {
    default: "",
  })
  public favoriteComic:	string

  /* 좋아하는 캐릭터 */
  @Column("text", {
    default: "",
  })
  public favoriteCharacter:	string

  /* 프로필 이미지 */
  @OneToOne(type => File, files => files.user)
  public profileImage: File

  // 회원가입 시 입력받는 정보 끝

  /* 프로필 배너 */
  @OneToOne(type => File, files => files.user)
  public profileBanner: File

  /* 프로필 텍스트 */
  @Column("text", {
    default: "",
  })
  public profileText:	string

  /* 회원 가입 일자 */
  @CreateDateColumn()
  public joinDate: Date

  /* 가입허용 여부 */
  @Column("boolean", {
    default: false,
  })
  public isApproved: boolean

  /* DB관리 권한 유무 */
  @Column("boolean", {
    default: false,
  })
  public isSuperuser:	boolean

  /* 임원진 여부 */
  @Column("boolean", {
    default: false,
  })
  // public isBoardMember:	boolean
  public isBoardMemeber:	boolean

  /* 총무 여부 */
  @Column("boolean", {
    default: false,
  })
  public isManager:	boolean

  /* 활동인구 여부 */
  @Column("boolean", {
    default: false,
  })
  public isActive:	boolean

  /* 졸업여부 */
  @Column("boolean", {
    default: false,
  })
  public hasGraduated:	boolean

  /* 정회원 여부 */
  @Column("boolean", {
    default: false,
  })
  public isRegular:	boolean

  /* 게시글 수 */
  @Column("int", {
    default: 0,
  })
  public documentsCount: number

  /* 댓글 수 */
  @Column("int", {
    default: 0,
  })
  public commentsCount:	number

  /* 좋아요한 게시글 수 */
  @Column("int", {
    default: 0,
  })
  public likedDocumentsCount:	number

  /* 좋아요한 댓글 수 */
  @Column("int" , {
    default: 0,
  })
  public likedCommentsCount: number

  /* 작성 글 리스트 */
  @OneToMany(type => Document, document => document.author)
  public documents: Document[]

  /* 작성 댓글 리스트 */
  @OneToMany(type => Comment, comment => comment.author)
  public comments: Comment[]

  /* 좋아요한 게시글 리스트 */
  @ManyToMany(type => Document, document => document.likedUsers)
  public likedDocuments: Document[]

  /* 좋아요한 댓글 리스트 */
  @ManyToMany(type => Comment, comment => comment.likedUsers)
  public likedComments: Comment[]

  // 미확인 공지 리스트
  // @OneToMany(type => Document, document => document.)
}
