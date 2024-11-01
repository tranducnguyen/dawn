'use strict'

const handleErrAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            const modifiedError = err;
            if (err.code === 'EHOSTUNREACH') {
                modifiedError.message = 'Unable to reach the host. Please check your network connectivity.';
            }
            else if (err.message.includes('Error during decryption (probably incorrect key)')) {
                modifiedError.message = 'PrivateKey cung cấp không đúng';
                modifiedError.status = 400;
            }
            else {
                console.log(err.stack);
            }
            next(modifiedError);
        });
    };
}

const handleAxiosErr = (error) => {
    let ip;
    if (error.headers && error.headers['x-luminati-ip']) {
        ip = error.headers['x-luminati-ip'];
    }

    if (error.response) {
        if (error.response.statusText) {
            console.log(`${error.message} => ${error.response.statusText} ${ip || ''}`)
            return {
                code: 500,
                metadata: error.response.statusText
            }
        }
        console.log(`${error.message || 'Không thế xác định lỗi'} => ${error.stack || ''}`);
        if (error.response.data) {
            console.log(error.response.data)
        }
    }

    if (error.code && error.code === 'ECONNABORTED') {
        return {
            code: 500,
            metadata: 'Time out'
        }
    }

    console.log(`${error.message || 'Không thế xác định lỗi'} => ${error.stack || ''}`);
    return {
        code: 500,
        metadata: 'Server Error'
    }
}


module.exports = {
    handleErrAsync,
    handleAxiosErr
}
