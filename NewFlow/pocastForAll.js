const podcastsApiItunes = require("../common/podcastsApiItunes");
const convertorsItunes = require("../podcasts/convertorsItunes");
const spreakerApi = require('../spreaker/PodcastApi');
const spreakerConvertor = require('../spreaker/convertors');
const constants = require('../common/const');
const logger = require('../common/logger');

function getMixedPodcasts(source1, source2) {
    const margedPodcastList = [];
    if (source1.length > source2.length) {
        source1.forEach((x, i) => {
            if(!checkIfPodcastExist(margedPodcastList, x.name)) margedPodcastList.push(x);
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

function checkIfPodcastExist(podcasts, name){

    let isFound = false;
    let counter = 0;

    while (!isFound & counter < podcasts.length){

        if (podcasts[counter].name == name){

            isFound = true;
        }
                
        counter++;
    }

    return (isFound)
}


const getPodcastsBySearch = async function (searchTerm) {

    const itunesPodcasts = await podcastsApiItunes.search(searchTerm);
    const itunesStremioPodcasts = await convertorsItunes.podcastsToSerieses(itunesPodcasts, constants.HANDLERS.CATALOG.toLowerCase());

    const spreakerShows = await spreakerApi.searchShows(searchTerm);
    const showsListPromiss = spreakerShows.map(spreakerConvertor.showToStremioSeries);
    const spreakerStremioPodcasts = await Promise.all(showsListPromiss);

    return getMixedPodcasts(itunesStremioPodcasts, spreakerStremioPodcasts);
    //
    // return itunesStremioPodcasts;
};

const getMetadataForPodcast = async function (podcastId) {

    if (podcastId.startsWith(constants.SPREAKER_ID_PREFIX)) {
        const spreakerShowId = podcastId.replace(constants.SPREAKER_ID_PREFIX, '');
        const spreakerShow = await spreakerApi.getSpreakerShow(spreakerShowId);
        const episodes = await spreakerApi.getEpisodesByShowId(spreakerShowId);
        const spreakerStremioMeta = spreakerConvertor.getMetaForShow(spreakerShow, episodes);


        return spreakerStremioMeta;
    }

    const podcast = await podcastsApiItunes.getPodcastById(podcastId);

    logger.info("Podcast: " + podcast.collectionName + " | " + podcast.country + ": " + constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, podcast);

    return {
        meta: await convertorsItunes.podcastToSeries(podcast, constants.HANDLERS.META.toLowerCase()),
        video: convertorsItunes.podcastToSeriesVideo(podcast)
    };

};

const getStreamsForEpisodeId = async function (episodeId) {

    if (episodeId.startsWith(constants.SPREAKER_ID_PREFIX)) {
        const spreakerEpisodeId = episodeId.replace(constants.SPREAKER_ID_PREFIX,'');
        const episode = await spreakerApi.getEpisodeById(spreakerEpisodeId);
        const streams = spreakerConvertor.getStreamsForEpisode(episode);

        return streams;
    }

    let episode = {};
    let idParts = episodeId.split("|");
    let idParts2 = idParts[0].split("/");
    const podcast = await podcastsApiItunes.getPodcastById(idParts[1]);
    const itunesEpisodes = await podcastsApiItunes.getEpisodesByPodcastId(podcast.collectionId);
    const itunesVideos = convertorsItunes.episodesToVideos(itunesEpisodes).asArray;
    episode = podcastsApiItunes.getEpisodeFromVideos(itunesVideos, constants.ID_PREFIX + idParts[0]);
    episode.podcast = podcast;

    const streams =  convertorsItunes.getStreamsFromEpisode(episode);

    return {
        streams
    }

};


module.exports = {
    getPodcastsBySearch,
    getMetadataForPodcast,
    getStreamsForEpisodeId,
};