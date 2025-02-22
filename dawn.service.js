require('dotenv').config();
const ProfileHelper = require('./Profile.Hepler');
const axiosInstance = require('./axios.config');
const { handleAxiosErr } = require('./handle.Error');
const axiosRetry = require('axios-retry').default;
const { readFile } = require('./FileHelper.js');
const { TwoCaptcha } = require('./twocaptcha.service');
const BridataService = require('./bridata.service.js');
const https = require('https');
const agentHttps = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
const TIME_DELAY = 2 * 60 * 1000;
const VERSION_APP = '1.1.3';
const APP_ID = '67b1867d2da4e694f1c8327b'
const EXTENSION_ID = 'fpdkjdnhkakefebpekbdhillbhonfjjp';
axiosRetry(axiosInstance, {
    retries: 3,
    retryCondition: (error) => {
        // Retry only if the status code is 502
        return error.response && (error.response.status === 502 || error.response.status === 500)
    },
    retryDelay: (retryCount) => {
        return retryCount * 1000; // Delay between retries (in ms), e.g., 1st retry after 1s, 2nd after 2s
    }

});
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const captchaSolver = new TwoCaptcha(process.env.CAPTCHA_API);
class DawnService {
    static runWithList = async () => {
        let listData = await readFile('./data.txt');
        for (let item of listData) {
            const [userName, token, proxy, extensionid] = item.split('|');
            this.runWithTime({ proxy, token, timeRun: TIME_DELAY, userName, extensionid })
        }
    }

    static KeepAlive = async ({ proxy, token, userName, extensionid }) => {
        try {
            const body = { "username": userName, "extensionid": extensionid ?? EXTENSION_ID, "numberoftabs": 0, "_v": VERSION_APP };
            let config = {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'origin': `chrome-extension://${extensionid ?? EXTENSION_ID}`,
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Authorization': `Berear ${token}`
                },
                httpsAgent: await ProfileHelper.parseProxy(proxy),
                proxy: false
            };

            const resp = await axiosInstance.post(`https://www.aeropres.in/chromeapi/dawn/v1/userreward/keepalive?appid=${APP_ID}`, body, config);
            return {
                code: 200,
                metadata: resp.data
            }
        } catch (error) {
            return handleAxiosErr(error);
        }
    }

    static CheckPoint = async ({ proxy, token, extensionid }) => {
        const data = await this.GetPoint({ proxy, token, extensionid });
        if (data.code !== 200) {
            return;
        }
        const points = await this.HandlePoint(data.metadata);
        return points;
    }

    static HandlePoint = async (metadata) => {
        let points = Number(metadata.data?.rewardPoint?.points);
        let registerpoints = Number(metadata.data?.rewardPoint?.registerpoints);
        let signinpoints = Number(metadata.data?.rewardPoint?.signinpoints);
        let commission = Number(metadata.data?.referralPoint == null ? 0 : metadata.data?.referralPoint.commission);

        let twitter_x_id_points = Number(metadata.data?.rewardPoint?.twitter_x_id_points);

        let discordid_points = Number(metadata.data?.rewardPoint?.discordid_points);

        let telegramid_points = Number(metadata.data?.rewardPoint?.telegramid_points);


        return (points + registerpoints + signinpoints + commission + twitter_x_id_points + discordid_points + telegramid_points).toLocaleString("en", { useGrouping: true }) + " " +
            'pts';
    }


    static GetPoint = async ({ proxy, token, extensionid }) => {
        try {

            let config = {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'origin': `chrome-extension://${extensionid ?? EXTENSION_ID}`,
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    'Authorization': `Berear ${token}`
                },
                httpsAgent: await ProfileHelper.parseProxy(proxy),
            };

            const resp = await axiosInstance.get(`https://www.aeropres.in/api/atom/v1/userreferral/getpoint?appid=${APP_ID}`, config);
            return {
                code: 200,
                metadata: resp.data
            }
        } catch (error) {
            return handleAxiosErr(error);
        }
    }
    static RunAndCheck = async ({ proxy, token, userName, extensionid }) => {
        try {
            const data = await DawnService.KeepAlive({ proxy, token, userName, extensionid });
            if (data.code === 200) {
                console.log(`${userName} ${data.metadata?.message}`);
            }

            const points = await this.CheckPoint({ proxy, token, extensionid });
            console.log(`${userName}: ${points}`)
        } catch (error) {
            console.log(`${userName}: ${error.message}`)
        }
    }

    static runWithTime = ({ proxy, token, userName, extensionid, timeRun }) => {
        setImmediate(async () => {
            await this.RunAndCheck({ proxy, token, userName, extensionid })
        });

        setInterval(async () => {
            await this.RunAndCheck({ proxy, token, userName, extensionid })
        }, timeRun || TIME_DELAY)
    }

    static generateRandomIPv4() {
        return Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * 256))
            .join('.');
    }

    static async getAppId() {
        const headers = { 'User-Agent': this.userAgent };
        const response = await this.sendRequest({
            apiType: 'DASHBOARD',
            method: '/v1/appid/getappid',
            requestType: 'GET',
            params: { app_v: '1.1.7' },
            headers,
        });
        return response.data.appid;
    }

    static async register(captchaToken) {
        const jsonData = {
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            email: this.accountData.email,
            country: faker.address.countryCode(),
            password: this.accountData.password,
            referralCode: this.accountData.referralCode || "",
            token: captchaToken,
            isMarketing: false,
            browserName: 'chrome'
        };

        return this.sendRequest({
            apiType: 'DASHBOARD',
            method: '/v2/dashboard/user/validate-register',
            jsonData,
            params: { appid: this.accountData.appid },
        });
    }

    static async login({ puzzleId, answer, email, password, extensionid, proxy }) {


        try {

            const jsonData = {
                username: email,
                password: password,
                logindata: {
                    _v: { version: VERSION_APP },
                    datetime: new Date().toISOString(),
                },
                puzzle_id: puzzleId,
                ans: answer,
                appid: APP_ID,
            };

            let config = {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'origin': `chrome-extension://${extensionid ?? EXTENSION_ID}`,
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                },
                proxy: await BridataService.getProxy(),
                httpsAgent: agentHttps
            };

            const resp = await axiosInstance.post(`https://www.aeropres.in/chromeapi/dawn/v1/user/login/v2?appid=${APP_ID}`, jsonData, config);
            return {
                code: 200,
                metadata: resp.data
            }
            //puzzle_id
        } catch (error) {
            return handleAxiosErr(error);
        }
    }

    static async getPuzzleId({ extensionid, proxy }) {
        try {
            let config = {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    // 'origin': `chrome-extension://${extensionid ?? EXTENSION_ID}`,
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                },
                proxy: await BridataService.getProxy(),
                httpsAgent: agentHttps
            };

            const resp = await axiosInstance.get(`https://www.aeropres.in/chromeapi/dawn/v1/puzzle/get-puzzle?appid=${APP_ID}`, config);
            return {
                code: 200,
                metadata: resp.data
            }
            //puzzle_id
        } catch (error) {
            return handleAxiosErr(error);
        }
    }

    static async getPuzzleImage({ extensionId, puzzleId, proxy }) {
        try {
            let config = {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    // 'origin': `chrome-extension://${extensionId ?? EXTENSION_ID}`,
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                },
                proxy: await BridataService.getProxy(),
                httpsAgent: agentHttps
            };

            const resp = await axiosInstance.get(`https://www.aeropres.in/chromeapi/dawn/v1/puzzle/get-puzzle-image?appid=${APP_ID}&puzzle_id=${puzzleId}`, config);
            return {
                code: 200,
                metadata: resp.data
            }
            //puzzle_id
        } catch (error) {
            return handleAxiosErr(error);
        }
    }

    static async DoLogin({ proxy, userName, password, extensionId }) {
        console.log("DoLogin", userName);
        const puzzleData = await this.getPuzzleId({ extensionId, proxy });
        let puzzleId = '';
        if (!puzzleData.metadata || !puzzleData.metadata.puzzle_id) {
            console.log("No puzzle id found");
            return null;
        }
        console.log("Puzzle Id found", puzzleData.metadata.puzzle_id);
        puzzleId = puzzleData.metadata.puzzle_id;

        const puzzleImage = await this.getPuzzleImage({ extensionId, puzzleId, proxy });
        if (!puzzleImage.metadata || !puzzleImage.metadata.imgBase64) {
            console.log("Puzzle Image not found");
            return null;
        }
        let image = puzzleImage.metadata.imgBase64;

        const answer = await captchaSolver.SolveImageToTextTask(image);
        if (answer.code !== 0) {
            console.log("Failed to solve captcha");
            return null;
        }

        const loginData = await this.login({ puzzleId, answer: answer.result, email: userName, password, extensionId, proxy });
        if (loginData.metadata?.data?.token) {
            return loginData.metadata.data.token;
        }
        return null;
    }
}


module.exports = DawnService;


