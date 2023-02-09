import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../clients/s3";
import { Readable } from "stream";
import { dateOptionsSchema, indexedRecordsSchema } from "../../../../types";
import { streamToString } from "./parsers";

export const getInflationPeriods = async () => {
  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "adapted-mm23.json",
  });

  const rawS3ObjectStream = await s3Client.send(getCommand);

  const stringObject = await streamToString(rawS3ObjectStream.Body as Readable);
  const jsonObject = JSON.parse(stringObject);
  const inflationPeriods = indexedRecordsSchema.parse(jsonObject);
  return inflationPeriods;
};
