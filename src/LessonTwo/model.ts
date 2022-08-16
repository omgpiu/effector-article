import { combine, restore, sample } from "effector";
import { pending } from "patronum";
import { createGate } from "effector-react";
import { getFilmDataFx, getFilmPosterFx } from "../api/model";
import { FilmPosterRaw, FilmRaw } from "../api/types";

//gate
export const FilmGate = createGate('FilmGate')

//events

const $filmRawData = restore<FilmRaw>(getFilmDataFx, null)
const $posterRawData = restore<FilmPosterRaw>(getFilmPosterFx, null)

//actions

sample({
    clock: FilmGate.open,
    target: [getFilmDataFx, getFilmPosterFx]
})


export const $film = combine($filmRawData, $posterRawData, (film, poster) => {
    if (film && poster) {
        const title = film.Title
        const posterByTitle = poster.results.find(e => e.original_title === title)!
        return {
            title,
            img: 'https://image.tmdb.org/t/p/w200' + posterByTitle.poster_path,
            year: film.Year,
            popularity: posterByTitle.popularity,
            language: film.Language,
            overview: posterByTitle.overview,
            id:posterByTitle.id
        }
    }
    return null
})

//with patronum

export const $isPending = pending(
    {effects: [getFilmDataFx, getFilmPosterFx]}
)


// export const $film = createStore<Film | null>(null)
//

// const event = combineEvents({
//     events: {
//         film: getFilmDataFx.doneData,
//         poster: getFilmPosterFx.doneData
//     },
// })


// sample({
//     clock: event,
//     fn: ({film,poster}) => {
//         const title = film.Title
//         const posterByTitle = poster.results.find(e => e.original_title === title)!
//         return {
//             title,
//             img: 'https://image.tmdb.org/t/p/w200' + posterByTitle.poster_path,
//             year: film.Year,
//             popularity: posterByTitle.popularity,
//             language: film.Language,
//             overview: posterByTitle.overview
//         }
//     },
//     target: $film
// })

