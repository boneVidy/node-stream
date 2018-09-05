import { EventEmitter } from "events";
import { PathLike, open, read, close } from "fs";
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
export type ReadStreamOptions<T> = T extends undefined
  ? {}
  : T extends Object ? Options : string;
export class ReadStream<T extends Object | string> extends EventEmitter {
  private path: PathLike;
  private fd: number | undefined;
  private encoding: string;
  private highWaterMark: number;
  private start: number;
  private pos: number;
  private readEnd: number | undefined;
  private flowing: boolean;
  private autoClose: boolean;
  private buffer: Buffer;
  private length: number;
  private flags: string;
  // private isReading = false;
  mode: any;
  constructor(path: PathLike, options?: ReadStreamOptions<T>) {
    super();
    options = options || <ReadStreamOptions<T>>{};
    this.path = path;
    this.fd = options.fd;
    this.encoding = options.encoding || "utf8";
    this.highWaterMark = options.highWaterMark || 64 * 1024;
    this.start = options.start || 0;
    this.pos = this.start;
    this.readEnd = options.end;
    this.mode = options.mode;
    this.flowing = true;
    this.autoClose = true;
    this.buffer = Buffer.alloc(this.highWaterMark);
    this.length = 0;
    this.flags = options.flags || "r";

    this.on("newListener", (type, listener) => {
      if (type === "data") {
        if (this.flowing) {
          // this.isReading = true;
          this.read();
        }
      }
    });
    this.open();
  }
  public open(): void {
    open(this.path, this.flags, this.mode, (err, fd) => {
      if (err) {
        this.emit("error");
        return;
      }
      this.fd = fd;
      this.emit("open");
    });
  }

  public read(size?: number) {
    if (typeof this.fd !== "number") {
      return this.once("open", () => {
        this.read(size);
      });
    }

    let bytesToRead =
      size ||
      (this.readEnd
        ? Math.min(this.readEnd - this.pos, this.highWaterMark)
        : this.highWaterMark);
    read(
      this.fd,
      this.buffer,
      0,
      bytesToRead,
      this.pos,
      (err, bytesRead, buffer) => {
        if (err) {
          return this.emit("err");
        }
        if (!bytesRead) {
          return this.emit("end");
        }
        this.pos += bytesRead;
        this.emit(
          "data",
          this.encoding ? buffer.toString(this.encoding) : buffer
        );
        if (this.readEnd && this.pos > this.readEnd) {
          return this.emit("end");
        }
        if (this.flowing) {
          return this.read(size);
        }
      }
    );
  }
  public end() {
    if (this.autoClose) this.destroy();
  }
  /**
   * pause
   */
  public pause() {
    this.flowing = false;
  }
  /**
   * resume
   */
  public resume() {
    this.flowing = true;
    this.read();
  }
  public destroy() {
    if (!this.fd) {
      return;
    }
    close(this.fd, () => {
      this.emit("close");
    });
  }
}
