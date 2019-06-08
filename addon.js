// External dependencies
const {
    addonBuilder
} = require("stremio-addon-sdk");

// Dependencie which read from the env variables
require('dotenv').config();

// Internal dependencies
const constants = require('./common/const');
const logger = require("./common/logger.js");
const manifest = require('./manifest');
const searchHelper = require("./resources/searchHelper");
const podcastRetriver = require('./NewFlow/pocastForAll');

logger.info(constants.LOG_MESSAGES.START_ADDON + " Version: " + process.env.VERSION);

const builder = new addonBuilder(manifest);

let topCatch;

// Addon handlers
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(async ({
    type,
    id,
    extra
}) => {
    let Serieses = [];

    // If specific genre selected (or just top catalog)
    if (extra.genre) {

        // All catalogs handlers
        switch (id) {

            // Switch between catalogs
            case constants.CATALOGS.BY_GENRE.ID: {

                logger.info(constants.CATALOGS.BY_GENRE.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_GENRE.NAME, extra.genre);

                Serieses = await podcastRetriver.getPodcastsBySearch(extra.genre);
                break;
            }
            case constants.CATALOGS.BY_COUNTRY.ID: {

                logger.info(constants.CATALOGS.BY_COUNTRY.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_COUNTRY.NAME, extra.genre);

                Serieses = await podcastRetriver.getPodcastsBySearch(extra.genre);
                break;
            }
            case constants.CATALOGS.BY_MOOD.ID: {

                logger.info(constants.CATALOGS.BY_MOOD.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_MOOD.NAME, extra.genre);

                Serieses = await podcastRetriver.getPodcastsBySearch(extra.genre);
                break;
            }
            case constants.CATALOGS.BY_TREND.ID: {

                logger.info(constants.CATALOGS.BY_TREND.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_TREND.NAME, extra.genre);

                Serieses = await podcastRetriver.getPodcastsBySearch(extra.genre);
                break;
            }
            default: {

                break;
            }
        }
    } 
    // This is a search
    else if (extra.search) {

        // We use special prefix for podcasts search
        if (extra.search.toLowerCase().includes(constants.SEARCH_PREFIX)) {

            const fixedSearchTerm = extra.search.split(constants.SEARCH_PREFIX)[1];
            logger.info(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER_FOR_PODCAST + fixedSearchTerm, constants.HANDLERS.CATALOG, constants.CATALOGS.SEARCH.NAME, extra.search.toLowerCase(), null, {
                search: fixedSearchTerm.toLowerCase()
            });

            Serieses = await podcastRetriver.getPodcastsBySearch(fixedSearchTerm);

        } else {

            logger.info(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search, constants.HANDLERS.CATALOG, constants.CATALOGS.SEARCH.NAME, extra.search.toLowerCase(), null, {
                search: extra.search.toLowerCase()
            });

            // Shows instructions if the search format was not used
            Serieses = searchHelper;
        }

    } 
    // Just get top from catch
    else {

        // No catch while dev
        if (!topCatch || process.env.ENVIRONMENT === constants.ENVIRONMENT.DEVELOPMENT) {
            logger.debug(constants.LOG_MESSAGES.TAKE_TOP_FROM_ORIGIN);

            Serieses = await podcastRetriver.getPodcastsBySearch('top');
            topCatch = Serieses;
        } else {
            logger.debug(constants.LOG_MESSAGES.TAKE_TOP_FROM_CATCH);
            Serieses = topCatch;
        }
    }

    // Returns the catalog item or the search results
    return {
        metas: Serieses
    }
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
builder.defineMetaHandler(async ({
    type,
    id
}) => {

    logger.info(constants.LOG_MESSAGES.START_META_HANDLER + "(type: " + type + " & id: " + id + ")", constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST);
    const podcastId = id.replace(constants.ID_PREFIX, "");

    const podcastMetaObject = await podcastRetriver.getMetadataForPodcast(podcastId);
    logger.info("Podcast: " + podcastMetaObject.title + " | " + podcastMetaObject.country + " | " + podcastMetaObject.language, constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, podcastMetaObject);

    return podcastMetaObject;
});


// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
builder.defineStreamHandler(async ({
    id,
    type
}) => {

    logger.info(constants.LOG_MESSAGES.START_STREAM_HANDLER + "(type: " + type + " & id: " + id + ")", constants.HANDLERS.STREAM, constants.API_CONSTANTS.TYPES.EPISODE, null, 1, {
        id: id
    });

    episodeId = id.replace(constants.ID_PREFIX, "");

    let episode = {};

    logger.info(constants.LOG_MESSAGES.USING_ITUNES_STRAEM_HANDLER);

    const streams = await podcastRetriver.getStreamsForEpisodeId(episodeId);
    return streams;
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
builder.defineSubtitlesHandler(async function (args) {

    logger.info(constants.LOG_MESSAGES.START_SUBTITLE_HANDLER + "(type: " + args.type + " & id: " + args.id + ")", constants.HANDLERS.SUBTITLE, constants.API_CONSTANTS.TYPES.EPISODE, null, 1, {
        id: args.id
    });

    return {
        subtitles: []
    };
});

module.exports = builder.getInterface();