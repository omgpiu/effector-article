# Effects,Samples,Gate,Restore and adding logic in stores

In this part I will show how can we solve some issues with only effector staff and easiest way with Patronum lib.


## Use Gate instead of useEffect

Let's have a look for a new thing - this is a [Gate](https://effector.dev/docs/api/effector-vue/gate/)
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

### Connect Gate and Sample
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

NOTE: combineEvents fires clock only after all effects are fulfilled with doneData method (if it will be fail, effect has method fail), it means no need to  check do we have data or no.

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
