'use strict'

const instanceAxios = require('./axios.config');

const NGUYEN_ACCOUNT = {
    NAME: 'NGUYEN',
    USER_NAME: process.env.BRIGHT_USER_NAME,
    PASS_WORD: process.env.BRIGHT_PASSWORD,
    COUNTRY: 'vn',
    PORT: 33335,
    HOST: 'brd.superproxy.io'
}

class BridataService {
    constructor() {
        this.currentTargetIndex = 0;
    }

    static getProxy = async (country) => {
        // let session_id = Math.floor(Math.random() * 1000000000) | 0;
        const curAccount = this.getNextCircularItem();
        // console.log(`Proxy ${curAccount.NAME || ''}`)
        if (country) {
            country = `-country-${country}`;
        } else {
            if (curAccount.COUNTRY) {
                country = `-country-${curAccount.COUNTRY}`;
            } else {
                country = '';
            }
        }
        let login = curAccount.USER_NAME + country;
        let proxy = {
            protocol: 'https',
            host: curAccount.HOST,
            port: curAccount.PORT,
            auth: {
                username: login,
                password: curAccount.PASS_WORD
            }
        }
        return proxy;
    }
    static getAllProxy = async () => {
        const curAccount = this.getNextCircularItem();
        let login = curAccount.USER_NAME;
        let proxy = {
            protocol: 'https',
            host: curAccount.HOST,
            port: curAccount.PORT,
            auth: {
                username: login,
                password: curAccount.PASS_WORD
            }
        }
        return proxy;
    }
    static getNextCircularItem = () => {
        return NGUYEN_ACCOUNT;
    }

    static getProxyHttp = async (country) => {
        let session_id = Math.floor(Math.random() * 1000000000) | 0;

        if (country) {
            country = `-country-${country}`;
        } else {
            if (INFO.COUNTRY) {
                country = `-country-${INFO.COUNTRY}`;
            } else {
                country = '';
            }
        }
        let login = INFO.USER_NAME + country + "-session-" + session_id;
        let proxy = {
            protocol: 'http:',
            host: INFO_PYPROXY.HOST,
            port: INFO_PYPROXY.PORT,
            username: INFO_PYPROXY.USER_NAME,
            password: INFO_PYPROXY.PASS_WORD,
            auth: `${INFO_PYPROXY.USER_NAME}:${INFO_PYPROXY.PASS_WORD}`
        }
        return proxy;
    }

    static AddIP = async (ip) => {
        try {
            const curAccount = this.getNextCircularItem();
            let body = {
                "zone": "datacenter_proxy1",
                "ip": ip
            };

            let config = {
                headers: {
                    'Authorization': `Bearer ${curAccount.API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            };

            const resp = await instanceAxios.post('https://api.brightdata.com/zone/whitelist', body, config)
            return resp.status.toString();
        } catch (err) {
            return err.message;
        }
    }


}

module.exports = BridataService;