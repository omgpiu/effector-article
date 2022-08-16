import { $film } from "./model";
import { useStore } from "effector-react";


export const Film = () => {

    const film = useStore($film)
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