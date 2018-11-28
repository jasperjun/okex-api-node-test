const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-api-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-行情', function() {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', done);
    });

    //
    it('swap/ticker:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            // 处理返回异常信息
            if (data.indexOf('error') > -1 && data.indexOf('message') > -1 && data.indexOf('errorCode') > -1) {
                done(data);
            }
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/ticker:BTC-USD-SWAP') > -1) {
                console.log('subscribe success [swap/ticker:BTC-USD-SWAP]');
                isSubscribed = true;
            } else if (isSubscribed && data.indexOf('swap/ticker') > -1) {
                console.log(data);
                try {
                    const result = JSON.parse(data);
                    //
                    // {
                    // table: "swap/ticker",
                    // data: [{
                    //  "last": 6212.2,
                    //  "high_24h": 6239.3,
                    //  "low_24h": 6100.6,
                    //  "volume_24h": 457864,
                    //  "instrument_id": "BTC-USD-SWAP",
                    //  "timestamp": "2018-10-24T20:11:443Z"
                    // }]
                    //}
                    //
                    expect(result).to.have.property('table');
                    expect(result.table).to.equal('swap/ticker');
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.an.instanceof(Array);
                    expect(result.data.length).to.be.above(0);

                    const item = result.data[0];
                    // 合约名称
                    expect(item).to.have.property('instrument_id');
                    expect(item.instrument_id).to.be.equal('BTC-USD-SWAP');
                    expect(item.instrument_id).to.be.not.empty;
                    // 最新成交价
                    expect(item).to.have.property('last');
                    expect(item.last).to.be.a('string');
                    expect(item.last).to.be.not.empty;
                    // 24小时最高价
                    expect(item).to.have.property('high_24h');
                    expect(item.high_24h).to.be.a('string');
                    expect(item.high_24h).to.be.not.empty;
                    // 24小时最低价
                    expect(item).to.have.property('low_24h');
                    expect(item.low_24h).to.be.a('string');
                    expect(item.low_24h).to.be.not.empty;
                    // 24小时成交量
                    expect(item).to.have.property('volume_24h');
                    expect(item.volume_24h).to.be.a('string');
                    expect(item.volume_24h).to.be.not.empty;
                    // 系统时间戳
                    expect(item).to.have.property('timestamp');
                    expect(item.timestamp).to.be.equal('BTC-USD-SWAP');
                    expect(item.timestamp).to.be.not.empty;

                    done();
                } catch(e) {
                    done(e);
                } finally {
                    client.removeListener('message', listener);
                }

            }
        };

        client.on('message', listener);
        client.subscribe('swap/ticker:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', () => done());
        client.close();
    });
});
