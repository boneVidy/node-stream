const {ReadStream} = require('../bin/readStream');
const {WriteStream} = require('../bin/writeStream');



const rs = new ReadStream(__dirname + '/test.txt', {encoding: 'utf8', highWaterMark:3});
const ws = new WriteStream(__dirname+ '/test.copy.txt',{encoding: 'utf8', highWaterMark:3});

rs.pipe(ws);
