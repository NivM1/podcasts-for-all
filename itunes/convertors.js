const logger = require("../common/logger");
const constants = require("../common/const");
const podcastsApiItunes = require("../itunes/api");
const stremioConvertor = require('../common/stremioConvertor');

function fixJson(obj) {

    var newObj = obj;
    for (var p in obj) {
        if (obj.hasOwnProperty(p) && p.includes(":")) {

            let parts = p.split(":");
            newObj[parts[0] + "_" + parts[1]] = obj[p];
        }
    }

    return newObj;
}

// All functions that convert podcast or episode object to Stremio object
function episodeToVideo(episode, episodeNumber, feedUrl) {

    episode = fixJson(episode);

    return {
        id: constants.ID_PREFIX + constants.ITUNES_ID_PREFIX + feedUrl + constants.ITUNES_EPISODE_ID_SEPARATOR + (episode.guid._cdata ? episode.guid._cdata : episode.guid._text),
        title: episode.title._text,
        released: episode.pubDate._text,
        thumbnail: (episode.itunes_image ? episode.itunes_image._attributes.href : constants.ADDON_BACKGROUND),
        streams: [{
            url: episode.enclosure._attributes.url
        }],
        audio: episode.enclosure._attributes.url,
        available: true,
        episode: episodeNumber,
        season: 1
    };
}

function generateAwards(explicit_content) {
    let awards = "Explicit Content: " + explicit_content;

    return (awards);
}

function podcastToSeries(podcast) {

    let released = "";
    if (podcast.releaseDate) released = podcast.releaseDate;

    let smallImg;
    let largeImg;
    if (podcast.artworkUrl100) smallImg = podcast.artworkUrl100;
    if (podcast.artworkUrl160) largeImg = podcast.artworkUrl160;

    if (!podcast.artworkUrl160) {
        largeImg = smallImg;
    }

    const series = stremioConvertor.getStremioSeries(
        constants.ITUNES_ID_PREFIX + podcast.collectionId,
        podcast.collectionName,
        smallImg,
        getAttributesTitle(podcast.country, podcast.genres, podcast.trackCount),
        largeImg,
        "The podcast " + podcast.collectionName + " by " + podcast.artistName + ", from " + podcast.country + " released at: " + released,
        podcast.artistName,
        released,
        null,
        podcast.country,
        generateAwards(podcast.collectionExplicitness),
        podcast.collectionViewUrl
    );

    return series;
}

function getAttributesTitle(country, genres, numOfEpisodes, lastEpisodeDuration) {
    let countryTitle = "<b>Country: </b>";
    let attributesTitles = ["<em>" + constants.API_CONSTANTS.STREAMS_TITLES.ITUNES_STREAM_TITLE + "</em>"]
    attributesTitles.push(countryTitle += country);

    if (numOfEpisodes) {
        let numOfEpisodesTitle = "<b>Numer of episodes: </b>";
        attributesTitles.push(numOfEpisodesTitle += numOfEpisodes);
    }

    if (lastEpisodeDuration) {
        let lastEpisodeDurationTitle = "<b>Last episode duration: </b>";
        attributesTitles.push(lastEpisodeDurationTitle += lastEpisodeDuration);
    }

    genresTitle = "<b>Genres: </b>";
    genres.forEach(genre => {

        genresTitle += genre + " | "
    });
    attributesTitles.push(genresTitle);

    return (attributesTitles)
}

function getEpisodeFromVideos(episodes, episodeGuid) {

    let found = false;
    let counter = 0;
    let episode;

    while (!found && counter < episodes.length) {

        if (episodes[counter].guid._text === episodeGuid) {

            episode = episodes[counter];
            found = true;
        }

        counter++;
    }

    return episode;
}

function getStreamsFromEpisode(episodes, episodeGuid, feedUrl) {
    let episode = {};
    if (!Array.isArray(episodes)) {
        episode = episodes;
    } else {
        episode = getEpisodeFromVideos(episodes, episodeGuid);
    }

    const video = episodeToVideo(episode);
    const streams = stremioConvertor.getStreamioStreams([
        stremioConvertor.getStremioStream(video.audio, null, constants.API_CONSTANTS.STREAMS_TITLES.DEFAULT_STREAM_TITLE)
    ]);

    if (episode.link && episode.link._text) {
        streams.streams.push(stremioConvertor.getStremioStream(null, episode.link._text, 'Listen on External Site'));
    }

    return streams;
}

const podcastToFullSeries = async function (podcast) {
    let released = "";
    if (podcast.releaseDate) released = podcast.releaseDate;

    let smallImg;
    let largeImg;
    if (podcast.artworkUrl100) smallImg = podcast.artworkUrl100;
    if (podcast.artworkUrl160) largeImg = podcast.artworkUrl160;

    if (!podcast.artworkUrl160) {
        largeImg = smallImg;
    }

    let episodesAsVideos = [];
    const allEpisodes = await podcastsApiItunes.getEpisodesByPodcastId(podcast.feedUrl);
    if (!Array.isArray(allEpisodes)) {
        episodesAsVideos.push(episodeToVideo(allEpisodes, 1, podcast.feedUrl));
    } else {
        episodesAsVideos = allEpisodes.map((x, i) => episodeToVideo(x, i, podcast.feedUrl));
    }

    const series = stremioConvertor.getStremioSeries(
        constants.ITUNES_ID_PREFIX + podcast.collectionId,
        podcast.collectionName,
        smallImg,
        getAttributesTitle(podcast.country, podcast.genres, podcast.trackCount),
        largeImg,
        "The podcast " + podcast.collectionName + " by " + podcast.artistName + ", from " + podcast.country + " released at: " + released,
        podcast.artistName,
        released,
        null,
        podcast.country,
        generateAwards(podcast.collectionExplicitness),
        podcast.collectionViewUrl,
        null,
        null,
        episodesAsVideos
    );

    return series;
};

const getStremioMetaFromPodcast = async function (podcast) {

    const podcastMeta = await podcastToFullSeries(podcast);
    return stremioConvertor.getStremioMeta(podcastMeta);
};

module.exports = {
    podcastToFullSeries,
    podcastToSeries,
    getStreamsFromEpisode,
    getStremioMetaFromPodcast,
};