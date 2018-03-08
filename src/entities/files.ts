import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import Users from "./users"

/* 파일 테이블 스키마 */
@Entity()
export default class Files{
  /* 파일 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 파일의 원래 이름 */
  @Column("text")
  public file: string

  /* 파일 저장 경로 */
  @Column("text")
  public savedPath: string

  /* 파일 소유 유저 */
  @OneToOne(type => Users, user => user.profileImage, {
    nullable: false,
  })
  @JoinColumn()
  public user: Users
}
