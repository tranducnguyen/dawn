const DawnService = require('./dawn.service');
const { readFile, appendFile } = require('./FileHelper');
require('dotenv').config();

(async () => {
    let listData = await readFile('./data.txt');
    let listFail = [];
    const passwordDefault = process.env.PASSSWORD;
    for (let item of listData) {

        const [userName, token, proxy, extensionId, password] = item.split('|');
        if (!password) {
            password = passwordDefault;
        }

        const tokenLogin = await DawnService.DoLogin({
            proxy, userName, password, extensionId
        });

        if (tokenLogin) {
            console.log(`Save token account: ${userName}`)
            await appendFile('./data_login.txt', `${userName}|${tokenLogin}|${proxy}|${extensionId}\n`);
        } else {
            console.log(`Login fail account: ${userName}`)
            listFail.push(item);
        }
    }

    await appendFile('./data_fail.txt', listFail.join('\n'));
})();
