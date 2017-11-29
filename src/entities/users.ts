import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import Documents from "./documents"
import Files from "./files"

/* 유저정보 테이블 스키마 */
@Entity()
export default class Users {
  /*  유저의 작성글 리스트 */
  @OneToMany(type => Documents, document => document.author)
  @JoinColumn()
  public document: Documents[]

  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 유저 프로필 이미지 */
  @OneToOne(type => Files, { nullable: true })
  @JoinColumn()
  public profileImage: Files

  /* 유저 로그인시 사용할 이름 */
  @Column("text")
  public username: string

  /* 유저 회원 가입 일자 */
  @CreateDateColumn()
  public dataJoined: Date

  /* 유저 휴대전화 번호 */
  @Column("text")
  public phoneNumber: string

  /* 유저의 가입허용 여부 */
  @Column("boolean")
  public isAnon: boolean

  /* 유저 생일 */
  @Column("date")
  public dateOfBirth: Date

  /* 유저 프로필 */
  @Column("text")
  public profileText:	string

  /* 유저 DB관리 권한 유무 */
  @Column("boolean")
  public isSuperUser:	boolean

  /* 유저 임원진 여부 */
  @Column("boolean")
  public isStaff:	boolean

  /* 유저 활동인구 여부 */
  @Column("boolean")
  public isActivated:	boolean

  /* 유저 졸업여부 */
  @Column("boolean")
  public isGraduated:	boolean

  /* 유저 정회원 여부 */
  @Column("boolean")
  public isRegularMember:	boolean

  /* 유저 학번 */
  @Column("int")
  public studentNumber:	number

  /* 유저 기수 */
  @Column("int")
  public nTh:	number

  /* 유저 이름 */
  @Column("text")
  public fullname:	string

  /* 유저 학과 */
  @Column("text")
  public department:	string

  /* 유저 게시글 수 */
  @Column("text")
  public numberOfDocuments:	number

  /* 유저 댓글 수 */
  @Column("text")
  public numberOfComments:	number

  /* 유저 좋아요 수 */
  @Column("text")
  public numberOfLikes:	number

  /* 유저가 좋아하는 만화 */
  @Column("text")
  public favoriteComic:	string

  /* 유저가 좋아하는 캐릭터 */
  @Column("text")
  public favoriteCharacter:	string
}
