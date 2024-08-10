import { type Stream } from "stream";

export async function streamToBuffer(stream: Stream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return await new Promise((resolve, reject) => {
    stream.on("data", (chunk: any) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err: any) => {
      reject(err);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
}
