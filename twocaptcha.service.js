const axiosInstance = require('./axios.config');
const { handleAxiosErr } = require('./handle.Error');


class TwoCaptcha {
    constructor(apiKey, baseUrl) {
        if (!apiKey) {
            throw new Error('apiKey is required');
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl || 'https://api.2captcha.com';
    }

    getBodyImageBuilder(base64Image) {
        return {
            clientKey: this.apiKey,
            softId: 4706,
            task: {
                type: "ImageToTextTask",
                phrase: false,
                case: true,
                numeric: 4,
                math: false,
                minLength: 6,
                maxLength: 6,
                comment: "Pay special attention to the letters and signs.",
                body: base64Image
            }
        };
    }

    async SolveImageToTextTask(base64Image) {
        const body = this.getBodyImageBuilder(base64Image);
        const taskData = await this.createTask(body);
        console.log('Sovling captcha...', taskData);
        if (taskData.errorId !== 0) {
            return {
                code: 1,
                message: taskData.errorDescription,
                result: ''
            }
        }

        let result = {
            code: -1,
            message: '',
            result: ''
        }
        let counTime = 30;
        console.clear();
        console.log('Sovling captcha...', taskData.taskId);
        while (counTime > 0) {
            const taskResult = await this.getTaskResult(taskData.taskId);
            if (taskResult.errorId === 0) {
                console.clear();
                console.log('taskResult', taskResult);
                if (taskResult.status === 'ready') {
                    result.code = 0;
                    result.message = 'Success';
                    result.result = taskResult.solution.text;
                    break;
                }
            } else {
                result.message = taskResult.errorDescription;
                result.code = 1;
                console.log(taskResult);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            counTime--;
        }

        return result;
    }

    async createTask(body) {
        const config = {
            headers: {
                "accept": "application/json, text/plain, */*",
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; Mi A3 Build/RKQ1.200903.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36'
            }
        };

        const response = await axiosInstance.post(`${this.baseUrl}/createTask`, body, config);
        return response.data;
    }

    async getTaskResult(taskId) {
        const body = {
            clientKey: this.apiKey,
            taskId: taskId
        }

        const config = {
            headers: {
                "accept": "application/json, text/plain, */*",
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; Mi A3 Build/RKQ1.200903.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36'
            }
        };

        const response = await axiosInstance.post(`${this.baseUrl}/getTaskResult`, body, config);
        return response.data;
    }

}

module.exports = {
    TwoCaptcha
};