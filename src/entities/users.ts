import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import Documents from "./documents"
import Files from "./files"

/* 유저정보 테이블 스키마 */
@Entity()
export default class Users {

  @OneToMany(type => Documents, document => document.author)
  @JoinColumn()
  public document: Documents[]

  /* Users table pk */
  @PrimaryGeneratedColumn()
  public id: number

  @OneToOne(type => Files, { nullable: true })
  @JoinColumn()
  public profileImage: Files

  /* 유저 이름 */
  @Column("text")
  public firstname: string

}
