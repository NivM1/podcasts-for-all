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

function fixJsons(objs) {

    if (!Array.isArray(objs))
        return fixJson(objs);

    let newObjs = [];
    objs.forEach(obj => {
        newObjs.push(fixJson(obj));
    });

    return (newObjs);
}

function addPodcastIdToItunesEpisodes(episodes, podcastId) {

    newEpisodes = [];
    episodes.forEach(episode => {

        episode.id = episode.id + "|" + podcastId;
        newEpisodes.push(episode);
    });

    return (newEpisodes);
}

// All functions that convert podcast or episode object to Stremio object
function episodeToVideo(episode, episodeNumber) {
    return {
        id: constants.ID_PREFIX + (episode.guid._cdata ? episode.guid._cdata : episode.guid._text),
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

function episodesToVideos(episodes) {

    let videos = {
        asArray: [],
        asObjectById: {}
    };
    let episodeNumber = 1;

    episodes = fixJsons(episodes);
    episodes.forEach(episode => {
        let currentVideo = episodeToVideo(episode, episodeNumber);

        episodeNumber++;

        videos.asArray.push(currentVideo);

        if (episode.guid._cdata)
            videos.asObjectById[episode.guid._cdata] = currentVideo;
        else {
            videos.asObjectById[episode.guid._text] = currentVideo;
        }
    });

    return videos;
}

function generateAwards(explicit_content) {
    let awards = "Explicit Content: " + explicit_content;

    return (awards);
};

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

function podcastToSeriesVideo(podcast) {
    let series = {
        id: podcast.collectionId,
        title: podcast.collectionName,
        thumbnail: podcast.artworkUrl60,
        available: true,
        trailer: podcast.youtube_url
    };

    return series;
}

function getStreamsFromEpisode(episode) {
    let streams = [{
        url: episode.audio,
        title: constants.API_CONSTANTS.STREAMS_TITLES.DEFAULT_STREAM_TITLE
    }];

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

    let series = {};

    series = {
        id: constants.ID_PREFIX + podcast.collectionId,
        type: "series",
        name: podcast.collectionName,
        poster: smallImg,
        genres: getAttributesTitle(podcast.country, podcast.genres, podcast.trackCount),
        posterShape: "regular",
        background: largeImg,
        logo: constants.ADDON_LOGO,
        description: "The podcast " + podcast.collectionName + " by " + podcast.artistName + ", from " + podcast.country + " released at: " + released,
        director: [podcast.artistName],
        released: released,
        inTheaters: true,
        country: podcast.country,
        awards: generateAwards(podcast.collectionExplicitness),
        website: podcast.collectionViewUrl
    };

    let episodesAsVideos = {};
    const allEpisodes = await podcastsApiItunes.getEpisodesByPodcastId(podcast.feedUrl);
    if (!Array.isArray(allEpisodes)) {


    }
    else {
        episodesAsVideos = episodesToVideos(allEpisodes);
        episodesAsVideos.asArray = addPodcastIdToItunesEpisodes(episodesAsVideos.asArray, podcast.collectionId);
    }

    series.videos = episodesAsVideos.asArray;

    // Adds extra field on the series (the episodes / videos by id)
    series.videosById = episodesAsVideos.asObjectById;

    return series;
};

const getStremioMetaFromPodcast = async function (podcast) {

    const podcastMeta = await podcastToFullSeries(podcast);
    return stremioConvertor.getStremioMeta(podcastMeta, podcastMeta.videos);

    // return {
    //     meta: await convertorsItunes.podcastToFullSeries(podcast),
    //     video: convertorsItunes.podcastToSeriesVideo(podcast)
    // };
};

module.exports = {
    podcastToFullSeries,
    episodesToVideos,
    podcastToSeriesVideo,
    podcastToSeries,
    getStreamsFromEpisode,
    getStremioMetaFromPodcast,
};