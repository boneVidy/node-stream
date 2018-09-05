"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const events_1 = require("events");
class WriteStream extends events_1.EventEmitter {
    constructor(path, options) {
        super();
        this.len = 0;
        this.pos = 0;
        this.encoding = "utf8";
        this.start = 0;
        this.autoClose = true;
        this.flags = "w";
        this.buffer = [];
        this.path = path;
        options = options || {};
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
    write(chunk, encoding = this.encoding, callback = () => { }) {
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
        }
        else {
            this.writing = true;
            this._write(chunk, encoding, () => {
                callback();
                this.clearBuffer();
            });
        }
        return !this.needDrain;
    }
    clearBuffer() {
        let buf = this.buffer.shift();
        if (buf) {
            this._write(buf.chunk, buf.encoding, () => {
                buf.callback();
                this.clearBuffer();
            });
        }
        else {
            this.writing = false;
            this.needDrain = false;
            this.emit("drain");
        }
    }
    _write(chunk, encoding, callback) {
        if (typeof this.fd !== "number") {
            return this.once("open", () => {
                this._write(chunk, encoding, callback);
            });
        }
        fs_1.default.write(this.fd, chunk, 0, chunk.length, this.pos, (err, bytesWritter) => {
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
    open() {
        fs_1.default.open(this.path, this.flags, this.mode, (err, fd) => {
            if (err) {
                this.emit("error");
                this.destroy();
                return;
            }
            this.fd = fd;
            this.emit("open");
        });
    }
    destroy() {
        if (typeof this.fd !== "number") {
            this.close();
        }
    }
    end() {
        if (this.autoClose) {
            this.close();
        }
    }
    close() {
        fs_1.default.close(this.fd, err => {
            this.emit("close");
        });
    }
}
exports.WriteStream = WriteStream;
//# sourceMappingURL=writeStream.js.map