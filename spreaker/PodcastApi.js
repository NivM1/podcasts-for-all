const constants = require("../common/const");
const logger = require("../common/logger");
const axios = require('axios/index');

const apiInstanceItunes = axios.create({
    baseURL: constants.PODCASTS_BASE_API_URL_SPREAKER
});

const searchShows = async function(term, limit, offset) {

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


};

const getSpreakerShow = async function(id) {

    const result = await apiInstanceItunes.get(constants.SPREAKER_API_ROUTES.SHOW(id));

    return result.data.response.show;
};

getEpisodesByShowId = async function(id) {

    try {
        const result = await apiInstanceItunes.get(constants.SPREAKER_API_ROUTES.EPISODES(id), {
            params: {
                type: 'episodes',
            }
        });

        return result.data.response.items;
    }
    catch (e) {
        console.log('error loading from spreaker', e);
    }
};

getEpisodeById = async function(id) {

    try {
        const result = await apiInstanceItunes.get(constants.SPREAKER_API_ROUTES.EPISODE(id), {});

        return result.data.response.episode;
    }
    catch (e) {
        console.log('error loading from spreaker', e);
    }
};

module.exports = {
    searchShows,
    getSpreakerShow,
    getEpisodesByShowId,
    getEpisodeById
};