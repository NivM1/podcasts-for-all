const logzioLogger = require('logzio-nodejs').createLogger({
    token: process.env.LOGGER_TOKEN,
    host: process.env.LOGGER_HOST,
    supressErrors: process.env.LOGGER_SUPRESS_ERRORS,
    debug: process.env.LOGGER_INCLUDE_DEBUG
});

const log4js = require('log4js');
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: process.env.LOG_LEVEL
        }
    }
});
const log4jslogger = log4js.getLogger("default");


function log(msg, handler, catalog, genre, count, item) {
    log4jslogger.log(msg);
    logzioLogger.log({
        message: msg,
        level: 'debug',
        handler: handler,
        catalog: catalog,
        genre: genre,
        count: count,
        item: item
    });
}

function debugLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.debug(msg);
    logzioLogger.log({
        message: msg,
        level: 'debug',
        handler: handler,
        catalog: catalog,
        genre: genre,
        count: count,
        item: item
    });
}

function infoLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.info(msg);
    logzioLogger.log({
        message: msg,
        level: 'info',
        handler: handler,
        catalog: catalog,
        genre: genre,
        count: count,
        item: item
    });
}

function errorLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.info(msg);
    logzioLogger.log({
        message: msg,
        level: 'error',
        handler: handler,
        catalog: catalog,
        genre: genre,
        count: count,
        item: item
    });
}

module.exports = {
    debug: debugLog,
    info: infoLog,
    error: errorLog
};