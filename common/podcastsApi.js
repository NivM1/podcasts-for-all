const constants = require("../common/const");
const axios = require('axios');


// Podcast api docs https://www.listennotes.com/api/docs/
const apiInstance = axios.create({
    baseURL: constants.PODCASTS_DATA_BASE_API_URL,
    //timeout: 2000,
    headers: {
        [constants.PODCASTS_API_KEY.HEADER_NAME]: constants.PODCASTS_API_KEY.KEY
    }
});

const getBestPodcast = function(internalPage, genre, regionFilter) {
    return apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.BEST_PODCASTS, {
        params: {
            page: internalPage,
            genre_id: genre,
            region: regionFilter
        }
    })
};

const searchPodcasts = function(searchTerm, offset, genreIds) {
    return apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.SEARCH, {
        params: {
            q: searchTerm,
            sort_by_date: constants.API_CONSTANTS.SORT.BY_RELEVANCE,
            type: constants.API_CONSTANTS.TYPES.PODCAST,
            offset: offset,
            genre_Ids: genreIds,
            only_in: [constants.API_CONSTANTS.ONLY_IN_FIELDS.TITLE, constants.API_CONSTANTS.ONLY_IN_FIELDS.DESCRIPTION],
            safe_mode: constants.API_CONSTANTS.EXCLUDE_EXCPLICIT.YES
        }
    })
};

const getPodcastById = function(id, params) {
    return apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.PODCAST_BY_ID + id, {
        params
    })
};

const getEpisodeById = function(id) {
    return apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.EPISODE_BY_ID + id);
};

const getFeelingLucky = function() {
    return apiInstance.get(constants.PODCASTS_DATA_API_ROUTES.FEELING_LUCKY);
};

module.exports = {
    getBestPodcast,
    searchPodcasts,
    getPodcastById,
    getEpisodeById,
    getFeelingLucky
};