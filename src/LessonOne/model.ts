import { createEvent, createStore } from "effector";
import { debug } from "patronum";

//events
export const setRating = createEvent<number>('setRating')
export const setHoveredRating = createEvent<number>('setHoveredRating')

//stores
export const $hover = createStore<number>(0,{
    name:'hover'
})
export const $rating = createStore<number>(0,{
    name:'rating'
})

$hover.on(setHoveredRating,(_, rating)=>rating)
$rating.on(setRating,(_,rating)=>rating)

debug($hover)
debug($rating)

debug(setHoveredRating)
debug(setRating)