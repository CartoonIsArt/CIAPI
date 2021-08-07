import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import Account from "./account"

// For MariaDB
// export enum UserRole {
//   SUPERUSER = "superuser",
//   BOARD_MANAGER = "board manager",
//   MANAGER = "manager",
//   REGULAR = "regular",
//   NON_REGULAR = "non-regular",
//   LEAVER = "leaver",
// }

@Entity()
export default class Permission {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number
  
  @Column({
    name: "level",
    // type: "enum",
    // enum: UserRole,
    // default: UserRole.NON_REGULAR,
    type: "varchar",
    unique: true,
  })
  public level: string    // 권한 수준
  
  @OneToMany(() => Account, account => account.permission, {
    nullable: false,
  })
  public account: Account // 계정
}
