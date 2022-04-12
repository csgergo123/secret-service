import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import * as moment from 'moment';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Secret, SecretDocument } from './schemas/secret.schema';
import { CreateSecretDto } from './dto/create-secret.dto';

@Injectable()
export class SecretService {
  private logger = new Logger('SecretService');

  constructor(
    @InjectModel(Secret.name) private secretModel: Model<SecretDocument>,
  ) {}

  async addSecret(createSecretDto: CreateSecretDto): Promise<Secret> {
    const now = moment();
    let expiresAtDate: string;
    if (createSecretDto.expireAfter > 0) {
      expiresAtDate = moment()
        .add(createSecretDto.expireAfter, 'seconds')
        .toISOString();
    } else {
      expiresAtDate = moment().add(1000, 'years').toISOString();
    }

    try {
      const secret = new this.secretModel({
        hash: new ObjectId(),
        secretText: createSecretDto.secret,
        remainingViews: createSecretDto.expireAfterViews,
        expiresAt: expiresAtDate,
        createdAt: now.toISOString(),
      });
      this.logger.log(`Secret ${createSecretDto.secret} created.`);
      return secret.save();
    } catch (error) {
      this.logger.error(
        `Failed to create secret ${JSON.stringify(createSecretDto)}.`,
        error,
      );
      throw new Error(error);
    }
  }

  async getSecretByHash(hash: string): Promise<Secret> {
    const secret = await this.findByHash(hash);
    if (!secret) {
      this.logger.debug(`Secret with hash:${hash} not found`);
      throw new NotFoundException(`Secret not found`);
    }

    const decreasedSecret = await this.decreaseRemainingViews(secret);

    return decreasedSecret;
  }

  private async findByHash(hash: string): Promise<Secret> {
    try {
      return this.secretModel
        .findOne({
          hash,
          remainingViews: { $gt: 0 }, // Still be remaining views
          expiresAt: { $gt: moment() }, // expires at should be in the future
        })
        .exec();
    } catch (error) {
      this.logger.error(`Error during find secret.`, error);
    }
  }

  async findAll(): Promise<Secret[]> {
    try {
      return this.secretModel.find().exec();
    } catch (error) {
      this.logger.error(`Error during find secret.`, error);
    }
  }

  private async decreaseRemainingViews(secret: Secret): Promise<Secret> {
    secret.remainingViews--;
    try {
      return this.secretModel
        .findByIdAndUpdate(secret._id, secret)
        .setOptions({ overwrite: true, new: false });
    } catch (error) {
      this.logger.error(`Error during decrease secret remaining views.`, error);
    }
  }
}
