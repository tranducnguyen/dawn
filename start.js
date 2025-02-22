const DawnService = require('./dawn.service');

(async () => {
    await DawnService.runWithList();
})();
