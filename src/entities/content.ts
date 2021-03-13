import {
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
  } from "typeorm"

export default abstract class Content {
  /* 컨텐츠 pk */
  @PrimaryGeneratedColumn()
  public id: number

  /* 작성 시각 */
  @CreateDateColumn()
  public createdAt: Date

  /* 제목 */
  @Column({
    default: "",
  })
  public title: string

  /* 내용 */
  @Column("text")
  public content: string
}
