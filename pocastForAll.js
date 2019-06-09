const podcastsApiItunes = require("./sources/itunes/api");
const convertorsItunes = require("./sources/itunes/convertors");
const spreakerApi = require('./sources/spreaker/api');
const spreakerConvertor = require('./sources/spreaker/convertors');
const constants = require('./common/const');
const logger = require('./common/logger');

function getMixedPodcasts(source1, source2) {
    const margedPodcastList = [];
    if (source1.length > source2.length) {
        source1.forEach((x, i) => {
            if (!checkIfPodcastExist(margedPodcastList, x.name)) margedPodcastList.push(x);
            if (source2[i] && !checkIfPodcastExist(margedPodcastList, source2[i].name))
                margedPodcastList.push(source2[i]);
        });

    } else {
        source2.forEach((x, i) => {
            margedPodcastList.push(x);
            if (source1[i] && !checkIfPodcastExist(margedPodcastList, source1[i].name))
                margedPodcastList.push(source1[i]);
        });
    }

    return margedPodcastList;
}

function checkIfPodcastExist(podcasts, name) {

    let isFound = false;
    let counter = 0;

    while (!isFound & counter < podcasts.length) {

        if (podcasts[counter].name === name) {

            isFound = true;
        }

        counter++;
    }

    return (isFound)
}


const getPodcastsBySearch = async function (searchTerm) {

    const itunesPodcasts = await podcastsApiItunes.search(searchTerm);
    const itunesStremioPodcasts = itunesPodcasts.map(convertorsItunes.podcastToSeries);

    const spreakerShows = await spreakerApi.searchShows(searchTerm);
    const spreakerStremioPodcastsPromise = [];
    for (let i = 0; i < spreakerShows.length; i++) {
        spreakerStremioPodcastsPromise.push(spreakerConvertor.showToStremioSeries(spreakerShows[i]));
    }
    const spreakerStremioPodcasts = await Promise.all(spreakerStremioPodcastsPromise);

    return getMixedPodcasts(itunesStremioPodcasts, spreakerStremioPodcasts);
};

const getMetadataForPodcast = async function (podcastId) {

    if (podcastId.startsWith(constants.SPREAKER_ID_PREFIX)) {
        const spreakerShowId = podcastId.replace(constants.SPREAKER_ID_PREFIX, '');
        const spreakerShow = await spreakerApi.getSpreakerShow(spreakerShowId);
        const episodes = await spreakerApi.getEpisodesByShowId(spreakerShowId);
        const spreakerStremioMeta = spreakerConvertor.getMetaForShow(spreakerShow, episodes);


        return spreakerStremioMeta;
    }

    if (podcastId.startsWith(constants.ITUNES_ID_PREFIX)) {
        const itunesId = podcastId.replace(constants.ITUNES_ID_PREFIX, '');
        const itunesPodcast = await podcastsApiItunes.getPodcastById(itunesId);

        logger.info("Podcast: " + itunesPodcast.collectionName + " | " + itunesPodcast.country + ": " + constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, itunesPodcast);

        const itunesStremioMeta = await convertorsItunes.getStremioMetaFromPodcast(itunesPodcast);
        return itunesStremioMeta;
    }
};

const getStreamsForEpisodeId = async function (episodeId) {

    if (episodeId.startsWith(constants.SPREAKER_ID_PREFIX)) {
        const spreakerEpisodeId = episodeId.replace(constants.SPREAKER_ID_PREFIX, '');
        const episode = await spreakerApi.getEpisodeById(spreakerEpisodeId);
        const streams = spreakerConvertor.getStreamsForEpisode(episode);

        return streams;
    }

    if (episodeId.startsWith(constants.ITUNES_ID_PREFIX)) {
        const ids = episodeId.replace(constants.ITUNES_ID_PREFIX,'').split(constants.ITUNES_EPISODE_ID_SEPARATOR);
        const feedUrl = ids[0];
        const episodeGuid = ids[1];

        const episodes = await podcastsApiItunes.getEpisodesByPodcastId(feedUrl);
        const streams = convertorsItunes.getStreamsFromEpisode(episodes, episodeGuid, feedUrl);

        return streams;
    }

};


module.exports = {
    getPodcastsBySearch,
    getMetadataForPodcast,
    getStreamsForEpisodeId,
};