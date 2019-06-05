const constants = require('../common/const');

function getStremioSeries(id, name, poster, genres, background, description, director, released, language, country, awards, website, releaseInfo, runtime) {
    return {
        id: constants.ID_PREFIX + id,
        type: "series",
        name,
        poster,
        genres,
        posterShape: "regular",
        background,
        logo: constants.ADDON_LOGO,
        description,
        director,
        released,
        runtime,
        releaseInfo,
        inTheaters: true,
        language,
        country,
        awards,
        website,
    };
}

const getStremioMeta = function(meta, videos) {
    return {
        meta,
        videos,
    }
};

module.exports = {
    getStremioSeries,
    getStremioMeta,
};