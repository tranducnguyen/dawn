const https = require('https');
const agentHttps = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const { HttpsProxyAgent } = require('https-proxy-agent');

class ProfileHelper {

    static convertProxy = async (proxy) => {
        const [host, port, username, password] = proxy.split(':');
        return `http://${username}:${password}@${host}:${port}`;
    }

    static parseProxy = async (proxy) => {
        if (proxy) {
            if (proxy.includes("http")) {
                return new HttpsProxyAgent(proxy);
            } else {
                return new HttpsProxyAgent(await this.convertProxy(proxy));
            }
        } else {
            return agentHttps;
        }
    }
}

module.exports = ProfileHelper;