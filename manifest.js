const genres = require("./resources/genres");
const genresData = require("./podcasts/genresData");
const constants = require('./common/const');
const countriesData = require("./podcasts/countriesData");
const countries = require("./resources/countries");

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
            extraSupported: ['genre', 'search', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.BY_LANGUAGE.ID,
            name: constants.CATALOGS.BY_LANGUAGE.NAME,
            genres: countriesData.getCountriesStringsArray(countries),
            extraSupported: ['genre', 'search', 'skip']
        },
        {
            type: constants.CATALOGS.TYPE,
            id: constants.CATALOGS.FEELING_LUCKY.ID,
            name: constants.CATALOGS.FEELING_LUCKY.NAME,
            genres: constants.CATALOGS.FEELING_LUCKY.GENRES,
            extraSupported: ['genre', 'search', 'skip']
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
    description: "Stream the best and most verstile HQ Podcasts- It will be a great listening experience! Over 666,000 Podcasts and 44,000,000 Episodes, All genres & languages (Powered by LISTEN NOTES)"
};