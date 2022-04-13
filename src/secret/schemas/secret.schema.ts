import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SecretDocument = Secret & Document;

@Schema({ versionKey: false })
export class Secret {
  _id: ObjectId;

  @ApiProperty({ description: 'Unique hash to identify the secrets' })
  @Prop({ required: true, unique: true })
  hash: string;

  @ApiProperty({ description: `The secret itself` })
  @Prop({ required: true })
  secretText: string;

  @ApiProperty({
    description: `The date and time of the creation`,
  })
  @Prop({ required: true })
  createdAt: Date;

  @ApiProperty({
    description: `The secret cannot be reached after this time`,
  })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({
    description: `How many times the secret can be viewed`,
  })
  @Prop({ required: true })
  remainingViews: number;
}

export const SecretSchema = SchemaFactory.createForClass(Secret);
