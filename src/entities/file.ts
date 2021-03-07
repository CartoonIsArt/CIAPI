import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import User from "./user"

/* 파일 테이블 스키마 */
@Entity()
export default class File{
  /* 파일 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 파일의 원래 이름 */
  @Column("text")
  public filename: string

  /* 파일 저장 경로 */
  @Column("text")
  public savedPath: string

  /* 파일 소유 유저 */
  @OneToOne(type => User, user => user.profileImage, {
    nullable: false,
  })
  @JoinColumn()
  public user: User
}
