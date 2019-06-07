const stremioConvertor = require('../common/stremioConvertor');
const constants = require('../common/const');
const podcastApi = require('./PodcastApi');
const languages = require('../resources/languages');

const showToStremioSeries = async function (show) {

    // Get the full show because there is not enogth data in the basic show object
    const fullShow = await podcastApi.getSpreakerShow(show.show_id);
    const episodes = await podcastApi.getEpisodesByShowId(show.show_id);

    return stremioConvertor.getStremioSeries(
        constants.SPREAKER_ID_PREFIX + fullShow.show_id,
        fullShow.title,
        fullShow.image_original_url,
        getAttributesTitle(languages[fullShow.language].name, episodes.length, episodes[0].duration),
        fullShow.image_original_url,
        fullShow.description,
        [fullShow.author.fullname],
        null,
        fullShow.language,
        null,
        null,
        show.site_url);
};

function getAttributesTitle(language, numOfEpisodes, lastEpisodeDuration){
    let languageTitle = "<b>Language: </b>";
    let attributesTitles = ["<em>" + constants.API_CONSTANTS.STREAMS_TITLES.SPREAKER_STREAM_TITLE + "</em>"]
    attributesTitles.push(languageTitle += language);
    
    if (numOfEpisodes){
        let numOfEpisodesTitle = "<b>Numer of episodes: </b>";
        attributesTitles.push(numOfEpisodesTitle += numOfEpisodes);
    } 

    if (lastEpisodeDuration){
        let lastEpisodeDurationTitle = "<b>Last episode duration: </b>";
        attributesTitles.push(lastEpisodeDurationTitle += (lastEpisodeDuration/60000).toFixed(0) + " min");
    }

    return (attributesTitles)
}

function episodeToStremioVideo(episode, i) {
    return stremioConvertor.getstremioVideo(
        constants.SPREAKER_ID_PREFIX + episode.episode_id,
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
        constants.SPREAKER_ID_PREFIX + show.show_id,
        show.title,
        show.image_url,
        getAttributesTitle(languages[show.language].name, episodes.length, episodes[0].duration),
        show.image_url,
        show.description,
        [show.author.fullname],
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