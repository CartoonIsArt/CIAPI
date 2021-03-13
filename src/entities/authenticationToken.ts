import {
   Column,
   Entity,
   PrimaryGeneratedColumn,
  } from "typeorm"

@Entity()
export default class AuthenticationToken {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({
    type: "blob",
    unique: true,
  })
  public accessToken: string

  @Column({
    type: "blob",
    unique: true,
  })
  public refreshToken: string

  @Column({
    type: "bigint",
  })
  public accessIp: number
}
