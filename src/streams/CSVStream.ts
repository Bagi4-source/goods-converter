import { PassThrough } from "stream";

export interface CSVStreamOptions {
  delimiter?: string;
  emptyFieldValue?: string;
  lineSeparator?: string;
}

export class CSVStream {
  private readonly stream: PassThrough = new PassThrough();
  private readonly delimiter: string = ";";
  private readonly lineSeparator: string = "\n";
  private readonly emptyFieldValue: string = "";
  private columns = new Set<string>();

  constructor({ delimiter, lineSeparator, emptyFieldValue }: CSVStreamOptions) {
    if (delimiter !== undefined) this.delimiter = delimiter;
    if (lineSeparator !== undefined) this.lineSeparator = lineSeparator;
    if (emptyFieldValue !== undefined) this.emptyFieldValue = emptyFieldValue;
  }

  getWritableStream() {
    return this.stream;
  }

  setColumns(columns: Set<string>) {
    this.columns = columns;
    this.stream.write(
      Array.from(this.columns).join(this.delimiter) + this.lineSeparator,
    );
  }

  addRow(items: Record<string, any>) {
    this.stream.write(
      Array.from(this.columns)
        .map((key) =>
          items[key] === undefined ? this.emptyFieldValue : items[key] + "",
        )
        .join(this.delimiter) + this.lineSeparator,
    );
  }
}
