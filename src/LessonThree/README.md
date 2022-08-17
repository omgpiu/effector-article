# Sending data, split events

### Before we start

There is a few things you better look throw in effector and patronum docs :

1) [Split](https://effector.dev/docs/api/effector/split/)
2) [Reset Stores](https://effector.dev/docs/api/effector/store#resettriggersarray)
3) [Effect](https://effector.dev/docs/api/effector/createEffect)

### Practice makes perfect

### Task:

1) Send data to API (or mock API)
2) Reset stores
3) Split flow send or not send data
4) Provide data from stores to events/effects in flow
5) if select any rating ( rating > 0 ) and press the star it should not change color and text in badge when hover any
   star.
6) if rating selected by click , change color and text in badge

You know this guy - [Effect](https://effector.dev/docs/api/effector/createEffect), and in this part we are going to use
it for some dirty thing as sending data. Mocked with
Promise.   
isReject is our bro to help us later to show how to work with done/fail effect methods.
Sometimes it's helpful when you use destructuring arguments to pass data in sample from source to target.

```ts
export const sendFeedbackFx = createEffect(async ({text, rating, id, isReject}: Feedback) => {
    return new Promise((resolve, reject) => {
        console.log(text, rating, id)
        if (isReject) {
            setTimeout(reject, 500)
        } else {
            setTimeout(resolve, 500)
        }
    }).then(() => {
        return 'Feedback was sent!'
    }).catch(() => {
        return 'Feedback was not sent!'
    })
})

```

I created a few events, stores for textarea and badge. $badge contains title and color for dynamic changing info to
communicate with user.
Nothing new, won't stop here.

## Clear them all...

I added a new thing - [reset for  stores](https://effector.dev/docs/api/effector/store#resettriggersarray).
This helps to reset stores value to default (initial) state.
[Reset](https://effector.dev/docs/api/effector/store#resettriggersarray) is a store's method. Put there an event or
array of events and when any of them triggers your store gets default/init value.
I usually use it when left the page or send some data and have to reset all form fields.

How work with it?

1) Create an event.
2) Pass the event/array of events in reset method.
3) Trigger you event anywhere. In [Sample](https://effector.dev/docs/api/effector/sample) as a target or do imperative
   call as resetFormStores();

Workflow:

1) sendFeedbackFx runs
2) Clock in [Sample](https://effector.dev/docs/api/effector/sample) triggers array of events
3) resetRatingStores and resetFormStores triggers reset methods for stores

```ts

const resetFormStores = createEvent();
const resetRatingStores = createEvent();

const $rating = createStore(0).reset(resetRatingStores)
const $feedbackText = createStore('').reset(resetFormStores)


sample({
    clock: sendFeedbackFx,
    target: [resetRatingStores, resetFormStores]
})


```

## [Split](https://effector.dev/docs/api/effector/split/) your work flow!

Look, when you need conditional logic it's better to use [Split](https://effector.dev/docs/api/effector/split/).
Two important objects in split. Matches and cases - you must name methods equals. In matches object you do some checking
and if this method return true, it will trigger method with the same name/title in cases object.

How it works here?

1) Somewhere I trigger sendFeedback event.
2) Also, I take $rating as a source.
3) In match object I created two methods for checking is rating more 0?
4) If rating not equals 0, that means in case object split will trigger method with the same name as in the match
   object.
5) Method sendSuccess returns true, it means method sendSuccess in cases object will be triggered.

```ts

split({
    clock: sendFeedback,
    source: $rating,
    match: {
        sendSuccess: (rating) => Boolean(rating),
        sendFail: (rating) => !Boolean(rating),
    },
    cases: {
        sendSuccess: sendSuccessEvent,
        sendFail: sendFailEvent,
    }
})

```

## Sending data

Let's have a look for this a big one [Sample](https://effector.dev/docs/api/effector/sample). You can see the difference
with samples we used before. This one is a
little bit complicated.
Main thing here, that you can pass object or array in source to get data from stores in fn() below.

Again, go step by step.

1) When somewhere or somehow sendSuccess event fires , it will trigger clock
   in [Sample](https://effector.dev/docs/api/effector/sample)
2) As you can see, we pass object in source. It means now, we can use this data by fields in methods filter and fn.
3) Source pass data to fn and we get it to create an object with fields which we need.
4) We pass in target our created object.

The main thing here - you must pass the same type of data what target event is waiting.
Our sendFeedbackFx is waiting for passing arguments like this ``({text, rating, id, isReject}: Feedback)`` and if you
are going to pass another arguments you are going to have an error.

``
Argument of type '{ clock: Event<void>; source: {
rating: Store<RatingValue>;
feedback: Store<string>;
film: Store<{ title: string; img: string; year: number; popularity: number; language: string; overview: string; id: number; } | null>; };
fn: ({ feedback, rating, film }: { ...; }) => { ...; }; target: Effect<...>; }' is not assignable to parameter of type '{ error: "fn result should extend target type";
targets: { fnResult: { text: string; id: number; isReject: boolean; }; targetType: Feedback; }; }'.
  Object literal may only specify known properties, and 'clock' does not exist in type '
{ error: "fn result should extend target type"; targets: { fnResult: { text: string; id: number; isReject: boolean; }; targetType: Feedback; }; }'.
``

```ts
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
```

## Conditional action in [Sample](https://effector.dev/docs/api/effector/sample) with filter

Even if there isn't the clock in [Sample](https://effector.dev/docs/api/effector/sample), you can use source for it.
When any of these stores changes, it will run this
[Sample](https://effector.dev/docs/api/effector/sample).

1) $rating or $hover changed
2) filter checks is actual rating more than 0
3) If yes, filter returns false, and methods fn and target won't run
4) if no, filter returns true
5) fn get argument as hovered rating and return to target.

```ts
sample({
    source: {
        rating: $rating,
        hovered: $hover,
    },
    filter: ({rating}) => !rating,
    fn: ({hovered}) => BADGE_INFO[hovered],
    target: $badge,
});


```

I hope you understand what is going on here. One small thing may confuse you.

This one

```ts
filter: Boolean,
``` 

is the same

```ts
filter:(rating) => Boolean(rating),
``` 

But you can use it only when you have only one clock or one source to check exactly their payload. If this Boolean(
payload from clock/source) => true => fn and target will run.

```ts 
sample({
    source: $rating,
    filter: Boolean,
    fn: (rating) => BADGE_INFO[rating],
    target: $badge,
});


```

You can rewrite these two [Sample](https://effector.dev/docs/api/effector/sample) above for split and events, but in
would be with more code and so hard for lazy guy as me.

