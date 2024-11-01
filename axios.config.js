'use strict'
const axios = require('axios');
const instanceAxios = axios.create();
instanceAxios.interceptors.response.use(
    res => {
        return res;
    },
    res => {
        if (res.response && res.response.status && res.response.status < 500) {
            return res.response;
        }
        throw res;
    });
    
module.exports = instanceAxios;