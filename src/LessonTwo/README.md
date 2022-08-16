# Effects, Samples ,Gate , Restore and adding logic in stores

In this part I will show how can we solve some issues with only effector staff and easiest way with Patronum lib.

## Effect

Effect is a container for async function. Mostly it uses for fetching data. 
WHen you make an effect Best Practice for naming is Fx ending - it shows that's an effect, not event.
There is a few methods you must know. 

1) getFilmPosterFx.done 
2) getFilmPosterFx.doneData
3) getFilmPosterFx.fail
4) getFilmPosterFx.pending 
5) etc.

All these methods return some data. For example - doneData returns result, done returns arguments which you passed in effect and result, pending returns true/false, fail again returns arguments and error.

```ts
export const getFilmPosterFx = createEffect<void, FilmPosterRaw>(async () => {
    const req = await fetch(POSTER_BASE)
    return req.json()
})

```
## Use Gate instead of useEffect

Let's have a look for a new thing - this is a [Gate](https://effector.dev/docs/api/effector-vue/gate/).
This is very useful instrument for subscribing  on mounting/unmounting component. With Gate don't need to use useEffect for subscribe to mount/unmount components.
The result we don't need to make a new event and export it in View.

Instead of

```tsx
import { useEffect } from "react";

const someEventForTriggerAfterMounting = createEvent();
const someEventForTriggerAfterUnmounting = createEvent();

useEffect(()=>{
   someEventForTriggerAfterMounting() 
    return ()=>{
        someEventForTriggerAfterUnmounting()
    }
},[])
```

```tsx
import { createGate } from "effector-react";

const SomeGate = createGate('Somegate')

useGate(SomeGate)
```

And now we have methods SomeGate.open/SomeGate.close/SomeGate.status/SomeGate.state.

### Connect Gate and [Sample]()
As you see below it works as:
When FilmGate.open (when our page mounts), we run effects getFilmDataFx and getFilmPosterFx. If you don't need to pass arguments,or your arguments same, you can use Array with effects to run them.

FilmGate.open => it triggers clock in Sample => clock in Sample triggers target => target runs effects getFilmDataFx and getFilmDataFx.

```ts
sample({
    clock: FilmGate.open,
    target: [getFilmDataFx, getFilmPosterFx]
})


```

## Oh, stores again

As you see, I added stores with [Restore](https://effector.dev/docs/api/effector/restore). 

I used it for fill my stores with data with less code.

You can do

```ts
import { createStore } from "effector";

const $filmRawData = createStore<FilmRaw>(null)

$filmRawData.on(getFilmDataFx.doneData,(_,payload)=>payload)

```
You can check, it's very similar with model for Rating Component where we subscribe for event and change state there.
Not bad, but I'm so lazy and fix 2 lines of code for one line with restore.

```ts
const $filmRawData = restore<FilmRaw>(getFilmDataFx, null)
```
It works same as above , but less code.

## [Combine](https://effector.dev/docs/api/effector/combine) stores is very powerful instrument

Don't afraid such weird thing as Combine.    
Very simple work - we put there stores, and we have all data from them, and VERY IMPORTANT that if one of those stores updates (whatever why), combine runs again => we are going to have updated combined store  => perfect!

Ok, I need combined data from $filmRawData and $posterRawData.

1) create variable $film 
2) use combine 
3) pass stores for combine $filmRawData and $posterRawData
4) third argument pass func
5) arguments in this func are my stores which I passed before.
6) Combine is a sync func, and I must check do I have data in my stores, if nope ,return null and my $film will be store with data === null
7) if I have data in stores I do some work and return mapped data.

It works like this:

Combined stores => when $filmRawData or $posterRawData changed combine will run. And according logic inside it returns what you need. In my case I return data or null.
Combine will run every time when one of these store changed.


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
### All data what you pass by event, or get after effect finished will provide automatically.

1) We create an event and an effect.
2) Later we somewhere call myEvent with payload - some id as string.
3) We call myEvent and this action will trigger clock in Sample.
4) Clock triggers target, pass payload from myEvent to myEffectFx and run myEffectFx.

```ts
import { createEvent, sample } from "effector";

const myEvent = createEvent<string>()
const myEffectFx = createEffect(async (id:string) => {
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

Oh  shit, here we go again!

1) Pending get effects and return bool - are some in pending or no. Also there is reset method, we will return for reset a little later with reset stores and also this pending.
2) combineEvents get events and AWAITED when all of them fires.

How it works? Easy to understand step by step

1) Passed effects getFilmDataFx and getFilmPosterFx in combineEvents
2) When getFilmDataFx.doneData and  getFilmPosterFx.doneData fires, doesn't matter in what order (doneData means there will be data which returns from effect)
3) Then I pass these combined events in clock in Sample
4) When combineEvents runs we trigger clock in sample, and don't forget, we have data in payload from these events named as  film and poster
5) In Sample we have func witch get arguments from sample clock ( or/and source) 
6) Do the same job as in Combine above
7) And return result, this result will be passed in target
8) Our target is a store $film
9) We have data in our $film store.

NOTE: combineEvents fires clock only after all effects are fulfilled with doneData method (if it will be fail, effect has method fail), it means no need to  check do we have data or not.

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
    fn: ({film,poster}) => {
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
