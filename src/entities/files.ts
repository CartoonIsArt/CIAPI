import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

/* 파일 테이블 스키마 */
@Entity()
export default class Files{

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
