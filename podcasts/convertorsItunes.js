const logger = require("../common/logger");
const constants = require("../common/const");

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
        id: constants.ID_PREFIX + (episode.guid._cdata ? episode.guid._cdata : episode.guid._text ),
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
        overview: episode.itunes_summary._text
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

async function podcastToSeries(podcast) {

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
            genres: podcast.genres,
            posterShape: "regular",
            background: largeImg,
            logo: constants.ADDON_LOGO,
            //description: podcast.description,
            director: [podcast.artistName],
            released: released,
            inTheaters: true,
            //language: podcast.language,
            country: podcast.country,
            awards: generateAwards(podcast.collectionExplicitness),
            website: podcast.collectionViewUrl
        };
    // }

    return series;
};

async function podcastsToSerieses(podcasts, origin) {

    let serieses = []

    for (let i = 0; i < podcasts.length; i++){

        let series = await podcastToSeries(podcasts[i]);
        serieses.push(series);
    }

    return (serieses);
}
/*
function generateReleaseInfo(oldestEpisodeTime, newestEpisodeTime) {

    return releaseInfo;
}

function podcastToSeriesVideo(podcast) {
    return series;
}*/

module.exports = {
    episodesToVideos,
    addPodcastIdToItunesEpisodes,
    fixJsons,
    podcastsToSerieses
};