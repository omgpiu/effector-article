export interface FilmRaw {
    Title: string,
    Year: number,
    Language: string
}

interface Result {
    original_title:string
    overview:string
    popularity:number
    poster_path:string
}

export interface FilmPosterRaw {
    page: number,
    results: Result[]
}