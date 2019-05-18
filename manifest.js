const genres = require("./resources/genres");
const genresData = require("./podcasts/genresDataFetcher");
const constants = require('./common/const');
const countriesData = require("./podcasts/countriesDataFetcher");
const countries = require("./resources/countries");
const moods = require("./resources/moods");
const trends = require("./resources/trends");
genres.genresById = genresData.createPodcastGenresById(genres.genres);

module.exports = {
    id: "community.podcasts-for-all",
    version: process.env.VERSION,
    catalogs: [{
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.BY_GENRE.ID,
            name: constants.CATALOGS.BY_GENRE.NAME,
            genres: genresData.getGenresIdsFromArray(genres.genres),
            extraSupported: ['genre', 'search', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.BY_COUNTRY.ID,
            name: constants.CATALOGS.BY_COUNTRY.NAME,
            genres: countriesData.getCountriesStringsArray(countries),
            extraSupported: ['genre', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.BY_MOOD.ID,
            name: constants.CATALOGS.BY_MOOD.NAME,
            genres: moods,
            extraSupported: ['genre', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.BY_TREND.ID,
            name: constants.CATALOGS.BY_TREND.NAME,
            genres: trends.sort(),
            extraSupported: ['genre', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.FEELING_LUCKY.ID,
            name: constants.CATALOGS.FEELING_LUCKY.NAME,
            genres: constants.CATALOGS.FEELING_LUCKY.GENRES,
            extraSupported: ['genre', 'skip']
        }
    ],
    resources: [
        "catalog",
        {
            name: 'stream',
            types: ['series'],
            idPrefixes: [constants.ID_PREFIX]
        },
        {
            name: 'meta',
            types: ['series'],
            idPrefixes: [constants.ID_PREFIX]
        },
        {
            name: 'subtitles',
            types: ['series'],
            idPrefixes: [constants.ID_PREFIX]
        }
    ],
    types: [
        "series"
    ],
    name: "Podcasts For All",
    email: constants.CONTACT_EMAIL,
    contactEmail: constants.CONTACT_EMAIL,
    logo: constants.ADDON_LOGO,
    background: constants.ADDON_BACKGROUND,
    description: "Join Thousands of daily listeners! Stream the best & most verstile HQ Podcasts- It will be a great listening experience! Over 1,000,000 Podcasts and 44,000,000 Episodes, All genres, languages, moods & trends"
};