import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { config } from 'dotenv';

config();

export const getFileByKey = (id: string): Readable => {
  const s3 = new S3({ region: process.env.AWS_REGION });
  const params = { Bucket: process.env.BUCKET_NAME as string, Key: id };
  return s3.getObject(params).createReadStream();
};
