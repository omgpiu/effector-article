interface Result {
    original_title:string
    overview:string
    popularity:number
    poster_path:string
    id:number
}

export interface FilmRaw {
    Title: string,
    Year: number,
    Language: string
}

export interface FilmPosterRaw {
    page: number,
    results: Result[]
}

export interface Feedback {
    text: string
    rating: number
    id: number
    isReject?:boolean
}

