import { importONSData } from "./handler";

const bucketName = "some-bucket";
process.env.S3_BUCKET_NAME = bucketName;

jest.mock("../../clients/s3");
jest.mock("../../utils/adapt-csv", () => ({
  adaptCsv: () => "some-return-value",
}));
test("handler", async () => {
  const sendtMock = require("../../clients/s3").s3Client.send;

  const result = await importONSData();
  expect(sendtMock).toHaveBeenCalledTimes(1);
  expect(sendtMock.mock.calls[0][0].input).toStrictEqual({
    Body: '"some-return-value"',
    Bucket: bucketName,
    Key: "adapted-mm23.json",
  });
});
