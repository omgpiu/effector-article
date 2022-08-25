import { createEvent, createStore } from 'effector'
import { RatingValue } from '../types'

//events
export const setRating = createEvent<RatingValue>('setRating')
export const setHoveredRating = createEvent<RatingValue>('setHovered')
export const resetRatingStores = createEvent('resetRatingStores')

//stores
export const $hover = createStore<RatingValue>(0, {
  name: 'hover',
}).reset(resetRatingStores)
export const $rating = createStore<RatingValue>(0, {
  name: 'rating',
}).reset(resetRatingStores)

$hover.on(setHoveredRating, (_, rating) => rating)
$rating.on(setRating, (_, rating) => rating)
