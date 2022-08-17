import { createEvent, createStore } from "effector";
import { RatingValue } from "../types";

//events
export const setRating = createEvent<RatingValue>('setRating')
export const setHover = createEvent<RatingValue>('setHover')
export const resetRatingStores = createEvent()


//stores
export const $hover = createStore<RatingValue>(0,{
    name:'hover'
}).reset(resetRatingStores)
export const $rating = createStore<RatingValue>(0,{
    name:'rating'
}).reset(resetRatingStores)

$hover.on(setHover,(_,rating)=>rating)
$rating.on(setRating,(_,rating)=>rating)

