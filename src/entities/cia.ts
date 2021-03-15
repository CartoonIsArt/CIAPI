import { Entity } from "typeorm"
import Content from "./content"

/* 동아리 정보 테이블 스키마 */
@Entity()
export default class Cia extends Content {
  // Content와 동일
  // key-value(text) 쌍 데이터
}