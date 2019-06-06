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
            margedPodcastList.push(x);
            if (source2[i])
                margedPodcastList.push(source2[i]);
        });

    } else {
        source2.forEach((x, i) => {
            margedPodcastList.push(x);
            if (source1[i])
                margedPodcastList.push(source1[i]);
        });
    }

    return margedPodcastList;
}


const getPodcastsBySearch = async function (searchTerm) {

    const itunesPodcasts = await podcastsApiItunes.search(searchTerm);
    const itunesStremioPodcasts = await convertorsItunes.podcastsToSerieses(itunesPodcasts, constants.HANDLERS.CATALOG.toLowerCase());

    const spreakerShows = await spreakerApi.search(searchTerm);
    const spreakerStremioPodcasts = spreakerShows.map(spreakerConvertor.showToStremioSeries);

    return getMixedPodcasts(itunesStremioPodcasts, spreakerStremioPodcasts);
    //
    // return itunesStremioPodcasts;
};

const getMetadataForPodcast = async function (podcastId) {

    if (podcastId.startsWith(constants.SPREAKER_ID_PREFIX)) {
        const spreakerId = podcastId.replace(constants.SPREAKER_ID_PREFIX, '');
        const spreakerShow = await spreakerApi.getSpreakerShow(spreakerId);
        const episodes = await spreakerApi.getEpisodesByShowId(spreakerId);
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


module.exports = {
    getPodcastsBySearch,
    getMetadataForPodcast,
};