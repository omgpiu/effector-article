import { combine, restore } from 'effector'
import { getFilmDataFx, getFilmPosterFx } from '../api/model'
import { FilmPosterRaw, FilmRaw } from '../api/types'

//events
const $filmRawData = restore<FilmRaw>(getFilmDataFx, null)
const $posterRawData = restore<FilmPosterRaw>(getFilmPosterFx, null)

export const $film = combine($filmRawData, $posterRawData, (film, poster) => {
  if (film && poster) {
    const title = film.Title
    const posterByTitle = poster.results.find((e) => e.original_title === title)!
    return {
      title,
      img: 'https://image.tmdb.org/t/p/w200' + posterByTitle.poster_path,
      year: film.Year,
      popularity: posterByTitle.popularity,
      language: film.Language,
      overview: posterByTitle.overview,
      id: posterByTitle.id,
    }
  }
  return null
})

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
