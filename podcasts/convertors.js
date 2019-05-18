const logger = require("../common/logger");
const constants = require("../common/const");
const podcastsData = require("./podcastsDataFetcher");
const genresData = require("./genresDataFetcher");

// All functions that convert podcast or episode object to Stremio object
function episodeToVideo(episode, episodeNumber) {
    return {
        id: constants.ID_PREFIX + episode.id,
        title: episode.title,
        released: (new Date(episode.pub_date_ms)).toISOString(),
        thumbnail: episode.thumbnail,
        streams: [{
            url: episode.audio
        }],
        available: true,
        episode: episodeNumber,
        season: 1,
        overview: episode.description
    };
}

function episodesToVideos(episodes) {
    logger.debug(constants.LOG_MESSAGES.START_CONVERT_EPISODES_TO_VIDEOS + episodes.length, constants.HANDLERS.CONVERTOR, constants.API_CONSTANTS.TYPES.EPISODE, null, episodes.length, episodes);

    let videos = {
        asArray: [],
        asObjectById: {}
    };
    let episodeNumber = 1;

    episodes.forEach(episode => {
        let currentVideo = episodeToVideo(episode, episodeNumber);

        episodeNumber++;

        videos.asArray.push(currentVideo);
        videos.asObjectById[episode.id] = currentVideo;
    });

    return videos;
}

async function podcastToSeries(podcast, origin) {
    //logger.debug(constants.LOG_MESSAGES.START_CONVERT_PODCAST_TO_SERIES + podcast.id, constants.HANDLERS.CONVERTOR, constants.API_CONSTANTS.TYPES.PODCAST, null, 1, podcast);

    let released = "";
    if (podcast.earliest_pub_date_ms) released = (new Date(podcast.earliest_pub_date_ms)).toISOString();

    let series = {};
    if (origin === constants.PODCAST_TYPE.SEARCH) {
        series = {
            id: constants.ID_PREFIX + podcast.id,
            type: "series",
            name: podcast.title_original,
            poster: podcast.thumbnail,
            genres: generateBasicGenres(podcast),
            posterShape: "regular",
            background: podcast.image,
            logo: constants.ADDON_LOGO,
            description: podcast.description_original,
            director: [podcast.publisher_original],
            released: released,
            inTheaters: true,
        };
    } else {
        series = {
            id: constants.ID_PREFIX + podcast.id,
            type: "series",
            name: podcast.title,
            poster: podcast.thumbnail,
            genres: generateBasicGenres(podcast),
            posterShape: "regular",
            background: podcast.image,
            logo: constants.ADDON_LOGO,
            description: podcast.description,
            director: [podcast.publisher],
            released: released,
            inTheaters: true,
            language: podcast.language,
            country: podcast.country,
            awards: generateAwards(podcast.explicit_content, podcast.is_claimed),
            website: podcast.website
        };
    }


    if (podcast.earliest_pub_date_ms || podcast.latest_pub_date_ms) {
        series.releaseInfo = generateReleaseInfo(podcast.earliest_pub_date_ms, podcast.latest_pub_date_ms)
    }

    // Sets series parameters if there is episodes to the podcast
    if (podcast.episodes) {
        series.runtime = "Last episode length: " + (podcast.episodes[0].audio_length_sec / 60).toFixed(0) + " min     | ";
        series.genres = genresData.getGenresStringsFromArray(podcast.genre_ids);

        const allEpisodes = await podcastsData.getAllEpisodesForPodcast(podcast);
        let episodesAsVideos = episodesToVideos(allEpisodes);
        series.videos = episodesAsVideos.asArray;

        // Adds extra field on the series (the episodes / videos by id)
        series.videosById = episodesAsVideos.asObjectById;
    }

    return series;
}

async function podcastsToSerieses(podcasts, origin) {
    let serieses = {
        asArray: [],
        asObjectById: {}
    };

    for (let i = 0; i < podcasts.length; i++) {
        let currentSeries = await podcastToSeries(podcasts[i], origin);

        serieses.asArray.push(currentSeries);
        serieses.asObjectById[podcasts[i].id] = currentSeries;
    }

    return serieses;
}

function generateAwards(explicit_content, is_claimed) {
    let awards = "Explicit Content: X | ";

    if (explicit_content) {
        awards = "Explicit Content: V | "
    }

    awards += "Claimed: ";

    if (is_claimed) {
        awards += "V"
    } else {
        awards += "X"
    }

    return (awards);
}

function generateBasicGenres(podcast) {
    let language = "<b>Country: </b>";
    let country = "<b>Language: </b>";
    let nextEpisode = "<b>Next Episode: </b>";
    let numOfEpisodes = "<b>Number of Episodes: </b>";

    let basicGenres = ["<em>" + constants.API_CONSTANTS.STREAMS_TITLES.LISTEN_NOTES_STREAM_TITLE + "</em>"]

    if (podcast.total_episodes) basicGenres.push(numOfEpisodes += podcast.total_episodes);
    if (podcast.country) basicGenres.push(country += podcast.country);
    if (podcast.language) basicGenres.push(language += podcast.language);
    if (podcast.nextEpisode) basicGenres.push(nextEpisode += new Date(podcast.next_episode_pub_date).toDateString());
    if (podcast.explicit_content) basicGenres.push("<b><var>* Notice! Explicit Contact</var></b>")

    return basicGenres;
}

function generateReleaseInfo(oldestEpisodeTime, newestEpisodeTime) {
    let oldestEpisodeYear = (new Date(oldestEpisodeTime)).getFullYear();
    let newestEpisosdeYear = (new Date(newestEpisodeTime)).getFullYear();
    let releaseInfo = oldestEpisodeYear + "-" + newestEpisosdeYear;
    if (oldestEpisodeYear === newestEpisosdeYear) {

        releaseInfo = oldestEpisodeYear;
    }

    return releaseInfo;
}

function podcastToSeriesVideo(podcast) {
    let series = {
        id: podcast.id,
        title: podcast.title,
        thumbnail: podcast.thumbnail,
        available: true,
        trailer: podcast.youtube_url,
        overview: podcast.description
    };

    if (podcast.earliest_pub_date_ms)
        series.released = (new Date(podcast.earliest_pub_date_ms)).toISOString();

    return series;
}

function getStreamsFromEpisode(episode) {
    let streams = [{
        url: episode.audio,
        title: constants.API_CONSTANTS.STREAMS_TITLES.DEFAULT_STREAM_TITLE
    },
        {
            externalUrl: episode.listennotes_url,
            title: constants.API_CONSTANTS.STREAMS_TITLES.LISTEN_NOTES_STREAM_TITLE
        }
    ];

    if (episode.podcast.website) streams.push({
        externalUrl: episode.podcast.website,
        title: constants.API_CONSTANTS.STREAMS_TITLES.WEBSITE_STREAM_TITLE
    });

    if (episode.podcast.rss) streams.push({
        externalUrl: episode.podcast.rss,
        title: constants.API_CONSTANTS.STREAMS_TITLES.RSS_STREAM_TITLE
    });

    if (episode.podcast.extra.youtube_url) streams.push({
        ytid: episode.podcast.extra.youtube_url.split("?v=")[1],
        title: constants.API_CONSTANTS.STREAMS_TITLES.YOUTUBE_STREAM_TITLE
    });

    if (episode.podcast.extra.spotify_url) streams.push({
        externalUrl: episode.podcast.extra.spotify_url,
        title: constants.API_CONSTANTS.STREAMS_TITLES.SPOTIFY_STREAM_TITLE
    });

    if (episode.podcast.extra.facebook_handle) streams.push({
        externalUrl: constants.API_CONSTANTS.FACEBOOK_BASE_URL + episode.podcast.extra.facebook_handle,
        title: constants.API_CONSTANTS.STREAMS_TITLES.FACEBOOK_STREAM_TITLE
    });

    if (episode.podcast.extra.twitter_handle) streams.push({
        externalUrl: constants.API_CONSTANTS.TWITTER_BASE_URL + episode.podcast.extra.twitter_handle,
        title: constants.API_CONSTANTS.STREAMS_TITLES.TWITTER_STREAM_TITLE
    });

    if (episode.podcast.extra.instagram_handle) streams.push({
        externalUrl: constants.API_CONSTANTS.INSTAGRAM_BASE_URL + episode.podcast.extra.instagram_handle,
        title: constants.API_CONSTANTS.STREAMS_TITLES.INSTAGRAM_STREAM_TITLE
    });

    return streams;
}

function luckyPodcastToPodcast(luckyPodcast) {
    return {
        id: luckyPodcast.podcast_id,
        title: luckyPodcast.podcast_title,
        publisher: luckyPodcast.publisher,
        explicit_content: luckyPodcast.explicit_content,
        thumbnail: luckyPodcast.thumbnail,
        image: luckyPodcast.image,
        listennotes_url: luckyPodcast.listennotes_url,
        description: "Lucky people go all the way in!"
    };
}

module.exports = {
    podcastsToSerieses,
    podcastToSeries,
    podcastToSeriesVideo,
    getStreamsFromEpisode,
    luckyPodcastToPodcast
};