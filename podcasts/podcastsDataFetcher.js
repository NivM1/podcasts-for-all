const logger = require("../common/logger");
const constants = require("../common/const");
const podcastsApi = require("../common/podcastsApi");

async function getBestPodcasts(skip, genreId, region) {

    logger.debug(constants.LOG_MESSAGES.START_GET_BEST_PODCASTS, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, "Best", skip, {
        genreId: genreId,
        region: region
    });
    const podcastPerRequest = 20;

    // For genre filter
    let genre = constants.API_CONSTANTS.DEFAULT_GENRE;
    if (genreId) genre = genreId;

    let regionFilter = constants.API_CONSTANTS.DEFAULT_REGION;
    if (region) regionFilter = region;

    let podcasts = [];
    let canKeepPulling = true;
    let internalPage = skip / podcastPerRequest + 1;

    try {
        do {
            const result = await podcastsApi.getBestPodcast(internalPage, genre, regionFilter);

            podcasts.push(...result.data.podcasts);
            canKeepPulling = result.data.has_next;
            internalPage++;

        } while (podcasts.length < 40 && canKeepPulling);

        logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_BEST_PODCASTS + podcasts.length, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, "Best", podcasts.length, {
            page: internalPage,
            genre_id: genre,
            region: regionFilter
        });
        return podcasts;
    } catch (e) {
        logListenNoteErrors('getting best podcasts', e);
    }
}


async function searchPodcasts(searchTerm, genreIds, offsetForPagination, isGenreSearch) {

    let logMessageBasic = constants.LOG_MESSAGES.START_SEARCH_PODCASTS;
    if (isGenreSearch) logMessageBasic = constants.LOG_MESSAGES.START_SEARCH_PODCASTS_FOR_GENRE;

    logger.debug(logMessageBasic  + ": " +  searchTerm, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, constants.CATALOGS.SEARCH.NAME, null, {search: searchTerm});

    // For offset for pagination filter
    let offset = constants.API_CONSTANTS.DEFAULT_OFFSET;
    if (offsetForPagination) offset = offsetForPagination;

    try {
        const result = await podcastsApi.searchPodcasts(searchTerm, genreIds, offsetForPagination);

        logger.debug(constants.LOG_MESSAGES.SUCCESS_SEARCH_PODCASTS + result.data.results.length, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, constants.CATALOGS.SEARCH.NAME, result.data.results.length, result.data.results);
        return result.data.results;
    } catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_SEARCH_PODCASTS + e);
        logListenNoteErrors('searching podcasts', e);
    }
}

async function getPodcastById(id, params = {}) {
    logger.debug(constants.LOG_MESSAGES.START_GET_PODCAST_BY_ID + id, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, null, null, {id: id});

    // For offset for pagination filter
    try {
        const response = await podcastsApi.getPodcastById(id, params);
        logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_PODCAST_BY_ID + response.data.id, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, response.data);
        return response.data;
    } catch (e) {
        logger.error(constants.LOG_MESSAGES.ERROR_GET_PODCAST_BY_ID + e);
        logListenNoteErrors('getting detail podcast', e);
    }
}

async function getEpisodeById(id) {
    logger.debug(constants.LOG_MESSAGES.START_GET_EPISODE_BY_ID + id, constants.HANDLERS.CATALOG, constants.API_CONSTANTS.TYPES.EPISODE, null, null, {id: id});

    // For offset for pagination filter
    try {
        const response = await podcastsApi.getEpisodeById(id);
        logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_EPISODE_BY_ID + response.data.id,
            constants.HANDLERS.CATALOG,
            constants.API_CONSTANTS.TYPES.EPISODE,
            null,
            1,
            response.data);

        return response.data;
    } catch (e) {
        logListenNoteErrors('getting episode by id', e);
        logger.error(constants.LOG_MESSAGES.ERROR_GET_EPISODE_BY_ID + e);
    }
}

async function getAllEpisodesForPodcast(podcast) {
    const episodes = [];
    episodes.push(...podcast.episodes);
    let nextEpisodePubDate = podcast.next_episode_pub_date;

    while (nextEpisodePubDate) {
        const results = await getPodcastById(podcast.id, {
            next_episode_pub_date: nextEpisodePubDate,
        });

        nextEpisodePubDate = results.next_episode_pub_date;
        episodes.push(...results.episodes)
    }

    return episodes.reverse();
}

async function getFeelingLucky() {
    logger.debug(constants.LOG_MESSAGES.START_FEELING_LUCKY, constants.HANDLERS.CATALOG, constants.CATALOGS.FEELING_LUCKY, null, null, null);

    // For offset for pagination filter
    try {
        const response = await podcastsApi.getFeelingLucky();

        logger.debug(constants.LOG_MESSAGES.SUCCESS_GET_FEELING_LUCKY + response.data.id, constants.CATALOGS.FEELING_LUCKY, null, 1, response.data);
        return response.data;
    } catch (e) {
        logListenNoteErrors('getting feeling lucky podcast', e);
        logger.error(constants.LOG_MESSAGES.ERROR_FEELING_LUCKY + e);
    }
}

function logListenNoteErrors(operation, e) {
    if (e.responce.status === 401) {
        logger.error('on ' + operation + ' we got error code 401 - wrong api key or your account is suspended.\n exception detail:' + e);
    } else if (e.responce.status === 404) {
        logger.error('on ' + operation + ' we got error code 404 endpoint not exist, or podcast / episode not exist.\n exception detail:' + e);
    } else if (e.responce.status === 429) {
        logger.error('on ' + operation + ' we got error code 429 you are using FREE plan and you exceed the quota limit.\n exception detail:' + e);
    } else if (e.responce.status === 500) {
        logger.error('on ' + operation + ' we got error code 500 something wrong on listennote end.\n exception detail:' + e);
    } else {
        logger.error(constants.LOG_MESSAGES.ERROR_SEARCH_PODCASTS + e);
    }
}

module.exports = {
    getAllEpisodesForPodcast,
    searchPodcasts,
    getBestPodcasts,
    getPodcastById,
    getEpisodeById,
    getFeelingLucky
};