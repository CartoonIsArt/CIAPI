import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationOptions,
} from "typeorm"
import Comments from "./comments"
import Documents from "./documents"
import Files from "./files"

/* 유저 테이블 스키마 */
@Entity()
export default class Users {
  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  // 회원가입 시 입력받는 정보

  /* 프로필 이미지 */
  @OneToOne(type => Files, files => files.user)
  public profileImage: Files

  /* 이름 */
  @Column("text")
  public fullname:	string

  /* 기수 */
  @Column("int")
  public nTh:	number

  /* 생일 */
  @Column("date")
  public dateOfBirth: Date

  /* 아이디 */
  @Column("varchar", {
    unique: true,
  })
  public username: string

  /* 비밀번호 */
  @Column("text")
  public password: string

  /* 학과 */
  @Column("text")
  public department: string

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

  // 회원가입 시 입력받는 정보 끝

  /* 회원 가입 일자 */
  @CreateDateColumn()
  public dataJoined: Date

  /* 가입허용 여부 */
  @Column("boolean", {
    default: false,
  })
  public isAnon: boolean

  /* 프로필 */
  @Column("text", {
    default: "",
  })
  public profileText:	string

  /* DB관리 권한 유무 */
  @Column("boolean", {
    default: false,
  })
  public isSuperUser:	boolean

  /* 활동인구 여부 */
  @Column("boolean", {
    default: false,
  })
  public isActivated:	boolean

  /* 졸업여부 */
  @Column("boolean", {
    default: false,
  })
  public isGraduated:	boolean

  /* 정회원 여부 */
  @Column("boolean", {
    default: false,
  })
  public isRegularMember:	boolean

  /* 게시글 수 */
  @Column("int", {
    default: 0,
  })
  public numberOfDocuments:	number

  /* 댓글 수 */
  @Column("int", {
    default: 0,
  })
  public numberOfComments:	number

  /* 좋아요한 게시글 수 */
  @Column("int", {
    default: 0,
  })
  public numberOfDocumentLikes:	number

  /* 좋아요한 댓글 수 */
  @Column("int" , {
    default: 0,
  })
  public numberOfCommentLikes: number

  /* 작성 글 리스트 */
  @OneToMany(type => Documents, document => document.author)
  public documents: Documents[]

  /* 작성 댓글 리스트 */
  @OneToMany(type => Comments, comment => comment.author)
  public comments: Comments[]

  /* 좋아요한 게시글 리스트 */
  @ManyToMany(type => Documents, document => document.likedBy)
  public likedDocuments: Documents[]

  /* 좋아요한 댓글 리스트 */
  @ManyToMany(type => Comments, comments => comments.likedBy)
  public likedComments: Comments[]
}
