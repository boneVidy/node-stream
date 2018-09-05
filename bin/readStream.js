"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const fs_1 = require("fs");
class ReadStream extends events_1.EventEmitter {
    constructor(path, options) {
        super();
        options = options || {};
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
    open() {
        fs_1.open(this.path, this.flags, this.mode, (err, fd) => {
            if (err) {
                this.emit("error");
                return;
            }
            this.fd = fd;
            this.emit("open");
        });
    }
    read(size) {
        if (typeof this.fd !== "number") {
            return this.once("open", () => {
                this.read(size);
            });
        }
        let bytesToRead = size ||
            (this.readEnd
                ? Math.min(this.readEnd - this.pos, this.highWaterMark)
                : this.highWaterMark);
        fs_1.read(this.fd, this.buffer, 0, bytesToRead, this.pos, (err, bytesRead, buffer) => {
            if (err) {
                return this.emit("error");
            }
            if (!bytesRead) {
                return this.emit("end");
            }
            this.pos += bytesRead;
            this.emit("data", this.encoding ? buffer.toString(this.encoding) : buffer);
            if (this.readEnd && this.pos > this.readEnd) {
                return this.emit("end");
            }
            if (this.flowing) {
                return this.read(size);
            }
        });
    }
    end() {
        if (this.autoClose)
            this.destroy();
    }
    /**
     * pause
     */
    pause() {
        this.flowing = false;
    }
    /**
     * resume
     */
    resume() {
        this.flowing = true;
        this.read();
    }
    destroy() {
        if (!this.fd) {
            return;
        }
        fs_1.close(this.fd, () => {
            this.emit("close");
        });
    }
    /**
     * pipe
     */
    pipe(dest) {
        this.on('data', (data) => {
            const flag = dest.write(data);
            if (!flag)
                this.pause();
        });
        dest.on('drain', () => {
            this.resume();
        });
        this.once('end', () => {
            this.destroy();
        });
    }
}
exports.ReadStream = ReadStream;
//# sourceMappingURL=readStream.js.map