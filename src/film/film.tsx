import { $film, $isPending, FilmGate } from "./model";
import { useGate, useStore } from "effector-react";


export const Film = () => {
    useGate(FilmGate)
    const film = useStore($film)
    const isLoading = useStore($isPending)
    if (isLoading) return <div>Loading....</div>
    if (!film) return null
    return <div>
        <div>
            {film.title}
        </div>

        <div>
            <img src={film.img} alt={film.title}/>
        </div>
        <div>
            {film.year}
        </div>
        <div>
            {film.language}
        </div>
        <div>
            {film.overview}
        </div>
        <div>
            {film.popularity}
        </div>
    </div>
}