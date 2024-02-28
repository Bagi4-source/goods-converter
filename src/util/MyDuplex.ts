import { Duplex } from "stream";

export class MyDuplex extends Duplex {
  _write(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }

  _read(size) {
    // Пустая реализация, так как у нас нет необходимости читать данные
  }
}
