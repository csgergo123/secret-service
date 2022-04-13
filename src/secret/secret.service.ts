import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import * as moment from 'moment';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Secret, SecretDocument } from './schemas/secret.schema';
import { CreateSecretDto } from './dto/create-secret.dto';
import { CryptService } from './crypt/crypt.service';

@Injectable()
export class SecretService {
  private logger = new Logger('SecretService');

  constructor(
    @InjectModel(Secret.name) private secretModel: Model<SecretDocument>,
    private cryptService: CryptService,
  ) {}

  /** Adds a secret and save it.
   * The secret text is stored encrypted.
   *
   * @param createSecretDto
   * @returns Secret object
   */
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

    const encryptedSecretText = this.cryptService.encrypt(
      createSecretDto.secret,
    );

    try {
      const secret = new this.secretModel({
        hash: new ObjectId(),
        secretText: encryptedSecretText,
        remainingViews: createSecretDto.expireAfterViews,
        expiresAt: expiresAtDate,
        createdAt: now.toISOString(),
      });

      this.logger.log(`Secret hash: ${secret.hash} created`);
      this.logger.debug(`Secret text: ${createSecretDto.secret}`);

      await secret.save();

      const secretObj = secret.toObject();
      delete secretObj._id;
      delete secretObj.__v;

      return secretObj;
    } catch (error) {
      this.logger.error(
        `Failed to create secret ${JSON.stringify(createSecretDto)}.`,
        error,
      );
      throw new Error(error);
    }
  }

  /** Finds the secret by its unique hash. Decrypt the encrypted secret and decrease the remaining views property by one.
   *
   * @param hash Unique hash of the secret
   * @returns Secret object
   */
  async getSecretByHash(hash: string): Promise<Secret> {
    let secret = await this.findByHash(hash);
    if (!secret) {
      this.logger.debug(`Secret with hash:${hash} not found`);
      throw new NotFoundException(`Secret not found`);
    }

    secret = await this.decreaseRemainingViews(secret);

    const decryptedSecretText = this.cryptService.decrypt(secret.secretText);

    // Update the encoded secret text to the decrypted one
    secret.secretText = decryptedSecretText;
    return secret;
  }

  /** Finds the secret by its hash value if the remaining view is greater than 0 and expires at points in the future.
   *
   * @param hash
   * @returns Secret object
   */
  private async findByHash(hash: string): Promise<Secret> {
    try {
      return await this.secretModel
        .findOne(
          {
            hash,
            remainingViews: { $gt: 0 }, // Still be remaining views
            expiresAt: { $gt: moment() }, // expires at should be in the future
          },
          { _id: 0 }, // Remove the _id from the result
        )
        .exec();
    } catch (error) {
      this.logger.error(`Error during find secret`, error);
    }
  }

  async findAll(): Promise<Secret[]> {
    try {
      return this.secretModel.find().exec();
    } catch (error) {
      this.logger.error(`Error during find secret`, error);
    }
  }

  /** Decreases the secret's remaining views value by 1.
   *
   * @param secret
   * @returns Secret object
   */
  private async decreaseRemainingViews(secret: Secret): Promise<Secret> {
    secret.remainingViews--;
    try {
      await this.secretModel
        .findOneAndUpdate({ hash: secret.hash }, secret)
        .setOptions({ overwrite: true, new: false });
      this.logger.log(
        `Decrease hash: ${secret.hash}. Remaining views: ${secret.remainingViews}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during decrease the remaining views in hash:${secret.hash}`,
        error,
      );
    }
    return secret;
  }
}
