const {WriteStream} = require('../bin/writeStream');

const ws = new WriteStream(__dirname + '/test.txt', {encoding: 'utf8'});
// new Array(10).fill(1).forEach((i, index) => ws.write(index.toString()));

let i = 0;
function wr () {
    ws.write(i.toString(), 'utf8', () => {
        i ++;
    })
}

wr();
ws.on('drain', () => {
    if (i === 100) {
        return;
    }
    wr();
})
ws.on('drain', console.log.bind(null, '写入成功!'))