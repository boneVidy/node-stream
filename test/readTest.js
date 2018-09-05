const {ReadStream} = require('../bin/readStream');


const rs = new ReadStream(__dirname + '/test.txt', {encoding: 'utf8', highWaterMark:3});


// rs.open();
// rs.read(3);



rs.once('data', () => {
    rs.pause();
    console.log('pause');

    setTimeout(() => {
        rs.on('data', console.log);
        rs.resume();
    }, 1000);
});

rs.on('end',console.log.bind(null, '\nend'));