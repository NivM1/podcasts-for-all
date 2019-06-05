const stremioConvertor = require('../common/stremioConvertor');
const constatnts = require('../common/const');

const showToStremioSeries = function (show) {
    return stremioConvertor.getStremioSeries(
        constatnts.SPREAKER_ID_PREFIX + show.show_id,
        show.title,
        show.image_url,
        null,
        show.image_url,
        null,
        null,
        null,
        null,
        null,
        null,
        show.site_url);
};

const fullShowToFullStremioSeries = function (show) {


    return stremioConvertor.getStremioSeries(
        constatnts.SPREAKER_ID_PREFIX + show.show_id,
        show.title,
        show.image_url,
        null,
        show.image_url,
        show.description,
        null,
        null,
        show.language,
        null,
        null,
        show.site_url);
};

const getMetaForShow = function (show) {

    const fullStremioShow = fullShowToFullStremioSeries(show);
    const meta = stremioConvertor.getStremioMeta(fullStremioShow, null);

    return meta;

};

module.exports = {
    showToStremioSeries,
    getMetaForShow,
};