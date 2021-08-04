import { Entity, Column } from "typeorm"
import { IDocument } from './document'

@Entity()
export default class Notification extends IDocument {
}
