import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

@Entity('secret')
export class Secret extends BaseEntity {
  @ApiProperty({ description: 'Unique hash to identify the secrets' })
  @ObjectIdColumn()
  hash: ObjectID;

  @ApiProperty({ description: `The secret itself` })
  @Column()
  secretText: string;

  @ApiProperty({
    description: `The date and time of the creation`,
  })
  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @ApiProperty({
    description: `The secret cannot be reached after this time`,
  })
  @Column()
  expiresAt: Date;

  @ApiProperty({
    description: `How many times the secret can be viewed`,
  })
  @Column()
  remainingViews: number;

  constructor(init?: Partial<Secret>) {
    super();
    Object.assign(this, init);
  }
}
