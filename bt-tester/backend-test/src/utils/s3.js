import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadReceiptToS3(localFilePath, orderId) {
  const fileStream = fs.createReadStream(localFilePath);
  const ext = path.extname(localFilePath);
  const receiptId = uuidv4();
  const key = `receipts/${orderId}_${receiptId}${ext}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileStream,
    ContentType: ext === ".pdf" ? "application/pdf" : "image/jpeg",
  };

  await s3.send(new PutObjectCommand(uploadParams));
  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { receiptId, url };
}

export async function uploadReceiptHtmlToS3(receiptHtml, receiptId) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `receipts/${receiptId}.html`,
    Body: receiptHtml,
    ContentType: "text/html",
    ACL: "public-read",
  };
  await s3.send(new PutObjectCommand(params));
  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
}

export async function downloadReceiptFromS3(receiptKey) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: receiptKey,
  };
  const command = new GetObjectCommand(params);
  const data = await s3.send(command);
  return data.Body;
}