import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm"
import Account from "./account"

@Entity()
export default class Enrollment {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @CreateDateColumn({
    name: "created_at",
  })
  public createdAt: Date

  @Column({
    name: "title",
    type: "varchar",
  })
  public title: string          // 활동인구 신청 제목 (e.g., 2021학년도 1학기 활동인구 신청)

  @Column({
    name: "start_date",
    type: "datetime",
    nullable: false,
  })
  public startDate: Date        // 활동인구 신청 종료 날짜

  @Column({
    name: "end_date",
    type: "datetime",
    nullable: false,
  })
  public endDate: Date          // 활동인구 신청 종료 날짜

  @ManyToMany(() => Account, {
    nullable: false,
  })
  @JoinTable({
    name: "enrollments_enrollees",
    joinColumn: {
      name: "enrollment_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "account_id",
      referencedColumnName: "id",
    },
  })
  public enrollees: Account[]   // 활동인구 신청 회원들

  @ManyToMany(() => Account, {
    nullable: false,
  })
  @JoinTable({
    name: "enrollments_candidates",
    joinColumn: {
      name: "enrollment_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "account_id",
      referencedColumnName: "id",
    },
  })
  public candidates: Account[]   // 활동인구 신청 가능한 회원들
}
