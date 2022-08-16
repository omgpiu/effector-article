# Sending data, split events

## Practice makes perfect
### Task: Create a function to send data so API.

You know this guy - effect, and in this part we are going to use it for some dirty thing as sending data. Mock with
Promise
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

I created a few events, stores for textarea and badge. $badge contains title and color for dynamic changing info under
rating component.

## A little new info about stores
### Task: Reset stores when flow is finished

I added a new thing - [reset for  stores](https://effector.dev/docs/api/effector/store#resettriggersarray). This one
helps us to reset stores value to default state.
Reset is a store's method. Put there any event and when this event triggers you store gets default/init value.
I usually use it when left the page or send some data and have to reset all form fields.

How work with it?

1) Create average event.
2) Pass this event in reset method.
3) Trigger you event anywhere. In sample as a target or do imperative call resetFormStores();

In this case when sendFeedback runs, sample will trigger array of my events. resetRatingStores and resetFormStores -
they will trigger reset methods in there's stores and stores get initial/default values.

```ts
const resetFormStores = createEvent();
export const $feedbackText = createStore('').reset(resetFormStores)


sample({
    clock: sendFeedback,
    target: [resetRatingStores, resetFormStores]
})


```

## New a new feature - [Split](https://effector.dev/docs/api/effector/split/)
### Task: split  flow to send data

Look, when you need conditional logic it's better to use split.
Two important objects in split. Matches and cases - you must name methods equals. In matches object you do some checking
and if this method return true,
it will trigger method with the same name/title in cases object.

How it works here?

1) Somewhere I trigger sendFeedback
2) Also, I take $rating as a source
3) In match object I created two methods for checking is rating more 0?
4) If rating not equals 0, that means in case object split will trigger method with the same name as in the match
   object.
   Method sendSuccess returns true, it means method sendSuccess in cases object will be triggered.

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
### Task: Provide data from stores and inputs to sending data func

Let's have a look for this a big one sample. You can see the difference with samples we used before. This one is a
little bit complicated.
Main thing here, that you can pass object or array in source to get data in fn() below.

Again, go step by step.

1) When somewhere or somehow sendSuccess event fires , it will trigger clock in sample
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
## Two more simple samples
### Task: if I select any rating ( rating > 0 ) and press the star  it should not change color and text in badge when I hover any star.

Even if there isn't the clock in sample, you can use source for it. When any of these stores changes, it will run this
sample.

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

### Task: when select rating by click on star, change color and text in badge

I hope you understand what is going on here. One small thing may confuse you.

This one 
```ts
filter: Boolean,
``` 
is the same 
```ts
filter:(rating)=> Boolean(rating),
``` 
But you can use it only when you have only one clock or one source to check exactly their payload. If this Boolean(payload from clock/source) => true => fn and target will run.

```ts 
sample({
    source: $rating,
    filter: Boolean,
    fn: (rating) => BADGE_INFO[rating],
    target: $badge,
});


```

You can rewrite these two sample above for split and events, but in would be more code and so hard for lazy guy as me.
