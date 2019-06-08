const constants = require('../common/const');

function getStremioSeries(id, name, poster, genres, background, description, director, released, language, country, awards, website, releaseInfo, runtime, videos) {
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
        videos,
    };
}

const getstremioVideo = function (id,audio,released,season,episode,streams,title) {
    return {
        id: constants.ID_PREFIX + id,
        available: true,
        audio,
        season,
        episode,
        streams,
        released,
        title
    }
};

const getStremioStream = function (url, externalUrl, title) {
    return {
        url,
        externalUrl,
        title
    }
};

const getStremioMeta = function (meta, video) {
    return {
        meta,
        video,
    }
};

const getStreamioStreams = function(streams) {
    return {
        streams: streams
    }
};

module.exports = {
    getStremioSeries,
    getStremioMeta,
    getStremioStream,
    getstremioVideo,
    getStreamioStreams
};