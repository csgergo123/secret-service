import { IsNumber, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSecretDto {
  @ApiProperty({ description: `This text will be saved as a secret` })
  @IsString()
  readonly secret: string;

  @ApiProperty({
    description: `The secret won't be available after the given number of views. It must be greater than 0.`,
  })
  @Min(1, { message: `expireAfterViews must be greater than 0` })
  @IsNumber()
  readonly expireAfterViews: number;

  @ApiProperty({
    description: `The secret won't be available after the given time. The value is provided in minutes. 0 means never expires`,
  })
  @IsNumber()
  readonly expireAfter: number;
}
