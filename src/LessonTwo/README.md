# Effects, Samples, Gate, Restore and adding logic in stores

### Before we get into it

There are few things you better look throw in effector and patronum docs :

1) [Gate](https://effector.dev/docs/api/effector-vue/gate/)
2) [Sample](https://effector.dev/docs/api/effector/sample)
3) [Effect](https://effector.dev/docs/api/effector/effect)
4) [Restore](https://effector.dev/docs/api/effector/restore)
5) [Combine](https://effector.dev/docs/api/effector/combine)

LessonTwo provides information how we can fetch data, subscribe for opening page and how can we handle data in stores.
Also, I will show how solve some issues with [Effector](https://effector.dev) and easiest way
with [Patronum](https://github.com/effector/patronum).

## Task:

1) Fetch data from different API
2) Combine fetched data
3) Show loader during fetching data.

## Fetch data with [Effect](https://effector.dev/docs/api/effector/effect)

Effect is a container for function with side-effects. Mostly it uses for working with API.
When you make an effect the Best Practice for naming is Fx ending - it shows that's an effect, not event.
There are the most used methods.

1) getFilmPosterFx.done
2) getFilmPosterFx.doneData
3) getFilmPosterFx.fail
4) getFilmPosterFx.pending
5) etc.

All these methods return some data. For example - doneData returns result, done returns arguments which you passed in
effect and result, pending returns true/false, fail again returns arguments and error.

```ts
export const getFilmPosterFx = createEffect<void, FilmPosterRaw>(async () => {
    const req = await fetch(POSTER_BASE)
    return req.json()
})

```

## Use [Gate](https://effector.dev/docs/api/effector-vue/gate/) instead of useEffect

Let's have a look for a new thing - this is a [Gate](https://effector.dev/docs/api/effector-vue/gate/).
This is very useful instrument for subscribing on mounting/unmounting component. With Gate don't need to use useEffect
for subscribe to mount/unmount components.
The result we don't need to make a new event and export it in View.

Instead of this

```tsx
import { useEffect } from "react";

const someEventForTriggerAfterMounting = createEvent();
const someEventForTriggerAfterUnmounting = createEvent();

useEffect(() => {
    someEventForTriggerAfterMounting()
    return () => {
        someEventForTriggerAfterUnmounting()
    }
}, [])
```

use this

```tsx
import { createGate } from "effector-react";

const SomeGate = createGate('Somegate')

useGate(SomeGate)
```

And now we have methods SomeGate.open/SomeGate.close/SomeGate.status/SomeGate.state.

### Connect [Gate](https://effector.dev/docs/api/effector-vue/gate/) and [Sample](https://effector.dev/docs/api/effector/sample) for reactive actions

As you see below it works as:
When FilmGate.open (when our page mounts), we run effects getFilmDataFx and getFilmPosterFx. If you don't need to pass
arguments,or your arguments same, you can use Array with effects to run them.

1) FilmGate.open =>
2) Triggers clock in Sample =>
3) Clock triggers target and pass payload to every element in target's array (in our case we passed void) =>
4) Target runs effects getFilmDataFx and getFilmDataFx with payload from clock.

```ts
sample({
    clock: FilmGate.open,
    target: [getFilmDataFx, getFilmPosterFx]
})


```

## Oh, stores, more stores, I like store's, and you will...

As you see, I added stores with [Restore](https://effector.dev/docs/api/effector/restore).
I used it for fill my stores with data with less code.

You can do similar with model in Rating Component ([LessonOne](src/LessonOne/README.md)) where we subscribe for event
and change state there.
Not bad, but I'm so lazy and fix 2 lines of code for one line with restore.

```ts
import { createStore } from "effector";

const $filmRawData = createStore<FilmRaw>(null)

$filmRawData.on(getFilmDataFx.doneData, (_, payload) => payload)

```

or do this

```ts
const $filmRawData = restore<FilmRaw>(getFilmDataFx, null)
```

It works same as above , but less code.

## [Combine](https://effector.dev/docs/api/effector/combine) stores to combine data

You can do amazing things with [Combine](https://effector.dev/docs/api/effector/combine).
Very simple work - we put stores there, and we have all data from them, and VERY IMPORTANT that if one of those stores
updates (whatever why), combine runs again => we are going to have updated combined store => perfect!

Ok, I need combined data from $filmRawData and $posterRawData.

1) create variable $film
2) use [Combine](https://effector.dev/docs/api/effector/combine)
3) pass stores for combine $filmRawData and $posterRawData
4) pass func as third argument
5) arguments in this func are my stores which I passed before.
6) [Combine](https://effector.dev/docs/api/effector/combine) is a sync func, and I must check do I have data in my stores, if not ,return null and my $film will be store
   with data === null
7) if I have data in stores I do some work and return mapped data.

It works like this:

1) Combined stores
2) When $filmRawData or $posterRawData changed combine will run =>
3) According logic inside it returns what you need

In my case It returns data or null.    
**[Combine](https://effector.dev/docs/api/effector/combine) will run every time when one of these store changed.**

```ts
export const $film = combine($filmRawData, $posterRawData, (film, poster) => {
    if (film && poster) {
        const title = film.Title
        const posterByTitle = poster.results.find(e => e.original_title === title)!
        return {
            title,
            img: 'https://image.tmdb.org/t/p/w200' + posterByTitle.poster_path,
            year: film.Year,
            popularity: posterByTitle.popularity,
            language: film.Language,
            overview: posterByTitle.overview
        }
    }
    return null
})


```

### Don't trigger [Effect](https://effector.dev/docs/api/effector/effect) from UI.

**All data from events/effects will provide to next unit automatically.**

1) We create an event and an effect.
2) Later we somewhere call myEvent with payload - some id as a string.
3) We call myEvent and this action will trigger clock in [Sample](https://effector.dev/docs/api/effector/sample).
4) Clock triggers target, pass payload from myEvent to myEffectFx and run myEffectFx.

```ts
import { createEvent, sample } from "effector";

const myEvent = createEvent<string>()
const myEffectFx = createEffect(async (id: string) => {
    const req = await fetch(`some.web.site/${id}`)
    return req.json()
})

myEvent('card_id-4')

sample({
    clock: myEvent,
    target: myEffectFx
})



```

## Patronum Game - [Pending](https://github.com/effector/patronum#pending), [combineEvents](https://github.com/effector/patronum#combineevents)

Oh shit, here we go again!

1) [Pending](https://github.com/effector/patronum#pending) get effects and return bool - is some in pending or no. Also, there is the reset method, we will return for reset
   a little later with reset stores and also this pending.
2) [combineEvents](https://github.com/effector/patronum#combineevents) gets events and AWAITED when all of them fires.

How it works?  

1) Passed [effects](https://effector.dev/docs/api/effector/effect) getFilmDataFx and getFilmPosterFx in [combineEvents](https://github.com/effector/patronum#combineevents)
2) When getFilmDataFx.doneData and getFilmPosterFx.doneData fires, doesn't matter in what order (doneData means there
   will be data which returns from effect)
3) Then I pass these combined events in clock in Sample
4) When  [combineEvents](https://github.com/effector/patronum#combineevents) runs we trigger clock in sample, and don't forget, we have data in payload from these events named
   as film and poster
5) In [Sample](https://effector.dev/docs/api/effector/sample) we have func witch get arguments from sample clock ( or/and source)
6) Do the same job as in  [Combine](https://effector.dev/docs/api/effector/combine)  above
7) And return result, this result will be passed in target
8) Our target is a store $film
9) We have data in our $film store.

NOTE:  [combineEvents](https://github.com/effector/patronum#combineevents) fires clock only after all effects are fulfilled with doneData method (if it will be fail, effect
has method fail), it means no need to check do we have data or not.

```ts
export const $film = createStore<Film | null>(null)

const event = combineEvents({
    events: {
        film: getFilmDataFx.doneData,
        poster: getFilmPosterFx.doneData
    },
})

sample({
    clock: event,
    fn: ({film, poster}) => {
        const title = film.Title
        const posterByTitle = poster.results.find(e => e.original_title === title)!
        return {
            title,
            img: 'https://image.tmdb.org/t/p/w200' + posterByTitle.poster_path,
            year: film.Year,
            popularity: posterByTitle.popularity,
            language: film.Language,
            overview: posterByTitle.overview
        }
    },
    target: $film,
})
```

