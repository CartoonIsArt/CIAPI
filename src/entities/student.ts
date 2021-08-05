import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import Account from "./account"

/* 유저 테이블 스키마 */
@Entity()
export default class Student {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @Column({
    name: "student_number",
    type: "int",
    unique: true,
  })
  public studentNumber: number  // 학번

  @Column({
    name: "name",
    type: "varchar",
  })
  public name: string           // 이름

  @Column({
    name: "n_th",
    type: "int",
  })
  public nTh:	number            // 기수

  @Column({
    name: "birthdate",
    type: "date",
  })
  public birthdate: Date        // 생일

  @Column({
    name: "major",
    type: "varchar",
  })
  public major: string          // 전공

  @Column({
    name: "email",
    type: "varchar",
  })
  public email: string          // 이메일 주소

  @Column({
    name: "phone_number",
    type: "nchar",
    width: 13,
    unique: true,
  })
  public phoneNumber: string    // 핸드폰 번호

  @Column({
    name: "has_graduated",
    type: "boolean",
    default: false,
  })
  public hasGraduated: boolean  // 졸업 여부
  
  @OneToOne(() => Account, account => account.student)
  public account: Account       // 학생 정보
}
