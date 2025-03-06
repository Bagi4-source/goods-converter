import { once } from "events";
import { type Writable } from "stream";

export const writeWithDrain = (stream: Writable) => {
  return async (chunk: any) => {
    const canWrite = stream.write(chunk);
    if (!canWrite) {
      await once(stream, "drain");
    }
  };
};
