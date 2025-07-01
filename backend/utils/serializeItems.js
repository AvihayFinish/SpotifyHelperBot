export function serializePodcastResult (items) {
    return items.map((item) => ({
        id: item.id,
        name: item.name,
        publisher: item.publisher,
        description: item.description,
    }));
}

export function serializeEpisodesResult (episodes) {
    return episodes.map((episode) => ({
        id: episode.id,
        name: episode.name,
        description: episode.description,
        release_date: episode.release_date,
    }));
}

export function serializedArtistsResult (items) {
    return items.map((item) => ({
        id: item.id,
        name: item.name,
        popularity: item.popularity,
        genres: item.genres,
    }));
}
