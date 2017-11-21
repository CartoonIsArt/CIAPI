import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import Documents from "./documents"

/* 유저정보 테이블 스키마 */
@Entity()
export default class Users {

  @OneToMany(type => Documents, document => document.author)
  @JoinColumn()
  public document: Documents[]

  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 유저 이름 */
  @Column("text")
  public firstname: string

}
