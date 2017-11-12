import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

/* 게시글 테이블 스키마 */
@Entity()
export default class Documents {

  /* 게시글의 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 게시글 내용 */
  @Column("text")
  public text: string

  /* 작성된 시간 */
  @CreateDateColumn()
  public createdAt: Date

}
 