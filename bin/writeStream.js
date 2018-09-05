var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "events"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs_1 = __importDefault(require("fs"));
    var events_1 = require("events");
    var WriteStream = /** @class */ (function (_super) {
        __extends(WriteStream, _super);
        function WriteStream(path, options) {
            var _this = _super.call(this) || this;
            _this.len = 0;
            _this.pos = 0;
            _this.encoding = "utf8";
            _this.start = 0;
            _this.autoClose = true;
            _this.flags = "w";
            _this.buffer = [];
            _this.path = path;
            options = options || {};
            _this.flags = options.flags || "w";
            _this.mode = options.mode || 438;
            _this.highwaterMark = options.highWaterMark || 16 * 1024;
            _this.start = options.start || 0;
            _this.encoding = options.encoding || "utf8";
            _this.autoClose = options.autoClose || true;
            _this.needDrain = false;
            _this.writing = false;
            _this.buffer = [];
            _this.pos = _this.start;
            _this.len = 0;
            _this.open();
            return _this;
        }
        WriteStream.prototype.write = function (chunk, encoding, callback) {
            var _this = this;
            if (encoding === void 0) { encoding = this.encoding; }
            if (callback === void 0) { callback = function () { }; }
            chunk = Buffer.isBuffer(chunk)
                ? chunk
                : typeof chunk === "string"
                    ? Buffer.from(chunk)
                    : Buffer.from([chunk]);
            this.len += chunk.length;
            this.needDrain = this.highwaterMark <= this.len;
            if (this.writing) {
                this.buffer.push({
                    chunk: chunk,
                    encoding: encoding,
                    callback: callback
                });
            }
            else {
                this.writing = true;
                this._write(chunk, encoding, function () {
                    callback();
                    _this.clearBuffer();
                });
            }
            return !this.needDrain;
        };
        WriteStream.prototype.clearBuffer = function () {
            var _this = this;
            var buf = this.buffer.shift();
            if (buf) {
                this._write(buf.chunk, buf.encoding, function () {
                    buf.callback();
                    _this.clearBuffer();
                });
            }
            else {
                this.writing = false;
                this.needDrain = false;
                this.emit("drain");
            }
        };
        WriteStream.prototype._write = function (chunk, encoding, callback) {
            var _this = this;
            if (typeof this.fd !== "number") {
                return this.once("open", function () {
                    _this._write(chunk, encoding, callback);
                });
            }
            fs_1.default.write(this.fd, chunk, 0, chunk.length, this.pos, function (err, bytesWritter) {
                if (err) {
                    console.error(err);
                }
                console.log(chunk.toString());
                _this.pos += bytesWritter;
                _this.len -= bytesWritter;
                callback();
                // this.buffer.shift();
            });
        };
        WriteStream.prototype.open = function () {
            var _this = this;
            fs_1.default.open(this.path, this.flags, this.mode, function (err, fd) {
                if (err) {
                    _this.emit("error");
                    _this.destroy();
                    return;
                }
                _this.fd = fd;
                _this.emit("open");
            });
        };
        WriteStream.prototype.destroy = function () {
            if (typeof this.fd !== "number") {
                this.close();
            }
        };
        WriteStream.prototype.end = function () {
            if (this.autoClose) {
                this.close();
            }
        };
        WriteStream.prototype.close = function () {
            var _this = this;
            fs_1.default.close(this.fd, function (err) {
                _this.emit("close");
            });
        };
        return WriteStream;
    }(events_1.EventEmitter));
    exports.WriteStream = WriteStream;
});
//# sourceMappingURL=writeStream.js.map