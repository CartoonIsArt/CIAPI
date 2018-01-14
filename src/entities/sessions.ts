import {
   Column,
   CreateDateColumn,
   Entity,
   JoinColumn,
   OneToOne,
   PrimaryGeneratedColumn,
   UpdateDateColumn,
  } from "typeorm"
import Users from "./users"

/* 세션 테이블 스키마 */
@Entity()
export default class Sessions {
  @PrimaryGeneratedColumn()
  public id: number

  /* 세션에 해당하는 유저 */
  @OneToOne(
    type => Users,
    {
      nullable: false,
    },
  )
  @JoinColumn()
  public user: Users

  /* BLOB(Binary Large OBject)는 TEXT보다 알맞다고 함.
     세션아이디 컬럼. */
  @Column({
    type: "blob",
    unique: true,
  })
  public data: string

  @Column({
    type: "bigint",
  })
  public ipv4: number

  @Column({
    nullable: true,
    type: "bigint",
  })
  public ipv6: number

  @CreateDateColumn({
    type: "timestamp",
  })
  public createdAt: Date

  @UpdateDateColumn({
    type: "timestamp",
  })
  public updatedAt: Date
}
