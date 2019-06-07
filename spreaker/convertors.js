const stremioConvertor = require('../common/stremioConvertor');
const constatnts = require('../common/const');

const showToStremioSeries = function (show) {
    return stremioConvertor.getStremioSeries(
        constatnts.SPREAKER_ID_PREFIX + show.show_id,
        show.title,
        show.image_original_url,
        null,
        show.image_original_url,
        null,
        null,
        null,
        null,
        null,
        null,
        show.site_url);
};

function episodeToStremioVideo(episode, i) {
    return stremioConvertor.getstremioVideo(
        constatnts.SPREAKER_ID_PREFIX + episode.episode_id,
        episode.download_url,
        '',
        1,
        i,
        [stremioConvertor.getStremioStream(episode.download_url)],
        episode.title);
}

function fullShowToFullStremioSeries(show, episodes) {

    const videos = episodes.map((x, i) => episodeToStremioVideo(x, i));

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
        show.site_url,
        null,
        null,
        videos);
}

const getMetaForShow = function (show, episodes) {

    const fullStremioShow = fullShowToFullStremioSeries(show, episodes);

    // with test video object
    const meta = stremioConvertor.getStremioMeta(fullStremioShow, {
        available: true,
        id: show.show_id,
        title: show.title,
        trailer: undefined,
        thumbnail: show.image_url,
    });

    return meta;

};

const getStreamsForEpisode = function (episode) {
    return stremioConvertor.getStreamioStreams([stremioConvertor.getStremioStream(episode.download_url)]);
};

module.exports = {
    showToStremioSeries,
    getMetaForShow,
    getStreamsForEpisode
};