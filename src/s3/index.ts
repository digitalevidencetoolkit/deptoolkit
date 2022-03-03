import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { config } from 'dotenv';

config();

export const getFileInBucket = (id: string, bucket: string): Readable => {
  const s3 = new S3({ region: process.env.AWS_REGION });
  const params = { Bucket: bucket as string, Key: id };
  return s3.getObject(params).createReadStream();
};
