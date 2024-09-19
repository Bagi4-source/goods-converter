import { createHash } from "crypto";
import type { Stream } from "stream";

export const hashStream = async (stream: Stream) => {
  return await new Promise((resolve, reject) => {
    try {
      const hash = createHash("sha256");

      stream.on("data", function (data) {
        hash.update(data);
      });
      stream.on("end", function () {
        resolve(hash.digest("hex"));
      });
    } catch (error) {
      reject(error);
    }
  });
};
