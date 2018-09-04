/// <reference types="node" />
import { PathLike } from 'fs';
import { EventEmitter } from 'events';
declare type Options = {
    flags?: string;
    encoding?: string;
    fd?: number;
    mode?: number;
    autoClose?: boolean;
    start?: number;
    end?: number;
    highWaterMark?: number;
};
export declare type WriteStreamOptions<T> = T extends undefined ? {} : T extends Object ? Options : string;
export declare class WriteStream<T extends Object | string> extends EventEmitter {
    private len;
    private pos;
    private encoding;
    private highwaterMark;
    private path;
    private start;
    private mode;
    private autoClose;
    private needDrain;
    private flags;
    private writing;
    private buffer;
    private fd;
    constructor(path: PathLike, options?: WriteStreamOptions<T>);
    write(chunk: string | Buffer | number, encoding?: string, callback?: () => void): boolean;
    private clearBuffer;
    private _write;
    open(): void;
    destroy(): any;
    close(): void;
}
export {};
//# sourceMappingURL=writeStream.d.ts.map