const logger = require("../common/logger");
const constants = require("../common/const");
const genres = require("../resources/genres");

// Translate genre ids to to names
function getGenresStringsFromArray(ids) {
    let genresStrings = [];
    let genresById = createPodcastGenresById(genres.genres);
    if (Array.isArray(ids)) {
        ids.forEach(function (id) {
            genresStrings.push(genresById[id].name.replace(" & ", " and "));
        });
    } else {
        genresStrings.push(genresById[id].name.replace(" & ", " and "));
    }

    logger.debug(constants.LOG_MESSAGES.SUCCESS_TRANSLATE_GENRES_IDS_TO_NAMES + genresStrings.length, constants.HANDLERS.CONVERTOR, constants.CATALOGS.BY_GENRE.NAME, null, null, {length: genresStrings.length});
    return genresStrings.sort();
}

// Translate genre names to to ids
function getGenresIdsFromArray(genres) {
    let genresIds = [];
    genres.forEach(function (genre) {
        genresIds.push(genre.id);
    });

    logger.debug(constants.LOG_MESSAGES.SUCCESS_TRANSLATE_GENRES_NAMES_TO_IDS + genresIds.length, constants.HANDLERS.CONVERTOR, constants.CATALOGS.BY_GENRE.NAME, null, null, {length: genresIds.length});
    return getGenresStringsFromArray(genresIds);
}

// Use only once for creating a genres object by id
function createPodcastGenresById(genres) {
    let genresById = {};
    genres.forEach(function (genre) {
        genresById[genre.id] = genre;
    });

    logger.debug(constants.LOG_MESSAGES.INIT_GENRES_BY_ID_OBJECT + genres.length, constants.HANDLERS.CONVERTOR, constants.CATALOGS.BY_GENRE.NAME, null, null, {length: genres.length});
    return genresById;
}

function findGenreId(genreName) {
    let genreFounded = false;
    let genreCount = 0;
    let genreId = 0;

    while (!genreFounded) {
        if (genres.genres[genreCount].name.toLowerCase().replace(" & ", " and ") === genreName.toLowerCase().replace(" & ", " and ")) {
            genreId = genres.genres[genreCount].id;
            genreFounded = true;

            logger.debug(constants.LOG_MESSAGES.SUCCESS_FIND_GENRE_BY_ID + genreName + " - " + genreId, constants.HANDLERS.CONVERTOR, constants.CATALOGS.BY_GENRE.NAME, null, 1, {genre: genreName});
        }

        genreCount++;
    }

    return genreId;
}

module.exports = {
    createPodcastGenresById,
    getGenresStringsFromArray,
    getGenresIdsFromArray,
    findGenreId
};