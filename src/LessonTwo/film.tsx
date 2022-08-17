import { $film, $isPending, FilmGate } from "./model";
import { useGate, useStore } from "effector-react";


export const Film = () => {
    useGate(FilmGate)
    const film = useStore($film)
    const isLoading = useStore($isPending)
    if (isLoading) return <div>Loading....</div>
    if (!film) return null
    return <div>
        {film.title}
        <div>
            <img src={film.img} alt={film.title}/>
        </div>
        <p>Year:</p>
        <span>{film.year}</span>
        <p>Languages:</p>
        <span>{film.language}</span>
        <p>Overview:</p>
        <span>{film.overview}</span>
        <p>
            {film.popularity}
        </p>
    </div>
}