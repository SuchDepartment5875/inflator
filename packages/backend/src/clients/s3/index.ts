import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";

const localConfig =
  process.env.ENVIRONMENT !== "development"
    ? {
        credentials: fromIni({ profile: `james-${process.env.ENVIRONMENT}` }),
      }
    : {
        credentials: {
          accessKeyId: "S3RVER",
          secretAccessKey: "S3RVER",
        },
        forcePathStyle: true,
        endpoint: "http://localhost:4569",
      };

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  ...(process.env.IS_OFFLINE && localConfig),
});
