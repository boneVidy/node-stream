/// <reference types="node" />
import { EventEmitter } from "events";
import { PathLike } from "fs";
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
export declare type ReadStreamOptions<T> = T extends undefined ? {} : T extends Object ? Options : string;
export declare class ReadStream<T extends Object | string> extends EventEmitter {
    private path;
    private fd;
    private encoding;
    private highWaterMark;
    private start;
    private pos;
    private readEnd;
    private flowing;
    private autoClose;
    private buffer;
    private length;
    private flags;
    mode: any;
    constructor(path: PathLike, options?: ReadStreamOptions<T>);
    open(): void;
    read(size?: number): this | undefined;
    end(): void;
    /**
     * pause
     */
    pause(): void;
    /**
     * resume
     */
    resume(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=readStream.d.ts.map