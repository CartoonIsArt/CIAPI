import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export default class AuthenticationToken {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @Column({
    name: "access_token",
    type: "text",
  })
  public accessToken: string  // 로그인 여부 확인용 JWT 액세스 토큰

  @Column({
    name: "refresh_token",
    type: "text",
    unique: true,
  })
  public refreshToken: string // 액세스 토큰 재발급용 리프레시 토큰
  
  @Column({
    name: "access_ip",
    type: "varbinary",
    length: 45,
  })
  public accessIp: string     // 접속 아이피
}
