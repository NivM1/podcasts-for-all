const constants = require("../common/const");
const logger = require("../common/logger");
const axios = require('axios');
var convert = require('xml-js');

// Itunes api docs https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api
const apiInstanceItunes = axios.create({
    baseURL: constants.PODCASTS_DATA_BASE_API_URL_ITUNES
});

async function search(term, limit) {

    if (!limit) limit = constants.API_CONSTANTS.ITUNES_LIMIT_RESULTS;
    const result = await apiInstanceItunes.get(constants.ITUNES_DATA_API_ROUTES.SEARCH, {
        term: term,
        limit: limit
    });

    return (result.data.results);
}

async function getPodcastById(id) {

    const result = await apiInstanceItunes.get(constants.ITUNES_DATA_API_ROUTES.LOOKUP, {
        params: {
            id: id
        }
    });

    return (result.data.results[0]);
}

async function getEpisodesFromFeed(feedUrl) {

    const result = await axios.get(feedUrl);

    // Convert becasue the result is in xml format
    return (JSON.parse(convert.xml2json(result.data, {
        compact: true,
        spaces: 4
    })));
}

async function getEpisodesByPodcastId(id) {

    const podcast = await getPodcastById(id);
    const episodes = await getEpisodesFromFeed(podcast.feedUrl);

    if (episodes.rss.channel.item.length == 0){
        logger.info(constants.LOG_MESSAGES.ZERO_RESULTS_EPISODES_ITUNES + id);
    }

    return (episodes.rss.channel.item);
}

function getEpisodeFromVideos(episodes, episodeId){

    let found = false;
    let counter = 0;
    let episode;

    while (!found && counter < episodes.length){

        if (episodes[counter].id == episodeId){

            episode = episodes[counter];
            found = true;
        }

        counter++;
    }

    return (episode);
}

module.exports = {
    search,
    getPodcastById,
    getEpisodesByPodcastId,
    getEpisodeFromVideos
};