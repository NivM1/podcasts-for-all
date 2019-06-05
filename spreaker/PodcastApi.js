const constants = require("../common/const");
const logger = require("../common/logger");
const axios = require('axios/index');

const apiInstanceItunes = axios.create({
    baseURL: constants.PODCASTS_BASE_API_URL_SPREAKER
});

async function search(term, limit, offset) {

    if (!limit) limit = 50;

    try {
        const result = await apiInstanceItunes.get(constants.SPREAKER_API_ROUTES.SEARCH, {
            params: {
                q: term,
                type: 'shows',
            }
        });

        return result.data.response.items;
    }
    catch (e) {
        console.log('error loading from spreaker', e);
    }


}

async function getSpreakerShow(id) {

    const result = await apiInstanceItunes.get(constants.SPREAKER_API_ROUTES.SHOW(id));

    return result.data.response.show;
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

    if (episodes.rss.channel.item.length === 0) {
        logger.info(constants.LOG_MESSAGES.ZERO_RESULTS_EPISODES_ITUNES + id);
    }

    return (episodes.rss.channel.item);
}

function getEpisodeFromVideos(episodes, episodeId) {

    let found = false;
    let counter = 0;
    let episode;

    while (!found && counter < episodes.length) {

        if (episodes[counter].id === episodeId) {

            episode = episodes[counter];
            found = true;
        }

        counter++;
    }

    return (episode);
}

module.exports = {
    search,
    getSpreakerShow,
    //getEpisodesByPodcastId,
    //getEpisodeFromVideos
};