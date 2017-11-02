import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export default class Users {

  @PrimaryGeneratedColumn()
  public id: number

  @Column("text")
  public firstname: string

}
