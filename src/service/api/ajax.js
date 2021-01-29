import axios from 'axios'

/* parmas
    {
        name: 'Jill',
        age: 27,
        sex: 'gal
    }
    get
    sadsda?name=Jill&age=27&sex=gal
*/
export default function ajax(url = '', params = {}, type = 'GET') {
    // 1. 变量 用来接收最终输出
    let promise;

    // 2. 返回一个promise
    return new Promise((resolve, reject)=>{  // resolve成功ajax reject失败ajax
        // 2.1 判断请求的类型
        if (type.toUpperCase() === 'GET') {
            // 2.2 拼接字符串
            let paramsStr = '';
            // 2.3 遍历 所有键放到数组里遍历
            Object.keys(params).forEach(key=>{
                paramsStr += key + '=' + params[key] + '&';
            });
            // 2.4 过滤最后的&
            if (paramsStr) {
                paramsStr = paramsStr.substr(0, paramsStr.lastIndexOf('&'));
            }
            // 2.5 拼接完整路径
            url += '?' + paramsStr;
            // 2.6 发起GET请求
            promise = axios.get(url);
        } else if (type.toUpperCase() === 'POST') {
            // 2.7 发起POST请求
            promise = axios.post(url, params);
        }
        // 2.8 处理结果并返回
        promise.then((response)=>{
            resolve(response.data);
        }).catch(error=>{
            reject(error);
        });
    });
}
