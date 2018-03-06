import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import Contents from "./contents"

/* 동아리 정보 테이블 스키마 */
@Entity()
export default class Cia extends Contents {
  // contents와 동일
}
