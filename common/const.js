const axios = require('axios');

// Define all the const that are use by the addon
const LOG_LEVEL = "debug";

const LOG_MESSAGES = {
    START_ADDON: "** Start Addon - dependencies loaded **",
    START_CONVERT_EPISODE_TO_VIDEO: "Start convert episode to video: ",
    START_CONVERT_EPISODES_TO_VIDEOS: "Start convert episodes to videos: ",
    START_CONVERT_PODCAST_TO_SERIES: "Start convert podcast to series: ",
    START_GET_BEST_PODCASTS: "Start get best podcasts: ",
    START_SEARCH_PODCASTS: "Start search for podcasts: ",
    START_SEARCH_PODCASTS_FOR_GENRE: "Start search for podcasts by one of the genres: ",
    START_GET_PODCAST_BY_ID: "Start get podcast by id: ",
    START_GET_EPISODE_BY_ID: "Start get episode by id: ",
    SUCCESS_GET_BEST_PODCASTS: "Success- get best podcasts! number of results: ",
    SUCCESS_SEARCH_PODCASTS: "Success- search podcasts! number of results: ",
    SUCCESS_GET_PODCAST_BY_ID: "Success- get podcast by id: ",
    SUCCESS_GET_EPISODE_BY_ID: "Success- get episode by id: ",
    SUCCESS_FIND_GENRE_BY_ID: "Success- Find match genre (by genre name): ",
    SUCCESS_TRANSLATE_GENRES_IDS_TO_NAMES: "Success- Translate genre ids to names: ",
    SUCCESS_TRANSLATE_GENRES_NAMES_TO_IDS: "Success- Translate genre names to ids: ",
    SUCCESS_TRANSLATE_COUNTRIES_CODES_TO_NAMES: "Success- Translate countries codes to names: ",
    SUCCESS_GET_FEELING_LUCKY: "Success- Get feeling lucky result: ",
    ERROR_GET_BEST_PODCASTS: "Error- get best podcasts! Error: ",
    ERROR_SEARCH_PODCASTS: "Error- search podcasts! Error: ",
    ERROR_GET_PODCAST_BY_ID: "Error- get podcast by id! Error: ",
    ERROR_GET_EPISODE_BY_ID: "Error- get episode by id! Error: ",
    ERROR_FEELING_LUCKY: "Error- get feeling lucky! Error: ",
    START_CATALOG_HANDLER: "Handler: Catalog | ",
    SEARCH_ON_CATALOG_HANDLER: "Search available: ",
    START_SUBTITLE_HANDLER: "SUBTITLE: Subtitle | ",
    START_META_HANDLER: "Handler: Meta | ",
    START_STREAM_HANDLER: "Handler: Stream | ",
    START_FEELING_LUCKY: "Start get feeling lucky",
    ON_GOING_HANDLE_WITH_PROMISES: "Not all promises 'getPodcastById' completed yet. More to go: ",
    END_HANDLE_WITH_PROMISES: "All promises handled: ",
    INIT_GENRES_BY_ID_OBJECT: "Done! Create genres object. Num of genres: "
};

const PODCASTS_DATA_BASE_API_URL = "https://listen-api.listennotes.com";

const PODCASTS_DATA_API_ROUTES = {
    SEARCH: "/api/v2/search",
    PODCAST_BY_ID: "/api/v2/podcasts/",
    EPISODE_BY_ID: "/api/v2/episodes/",
    BEST_PODCASTS: "/api/v2/best_podcasts",
    GENRES: "/api/v2/genres",
    FEELING_LUCKY: "/api/v2/just_listen"
};

const PODCASTS_API_KEY = {
    HEADER_NAME: 'X-ListenAPI-Key',
    KEY: process.env.PODCASTS_API_KEY
};

const ID_PREFIX = "ap";

const CONTACT_EMAIL = "podcasts_for_all@yahoo.com";
const ADDON_LOGO = "https://github.com/NivM1/podcasts-for-all/blob/master/static/addon_logo.png?raw=true";
const ADDON_BACKGROUND = "https://github.com/NivM1/podcasts-for-all/blob/master/static/addon_background.jpg?raw=true";

const CATALOGS = {
    TYPE: "Podcasts",
    BY_GENRE: {
        ID: 'byGenre',
        NAME: 'Genres'
    },
    BY_COUNTRY: {
        ID: 'byCountry',
        NAME: 'Countries'
    },
    BY_MOOD: {
        ID: 'byMood',
        NAME: 'Moods'
    },
    BY_TREND: {
        ID: 'byTrend',
        NAME: '100 Trends'
    },
    FEELING_LUCKY: {
        ID: 'feelingLucky',
        NAME: "Feeling Lucky!",
        GENRES: ["Good luck!"]
    },
    SEARCH: {
        ID: 'search',
        NAME: "Search"
    }
};

const HANDLERS = {
    CATALOG: "CATALOG",
    META: "META",
    STREAM: "STREAM",
    SUBTITLE: "SUBTITLE",
    CONVERTOR: "CONVERTOR"
}

const API_CONSTANTS = {
    DEFAULT_GENRE: 0,
    DEFAULT_OFFSET: 0,
    DEFAULT_REGION: "us",
    DEFAULT_CERTIFICATION: "PG",
    SORT: {
        BY_RELEVANCE: 0,
        BY_DATE: 1
    },
    TYPES: {
        PODCAST: "podcast",
        EPISODE: "episode"
    },
    ONLY_IN_FIELDS: {
        TITLE: "title",
        DESCRIPTION: "description",
        AUTHOR: "author",
        AUDIO: "audio"
    },
    EXCLUDE_EXCPLICIT: {
        YES: 1,
        NO: 0
    },
    STREAMS_TITLES: {
        DEFAULT_STREAM_TITLE: "Stream",
        LISTEN_NOTES_STREAM_TITLE: "Powered by LISTEN NOTES",
        RSS_STREAM_TITLE: "RSS Feed",
        WEBSITE_STREAM_TITLE: "Website",
        SPOTIFY_STREAM_TITLE: "Spotify",
        YOUTUBE_STREAM_TITLE: "Youtube (built-in player)",
        TWITTER_STREAM_TITLE: "Twitter",
        FACEBOOK_STREAM_TITLE: "Facebook",
        INSTAGRAM_STREAM_TITLE: "Instagram"
    },
    FACEBOOK_BASE_URL: "https://www.facebook.com/",
    TWITTER_BASE_URL: "https://www.twitter.com/",
    INSTAGRAM_BASE_URL: "https://www.instagram.com/"
};

const PODCAST_TYPE = {
    SEARCH: 'SEARCH'
};

module.exports = {
    PODCAST_TYPE,
    CATALOGS,
    HANDLERS,
    LOG_LEVEL,
    LOG_MESSAGES,
    PODCASTS_DATA_BASE_API_URL,
    PODCASTS_DATA_API_ROUTES,
    PODCASTS_API_KEY,
    API_CONSTANTS,
    ID_PREFIX,
    CONTACT_EMAIL,
    ADDON_LOGO,
    ADDON_BACKGROUND
};