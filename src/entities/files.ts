import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import Users from "./users"

/* 파일 테이블 스키마 */
@Entity()
export default class Files{

  @OneToOne(type => Users, users => users.profileImage)
  public users: Users

  /* 파일들의 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 파일의 원래 이름 */
  @Column("text")
  public file: string

  /* 파일의 저장 이름 */
  @Column("text")
  public savedPath: string
}
