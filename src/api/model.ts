import { createEffect } from "effector";
import { FilmPosterRaw, FilmRaw } from "./types";

const FILM_BASE = 'http://www.omdbapi.com/?t=Batman&apikey=93aa9ed3'
const POSTER_BASE = 'https://api.themoviedb.org/3/search/movie?api_key=714b1da2cb933bf9f1d4c63b46016c24&query=Batman&page=1&include_adult=true'

export const getFilmDataFx = createEffect<void, FilmRaw>(async () => {
    const req = await fetch(FILM_BASE)
    return req.json()
})


export const getFilmPosterFx = createEffect<void, FilmPosterRaw>(async () => {
    const req = await fetch(POSTER_BASE)
    return req.json()
})