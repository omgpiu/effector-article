import { createEvent, createStore, sample, split } from "effector";
import { sendFeedbackFx } from "../api/model";
import { $hover, $rating, resetRatingStores } from "../rating/model";
import { $film } from "../film/model";
import { BADGE_INFO, SEND_ERROR_DATA } from "./constants";

//events
export const setFeedbackText = createEvent<string>()
export const sendFeedback = createEvent()

//local events
const sendSuccess = createEvent();
const sendFail = createEvent();
const resetFormStores = createEvent();

//stores
export const $feedbackText = createStore('').reset(resetFormStores)
export const $badge = createStore(BADGE_INFO[0]).reset(resetFormStores)

//connection
$feedbackText.on(setFeedbackText, (_, text) => text);

sample({
    source: $rating,
    filter: Boolean,
    fn: (rating) => BADGE_INFO[rating],
    target: $badge,
});


sample({
    source: {
        rating: $rating,
        hovered: $hover,
    },
    filter: ({rating}) => !rating,
    fn: ({hovered}) => BADGE_INFO[hovered],
    target: $badge,
});


split({
    clock: sendFeedback,
    source: $rating,
    match: {
        sendSuccess: (rating) => rating !==  0,
        sendFail: (rating) => rating === 0,
    },
    cases: {
        sendSuccess,
        sendFail,
    }
})


sample({
    clock: sendSuccess,
    source: {
        rating: $rating,
        feedback: $feedbackText,
        film: $film,
    },
    fn: ({feedback, rating, film}) => {
        return {
            text: feedback,
            id: film!.id,
            rating,
            isReject: false
        }
    },
    target: sendFeedbackFx
})


sample({
    clock: sendFail,
    fn: () => SEND_ERROR_DATA,
    target: $badge
})

sample({
    clock: sendFeedback,
    target: [resetRatingStores, resetFormStores]
})


