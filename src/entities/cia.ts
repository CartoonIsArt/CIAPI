import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

/* 게시글 테이블 스키마 */
@Entity()
export default class Cia {
  @PrimaryGeneratedColumn()
    public id: number

  @Column("text")
    public name: string

  @Column("text")
    public value: string

}
