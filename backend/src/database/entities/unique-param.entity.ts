import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

// just a first approximation; can edit based on business logic
// need to keep in sync with CheckGoGovSG
export interface DisplayData {
  messageType: string
  agencyName: string
  agencySenderId: string
  recipientId: string
  timestamp: Date
}

/**
 * Notification entity
 * @uniqueParamString the uniquely generated parameter generated for each message
 * @displayData the data to be displayed to assure users of the authenticity of the message
 * @numOfQueries keep track (and possibly limit) number of queries per uniqueParamString. strictly not necessary, but useful to track usage. trade-off: UPDATE query will be slower than SELECT query, could be a problem with high traffic
 */
@Entity({ name: 'unique_param' })
export class UniqueParam {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  uniqueParamString: string

  @Column('jsonb')
  displayData: DisplayData

  @Column('smallint', { nullable: false, default: 0 })
  numOfQueries: number // not strictly necessary, but helps to identify brute force attack

  // if null, then param is valid forever
  @Column('timestamptz', { nullable: true })
  expiredAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date
}
