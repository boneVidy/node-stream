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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "events", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var events_1 = require("events");
    var fs_1 = require("fs");
    var ReadStream = /** @class */ (function (_super) {
        __extends(ReadStream, _super);
        function ReadStream(path, options) {
            var _this = _super.call(this) || this;
            options = options || {};
            _this.path = path;
            _this.fd = options.fd;
            _this.encoding = options.encoding || "utf8";
            _this.highWaterMark = options.highWaterMark || 64 * 1024;
            _this.start = options.start || 0;
            _this.pos = _this.start;
            _this.readEnd = options.end;
            _this.mode = options.mode;
            _this.flowing = true;
            _this.autoClose = true;
            _this.buffer = Buffer.alloc(_this.highWaterMark);
            _this.length = 0;
            _this.flags = options.flags || "r";
            _this.on("newListener", function (type, listener) {
                if (type === "data") {
                    if (_this.flowing) {
                        _this.read();
                    }
                }
            });
            _this.open();
            return _this;
        }
        ReadStream.prototype.open = function () {
            var _this = this;
            fs_1.open(this.path, this.flags, this.mode, function (err, fd) {
                if (err) {
                    _this.emit("error");
                    return;
                }
                _this.fd = fd;
                _this.emit("open");
            });
        };
        ReadStream.prototype.read = function (size) {
            var _this = this;
            if (typeof this.fd !== "number") {
                return this.once("open", function () {
                    _this.read(size);
                });
            }
            var bytesToRead = size ||
                (this.readEnd
                    ? Math.min(this.readEnd - this.pos, this.highWaterMark)
                    : this.highWaterMark);
            fs_1.read(this.fd, this.buffer, 0, bytesToRead, this.pos, function (err, bytesRead, buffer) {
                if (err) {
                    return _this.emit("err");
                }
                if (!bytesRead) {
                    return _this.emit("end");
                }
                _this.pos += bytesRead;
                _this.emit("data", _this.encoding ? buffer.toString(_this.encoding) : buffer);
                if (_this.readEnd && _this.pos > _this.readEnd) {
                    return _this.emit("end");
                }
                if (_this.flowing) {
                    return _this.read(size);
                }
            });
        };
        ReadStream.prototype.end = function () {
            if (this.autoClose)
                this.destroy();
        };
        /**
         * pause
         */
        ReadStream.prototype.pause = function () {
            this.flowing = false;
        };
        /**
         * resume
         */
        ReadStream.prototype.resume = function () {
            this.flowing = true;
            this.read();
        };
        ReadStream.prototype.destroy = function () {
            var _this = this;
            if (!this.fd) {
                return;
            }
            fs_1.close(this.fd, function () {
                _this.emit("close");
            });
        };
        return ReadStream;
    }(events_1.EventEmitter));
    exports.ReadStream = ReadStream;
});
//# sourceMappingURL=readStream.js.map