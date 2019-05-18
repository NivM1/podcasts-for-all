// External dependencies
const {
	addonBuilder
} = require("stremio-addon-sdk");

// Dependencie which read from the env variables
require('dotenv').config();

// Internal dependencies
const constants = require('./common/const');
const logger = require("./common/logger.js");
const convertors = require("./podcasts/convertors");
const podcastsData = require("./podcasts/podcastsDataFetcher");
const genresData = require("./podcasts/genresDataFetcher");
const countriesData = require("./podcasts/countriesDataFetcher");
const manifest = require('./manifest');

logger.info(constants.LOG_MESSAGES.START_ADDON + " Version: " + process.env.VERSION);

const builder = new addonBuilder(manifest);

// Addon handlers
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(async ({
	type,
	id,
	extra
}) => {

	logger.info(constants.LOG_MESSAGES.START_CATALOG_HANDLER + "(type: " + type + " & id: " + id + ")", constants.HANDLERS.CATALOG, id);

	let genre = 0;
	let country = constants.API_CONSTANTS.DEFAULT_REGION;

	if (extra.genre && id === constants.CATALOGS.BY_GENRE.ID) {
		logger.info(constants.CATALOGS.BY_GENRE.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_GENRE.NAME, extra.genre);

		genre = extra.genre;
		genre = genresData.findGenreId(genre)
	} else if (extra.genre && id === constants.CATALOGS.BY_COUNTRY.ID) {
		logger.info(constants.CATALOGS.BY_COUNTRY.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_COUNTRY.NAME, extra.genre);

		country = extra.genre;
		country = countriesData.findCountryId(country);
	} else if (extra.genre && id === constants.CATALOGS.FEELING_LUCKY.ID) {
		logger.info(constants.CATALOGS.FEELING_LUCKY.NAME + ": Try his luck", constants.HANDLERS.CATALOG, constants.CATALOGS.FEELING_LUCKY.NAME);

		const podcast = await podcastsData.getFeelingLucky();
		const serieses = await convertors.podcastsToSerieses([convertors.luckyPodcastToPodcast(podcast)]);

		return {
			metas: serieses.asArray
		};
	} else if (extra.genre && id === constants.CATALOGS.BY_MOOD.ID) {
		logger.info(constants.CATALOGS.BY_MOOD.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_MOOD.NAME, extra.genre);

		let Serieses = [];
		const podcasts = await podcastsData.searchPodcasts(extra.genre, null, null, true);
		Serieses = await convertors.podcastsToSerieses(podcasts, constants.PODCAST_TYPE.SEARCH);

		return {
			metas: Serieses.asArray
		};
	} 
	else if (extra.genre && id === constants.CATALOGS.BY_TREND.ID) {
		logger.info(constants.CATALOGS.BY_TREND.NAME + ": " + extra.genre, constants.HANDLERS.CATALOG, constants.CATALOGS.BY_TREND.NAME, extra.genre);

		let Serieses = [];
		const podcasts = await podcastsData.searchPodcasts(extra.genre, null, null, true);
		Serieses = await convertors.podcastsToSerieses(podcasts, constants.PODCAST_TYPE.SEARCH);

		return {
			metas: Serieses.asArray
		};
	}

	// If there is active search using search api instead of best podcasts api
	if (extra.search) {

		let Serieses = [];

		logger.info(constants.LOG_MESSAGES.SEARCH_ON_CATALOG_HANDLER + extra.search, constants.HANDLERS.CATALOG, constants.CATALOGS.SEARCH.NAME, extra.search.toLowerCase(), null, {
			search: extra.search.toLowerCase()
		});

		const podcasts = await podcastsData.searchPodcasts(extra.search);
		Serieses = await convertors.podcastsToSerieses(podcasts);

		return {
			metas: Serieses.asArray
		};
	} else {
		const podcasts = await podcastsData.getBestPodcasts(extra.skip ? extra.skip : 0, genre, country);
		const serieses = await convertors.podcastsToSerieses(podcasts);
		let finalPodcasts = serieses.asArray;
		return {
			metas: finalPodcasts
		};
	}
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
builder.defineMetaHandler(async ({
	type,
	id
}) => {

	logger.info(constants.LOG_MESSAGES.START_META_HANDLER + "(type: " + type + " & id: " + id + ")", constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST);
	id = id.replace(constants.ID_PREFIX, "");

	const podcast = await podcastsData.getPodcastById(id);

	logger.info("Podcast: " + podcast.title + " | " + podcast.country + " | " + podcast.language, constants.HANDLERS.META, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, podcast);

	return {
		meta: await convertors.podcastToSeries(podcast),
		video: convertors.podcastToSeriesVideo(podcast)
	};
});

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
builder.defineStreamHandler(async ({
	id,
	type
}) => {

	logger.info(constants.LOG_MESSAGES.START_STREAM_HANDLER + "(type: " + type + " & id: " + id + ")", constants.HANDLERS.STREAM, constants.API_CONSTANTS.TYPES.EPISODE, null, 1, {
		id: id
	});

	id = id.replace(constants.ID_PREFIX, "");

	const episode = await podcastsData.getEpisodeById(id);
	return {
		streams: convertors.getStreamsFromEpisode(episode)
	};
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