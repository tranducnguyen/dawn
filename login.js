const DawnService = require('./dawn.service');
const {readFile, appendFile} = require('./FileHelper');    
require('dotenv').config();

(async () => {
    let listData = await readFile('./data.txt');
    let listFail = [];
    const password = process.env.PASSSWORD;
    for (let item of listData) {

        const [userName, token, proxy, extensionId] = item.split('|');
        const tokenLogin = await DawnService.DoLogin({
            proxy, userName, password, extensionId
        });
       
        if(tokenLogin){
            console.log(`Save token account: ${userName}`)
            await appendFile('./data_login.txt', `${userName}|${tokenLogin}|${proxy}|${extensionId}\n`);
        }else{
            console.log(`Login fail account: ${userName}`)
            listFail.push(item);
        }
    }

    await appendFile('./data_fail.txt', listFail.join('\n'));

    // const userName = 'tranducnguyenk37@gmail.com';
    // const proxy = '45.249.106.92:5789:bmacahrr:a8x7mfciy2yq';
    // const extensionId = 'fpdkjdnhkakefebpekbdhillbhonfjjp';
    // const token = await DawnService.DoLogin({
    //     proxy, userName, password, extensionId
    // });
    // await appendFile('./data_login.txt', `${userName}|${token}|${proxy}|${extensionId}`);
})();
