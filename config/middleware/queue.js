const Queue = require('bull');

const redisConfig = {
    redis: { host: '172.17.98.9', port: 6379 }
};

const kendaraanQueue = new Queue('kendaraanQueue', redisConfig);

kendaraanQueue.getWaiting().then(data => console.log('Kendaraan Waiting:', data));
kendaraanQueue.getActive().then(data => console.log('Kendaraan Active:', data));
kendaraanQueue.getFailed().then(data => console.log('Kendaraan Failed:', data));

module.exports = { kendaraanQueue };
