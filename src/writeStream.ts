import fs, { PathLike } from "fs";
import { EventEmitter } from "events";
type Options = {
  flags?: string;
  encoding?: string;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  start?: number;
  end?: number;
  highWaterMark?: number;
};
export type WriteStreamOptions<T> = T extends undefined
  ? {}
  : T extends Object ? Options : string;
type Cache = {
  chunk: Buffer;
  encoding: string;
  callback: Function;
};
export class WriteStream<T extends Object | string> extends EventEmitter {
  private len = 0;
  private pos = 0;
  private encoding = "utf8";
  private highwaterMark: number;
  private path: PathLike;
  private start = 0;
  private mode: number;
  private autoClose = true;
  private needDrain: boolean;
  private flags = "w";
  private writing: boolean;
  private buffer: Cache[] = [];
  // @ts-ignore
  private fd: number;

  constructor(path: PathLike, options?: WriteStreamOptions<T>) {
    super();
    this.path = path;
    options = options || <WriteStreamOptions<T>>{};
    this.flags = options.flags || "w";
    this.mode = options.mode || 0o666;
    this.highwaterMark = options.highWaterMark || 16 * 1024;
    this.start = options.start || 0;
    this.encoding = options.encoding || "utf8";
    this.autoClose = options.autoClose || true;
    this.needDrain = false;
    this.writing = false;
    this.buffer = [];
    this.pos = this.start;
    this.len = 0;
    this.open();
  }
  public write(
    chunk: string | Buffer | number,
    encoding = this.encoding,
    callback = () => {}
  ) {
    chunk = Buffer.isBuffer(chunk)
      ? chunk
      : typeof chunk === "string"
        ? Buffer.from(chunk)
        : Buffer.from([chunk]);

    this.len += chunk.length;
    this.needDrain = this.highwaterMark <= this.len;
    if (this.writing) {
      this.buffer.push({
        chunk,
        encoding,
        callback
      });
    } else {
      this.writing = true;
      this._write(chunk, encoding, () => {
        callback();
        this.clearBuffer();
      });
    }

    return !this.needDrain;
  }
  private clearBuffer(): void {
    let buf = this.buffer.shift();
    if (buf) {
      this._write(buf.chunk, buf.encoding, () => {
        buf!.callback();
        this.clearBuffer();
      });
    } else {
      this.writing = false;
      this.needDrain = false;
      this.emit("drain");
    }
  }
  private _write(chunk: Buffer, encoding: string, callback: () => void): any {
    if (typeof this.fd !== "number") {
      return this.once("open", () => {
        this._write(chunk, encoding, callback);
      });
    }
    fs.write(this.fd, chunk, 0, chunk.length, this.pos, (err, bytesWritter) => {
      if (err) {
        console.error(err);
      }
      console.log(chunk.toString());
      this.pos += bytesWritter;
      this.len -= bytesWritter;
      callback();
      // this.buffer.shift();
    });
  }
  public open(): void {
    fs.open(this.path, this.flags, this.mode, (err, fd) => {
      if (err) {
        this.emit("error");
        this.destroy();
        return;
      }
      this.fd = fd;
      this.emit("open");
    });
  }
  public destroy(): any {
    if (typeof this.fd !== "number") {
      this.close();
    }
  }
  public end() {
    if (this.autoClose) {
      this.close();
    }
  }
  public close(): void {
    fs.close(this.fd, err => {
      this.emit("close");
    });
  }
}
