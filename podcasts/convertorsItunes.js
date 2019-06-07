const logger = require("../common/logger");
const constants = require("../common/const");
const podcastsApiItunes = require("../common/podcastsApiItunes");

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

    let newObjs = [];
    objs.forEach(obj => {
        newObjs.push(fixJson(obj));
    })

    return (newObjs);
}

function addPodcastIdToItunesEpisodes(episodes, podcastId) {

    newEpisodes = []
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
        //released: (new Date(episode.pubDate._text)).toISOString(),
        released: episode.pubDate._text,
        thumbnail: (episode.itunes_image ? episode.itunes_image._attributes.href : constants.ADDON_BACKGROUND),
        streams: [{
            url: episode.enclosure._attributes.url
        }],
        audio: episode.enclosure._attributes.url,
        available: true,
        episode: episodeNumber,
        season: 1,
        //overview: episode.itunes_summary._text
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

async function podcastToSeries(podcast, origin) {

    let released = "";
    if (podcast.releaseDate) released = podcast.releaseDate;

    //{"wrapperType":"track", "kind":"podcast", "collectionId":1443666680, "trackId":1443666680, "artistName":"Our Americana Podcast Network", "collectionName":"True Crime Bullsh**: The Story of Israel Keyes", "trackName":"True Crime Bullsh**: The Story of Israel Keyes", "collectionCensoredName":"True Crime Bullsh**: The Story of Israel Keyes", "trackCensoredName":"True Crime Bullsh**: The Story of Israel Keyes", "collectionViewUrl":"https://podcasts.apple.com/us/podcast/true-crime-bullsh-the-story-of-israel-keyes/id1443666680?uo=4", "feedUrl":"https://truecrimebs.podbean.com/feed.xml", "trackViewUrl":"https://podcasts.apple.com/us/podcast/true-crime-bullsh-the-story-of-israel-keyes/id1443666680?uo=4", "artworkUrl30":"https://is5-ssl.mzstatic.com/image/thumb/Music123/v4/e4/01/b8/e401b8ba-2e09-c857-661a-226b19638261/source/30x30bb.jpg", "artworkUrl60":"https://is5-ssl.mzstatic.com/image/thumb/Music123/v4/e4/01/b8/e401b8ba-2e09-c857-661a-226b19638261/source/60x60bb.jpg", "artworkUrl100":"https://is5-ssl.mzstatic.com/image/thumb/Music123/v4/e4/01/b8/e401b8ba-2e09-c857-661a-226b19638261/source/100x100bb.jpg", "collectionPrice":0.00, "trackPrice":0.00, "trackRentalPrice":0, "collectionHdPrice":0, "trackHdPrice":0, "trackHdRentalPrice":0, "releaseDate":"2019-05-31T04:36:00Z", "collectionExplicitness":"explicit", "trackExplicitness":"explicit", "trackCount":20, "country":"USA", "currency":"USD", "primaryGenreName":"Society & Culture", "contentAdvisoryRating":"Explicit", "artworkUrl600":"https://is5-ssl.mzstatic.com/image/thumb/Music123/v4/e4/01/b8/e401b8ba-2e09-c857-661a-226b19638261/source/600x600bb.jpg", "genreIds":["1324", "26"], "genres":["Society & Culture", "Podcasts"]}, 

    let smallImg;
    let largeImg;
    if (podcast.artworkUrl100) smallImg = podcast.artworkUrl100
    if (podcast.artworkUrl160) largeImg = podcast.artworkUrl160

    if (!podcast.artworkUrl160) {
        largeImg = smallImg;
    }

    let series = {};
    // if (origin === constants.PODCAST_TYPE.SEARCH) {
    //     series = {
    //         id: constants.ID_PREFIX + podcast.collectionId,
    //         type: "series",
    //         name: podcast.collectionName,
    //         poster: smallImg,
    //         genres: podcast.genres,
    //         posterShape: "regular",
    //         background: bigImg,
    //         logo: constants.ADDON_LOGO,
    //         //description: podcast.description_original,
    //         director: [podcast.artistName],
    //         released: released,
    //         inTheaters: true,
    //     };
    // }
    // else {
    series = {
        id: constants.ID_PREFIX + podcast.collectionId,
        type: "series",
        name: podcast.collectionName,
        poster: smallImg,
        genres: getAttributesTitle(podcast.country, podcast.genres),
        posterShape: "regular",
        background: largeImg,
        logo: constants.ADDON_LOGO,
        description: "The podcast " + podcast.collectionName + " by " + podcast.artistName + ", from " + podcast.country + " released at: " + released,
        director: [podcast.artistName],
        released: released,
        inTheaters: true,
        //language: podcast.language,
        country: podcast.country,
        awards: generateAwards(podcast.collectionExplicitness),
        website: podcast.collectionViewUrl
    };
    // }

    if (podcast.earliest_pub_date_ms || podcast.latest_pub_date_ms) {
        series.releaseInfo = generateReleaseInfo(podcast.earliest_pub_date_ms, podcast.latest_pub_date_ms)
    }

    // Sets series parameters if there is episodes to the podcast
    series.runtime = "Avg episode length: 25" + " min     | ";

    let episodesAsVideos = {};
    if (origin != "catalog") {

        const allEpisodes = await podcastsApiItunes.getEpisodesByPodcastId(podcast.collectionId);

        episodesAsVideos = episodesToVideos(fixJsons(allEpisodes));
        episodesAsVideos.asArray = addPodcastIdToItunesEpisodes(episodesAsVideos.asArray, podcast.collectionId);

        series.videos = episodesAsVideos.asArray;

        // Adds extra field on the series (the episodes / videos by id)
        series.videosById = episodesAsVideos.asObjectById;
    }


    return series;
};

function getAttributesTitle(country, genres){
    let countryTitle = "<b>Country: </b>";
    let attributesTitles = ["<em>" + constants.API_CONSTANTS.STREAMS_TITLES.ITUNES_STREAM_TITLE + "</em>"]
    attributesTitles.push(countryTitle += country);
    
    genresTitle = "<b>Genres: </b>";
    genres.forEach(genre => {

        genresTitle += genre + " | "
    });
    attributesTitles.push(genresTitle);

    return (attributesTitles)
}

async function podcastsToSerieses(podcasts, origin) {

    let serieses = []

    for (let i = 0; i < podcasts.length; i++) {

        let series = await podcastToSeries(podcasts[i], origin);
        serieses.push(series);
    }

    return (serieses);
}
/*
function generateReleaseInfo(oldestEpisodeTime, newestEpisodeTime) {

    return releaseInfo;
}*/

function podcastToSeriesVideo(podcast) {
    let series = {
        id: podcast.collectionId,
        title: podcast.collectionName,
        thumbnail: podcast.artworkUrl60,
        available: true,
        trailer: podcast.youtube_url,
        //overview: podcast.description
    };

    if (podcast.earliest_pub_date_ms)
        series.released = (new Date(podcast.earliest_pub_date_ms)).toISOString();

    return series;
}

function getStreamsFromEpisode(episode) {
    let streams = [{
        url: episode.audio,
        title: constants.API_CONSTANTS.STREAMS_TITLES.DEFAULT_STREAM_TITLE
    }];

    if (process.env.USE_ITUNES === "true"){

        return (streams);
    }

    streams.push(
        {
            externalUrl: episode.listennotes_url,
            title: constants.API_CONSTANTS.STREAMS_TITLES.LISTEN_NOTES_STREAM_TITLE
        });

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

module.exports = {
    episodesToVideos,
    addPodcastIdToItunesEpisodes,
    fixJsons,
    podcastsToSerieses,
    podcastToSeriesVideo,
    podcastToSeries,
    getStreamsFromEpisode
};