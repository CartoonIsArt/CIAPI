import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm"
import Account from "./account"

@Entity()
export default class Profile {
  @PrimaryGeneratedColumn({
    name: "id",
    type: "int",
  })
  public id: number

  @Column({
    name: "favorite_comic",
    type: "nvarchar",
    default: "",
  })
  public favoriteComic:	string      // 좋아하는 만화

  @Column({
    name: "favorite_character",
    type: "nvarchar",
    default: "",
  })
  public favoriteCharacter:	string  // 좋아하는 캐릭터

  @Column({
    name: "profile_text",
    type: "varchar",
    default: "",
  })
  public profileText:	string        // 프로필 메시지

  @Column({
    name: "profile_image",
    type: "nchar",
    width: 32,
    default: "/images/default_profile_image",
  })
  public profileImage: string       // 프로필 이미지 경로

  @Column({
    name: "profile_banner_image",
    type: "nchar",
    width: 32,
    default: "/images/default_profile_banner_image",
  })
  public profileBannerImage: string // 프로필 배너 이미지 경로
  
  @OneToOne(() => Account, account => account.profile)
  public account: Account           // 계정
}
