import * as dotenv from "dotenv";
declare const process: {
  env: {
    BASE_API: string;
    GOOGLE_API: string;
  };
};

export async function getMediaFile(media_file_token: string) {
  dotenv.config();
  const url = `${process.env.BASE_API}/v1/media_files/file/${media_file_token}`;
  const response = await fetch(url);
  const json = await JSON.parse(await response.text());
  const bucketPath = json["media_file"]["public_bucket_path"];
  const media_base_url = process.env.GOOGLE_API;
  // gets you a bucket path
  return `${media_base_url}/vocodes-public${bucketPath}`;
}
