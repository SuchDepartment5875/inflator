import { adaptCsv } from "../../utils/adapt-csv";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../clients/s3";

export async function importONSData(): Promise<any> {
  console.log("importing ons data....");
  const res = await adaptCsv();

  const putCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: "adapted-mm23.json",
    Body: JSON.stringify(res),
  });

  await s3Client.send(putCommand);

  return "Data import complete";
}
