import * as urltil from 'url';
import * as https from 'https';
import * as fs from 'fs';
export class HttpKit {
    /**
     * 用于处理 https Get请求方法
     * @param {String} url 请求地址 
     */
    public static async httpGet(url: string) {
        return new Promise(function (resolve, reject) {
            https.get(url, function (res) {
                let buffer: Array<any> = [], result = "";
                //监听 data 事件
                res.on('data', function (data) {
                    buffer.push(data);
                });
                //监听 数据传输完成事件
                res.on('end', function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    //将最后结果返回
                    resolve(result);
                });
            }).on('error', function (err) {
                reject(err);
            });
        });
    }
    /**
     * 用于处理 https Post请求方法
     * @param {String} url  请求地址
     * @param {JSON} data 提交的数据
     */
    public static async httpPost(url: string, data: string) {
        return new Promise(function (resolve, reject) {
            //解析 url 地址
            let urlData = urltil.parse(url);
            //设置 https.request  options 传入的参数对象
            let options = {
                //目标主机地址
                hostname: urlData.hostname,
                //目标地址 
                path: urlData.path,
                //请求方法
                method: 'POST',
                //头部协议
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(data, 'utf-8')
                }
            };
            let req = https.request(options, function (res) {
                let buffer: Uint8Array[] = [], result = '';
                //用于监听 data 事件 接收数据
                res.on('data', function (data) {
                    buffer.push(data);
                });
                //用于监听 end 事件 完成数据的接收
                res.on('end', function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                })
            })
                //监听错误事件
                .on('error', function (err) {
                    console.log(err);
                    reject(err);
                });
            //传入数据
            req.write(data);
            req.end();
        });
    }

    public static async upload(url: string, data: string, filePath: string) {
        let boundaryKey = new Date().getTime();
        return new Promise(function (resolve, reject) {
            //解析 url 地址
            let urlData = urltil.parse(url);
            //设置 https.request  options 传入的参数对象
            let options = {
                //目标主机地址
                hostname: urlData.hostname,
                //目标地址 
                path: urlData.path,
                //请求方法
                method: 'POST',
                //头部协议
                headers: {
                    'Content-Type': 'multipart/form-data;boundary=' + boundaryKey,
                }
            };
            let req = https.request(options, function (res) {
                let buffer: Uint8Array[] = [], result = '';
                //用于监听 data 事件 接收数据
                res.on('data', function (data) {
                    buffer.push(data);
                });
                //用于监听 end 事件 完成数据的接收
                res.on('end', function () {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                })
            })
                //监听错误事件
                .on('error', function (err) {
                    console.log(err);
                    reject(err);
                });
            //传入数据
            var payload = '\r\n------' + boundaryKey + '\r\n' +
                'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n' +
                'Content-Type: image/jpg\r\n\r\n';

            var enddata = '\r\n------' + boundaryKey + '--';

            req.setHeader('Content-Length', Buffer.byteLength(payload) + Buffer.byteLength(enddata) + fs.statSync(filePath).size);
            req.write(payload);

            var fileStream = fs.createReadStream(filePath);
            fileStream.pipe(req, { end: false });
            fileStream.on('end', function () {
                req.end(enddata);
            });
            req.write(data);
        });
    }
}