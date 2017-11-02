import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

/* 유저정보 테이블 스키마 */
@Entity()
export default class Users {

  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 유저 이름 */
  @Column("text")
  public firstname: string;

}
