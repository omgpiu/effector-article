# Effects, Samples, Gate, Restore и добавление логики в сторы

## Прежде, чем мы начнем

Парочка ссылок, по которым стоит пройтись для лучшего понимания раздела. Это ссылочки на доку эффектора и/или патронума.

1) [Gate](https://effector.dev/docs/api/effector-vue/gate/)
2) [Sample](https://effector.dev/docs/api/effector/sample)
3) [Effect](https://effector.dev/docs/api/effector/effect)
4) [Restore](https://effector.dev/docs/api/effector/restore)
5) [Combine](https://effector.dev/docs/api/effector/combine)

Во втором уроке, мы разеберем как мы можем получать данные, подпишемся на открытие страницы без юзэффекта и поймем как
работать с данными в сторах
Так же, посмотрим как решается одна и та же проблема, чисто на  [Effector](https://effector.dev) и с применением
помощника  [Patronum](https://github.com/effector/patronum)

## Задачи:

1) Необходимо получить данные с разных API
2) Объеденить полученные данные
3) Отобразить лоадер при получении данных

## Получение данных с  [Effect](https://effector.dev/docs/api/effector/effect)

Эффект это контейнер для асинхронных функций либо для функций с сайд эффектами. В основном используется для
взаимодействия с API.
Когда мы создаеем эффет, общепринятым считается в конце имени добавить буквы Fx (getFilmPosterFx). Это явно указывает,
что это эффект, и не спутали с эвентом.
В основном будем встречаться с такими методами эффекта:

1) getFilmPosterFx.done
2) getFilmPosterFx.doneData
3) getFilmPosterFx.fail
4) getFilmPosterFx.pending
5) etc.

Все эти методы возвращают данные. Например - doneData возвращается результат из эффекта,
done возвращает аргументы которые передали в эффект и результат, pending возвращает true/false, fail возвращает
аргументы и ошибку.

```ts
export const getFilmPosterFx = createEffect<void, FilmPosterRaw>(async () => {
    const req = await fetch(POSTER_BASE)
    return req.json()
})

```

## Используем [Gate](https://effector.dev/docs/api/effector-vue/gate/) вместо  [Effect](https://effector.dev/docs/api/effector/effect)

Теперь приступим к новому элементу - [Gate](https://effector.dev/docs/api/effector-vue/gate/).
Gate может использоваться и лучше использовать его, вместо useEffect. Он помогает подписаться на монтирование и
размонтирование компонента.
Благодаря ему, мы не экспортируем лишние евенты во вью слой, а просто подписваемся на методы Gate в модели.

Вместо того, чтобы делать так

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

Лучше делать так

```tsx
import { createGate } from "effector-react";

const SomeGate = createGate('Somegate')

useGate(SomeGate)


//где-то в model.ts

sample({
    clock: SomeGate.open,
    target: someEvent
})

```

У гейта есть методы, которые возвращают либо евент либо данные:
SomeGate.open/SomeGate.close/SomeGate.status/SomeGate.state.

### Соеденим [Gate](https://effector.dev/docs/api/effector-vue/gate/) и [Sample](https://effector.dev/docs/api/effector/sample) для реакции на изменения Gate

Разберем по шагам, как это работает.
Когда сработает FilmGate.open (когда наш компонент вмонтируется), он запустит эффекты getFilmDataFx и getFilmPosterFx.
Если нам не нужно передавать аргументы в эффекты, либо если аргументы одинаковые, можно передавать в target массив
эффектов или эвентов.

1) FilmGate.open =>
2) Срабатывает clock в Sample =>
3) Клок запускает target и передает пайлод в каждый элемент массива, который находится в таргете ( в нашем случае мы
   передаем void)
4) Target запускает эффекты getFilmDataFx и getFilmDataFx с пейлодом из clock

```ts
sample({
    clock: FilmGate.open,
    target: [getFilmDataFx, getFilmPosterFx]
})


```

## Больше сторов, богу сторов

В этот раз, я использовал [Restore](https://effector.dev/docs/api/effector/restore) для создания сторов.
Фукнция restore заполняет стор с меньшим количеством кода.

Можно делать так

```ts
import { createStore } from "effector";

const $filmRawData = createStore<FilmRaw>(null)

$filmRawData.on(getFilmDataFx.doneData, (_, payload) => payload)
```

можно и так

```ts
const $filmRawData = restore<FilmRaw>(getFilmDataFx, null)
```

Результат получается тот же, только с меньшим количеством кода.

## [Combine](https://effector.dev/docs/api/effector/combine) собираем сторы воедино

Ты можешь делать разные веселые вещи с [Combine](https://effector.dev/docs/api/effector/combine).
Когда мы собираем сторы вместе, в результирующем сторе мы имеем доступ к данным передеанных сторов, так же, если один из
переданных сторов обновиться, обновится и результирующий стор.

Время объеденить два стора $filmRawData и $posterRawData

1) создаем переменную $film
2) используем [Combine](https://effector.dev/docs/api/effector/combine)
3) передаем сторы $filmRawData и $posterRawData в массиве , как первый аргумент
4) Передаем функцию, как второй аргумент
5) Эта функция принимает в себя переданные сторы
6) [Combine](https://effector.dev/docs/api/effector/combine) синхронный, и необходимо проверять, пришли ли данные с в
   тех сторах, которые мы ходим объеденить
7) Если у нас есть данные в сторах, делаем какую-то работу, и возвращаем результат.

По простому работает так:

1) Объединияем сторы
2) Когда $filmRawData или $posterRawData изменятся, Combine сработает
3) В соотвествии логикой внутри, вернется желаемый результат

В нашем случае вернется или null, или дата
**[Combine](https://effector.dev/docs/api/effector/combine) запускается каждый раз, когда любой переданный стор
обновится**

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

### Используй [Effect](https://effector.dev/docs/api/effector/effect) в UI

**All data from events/effects will provide to next unit automatically.**
**Все аргументы переданные с эвентов/эффектов будут переданы другому юниту автоматически**

1) Создаем эвент и эффект
2) В дальнейшем, мы вызываем где-то эвент myEvent с пейлоадом - передаем id строкой.
3) При вызове эвента сработает clock в [Sample](https://effector.dev/docs/api/effector/sample).
4) Clock запустит target и передаст пейлоад из эвента myEvent в эффект и запустит эффект myEffectFx

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

## Время волшебства с - [Pending](https://github.com/effector/patronum#pending), [combineEvents](https://github.com/effector/patronum#combineevents)

Сделаем тоже самое, только с помогайками из Patronum!

1) [Pending](https://github.com/effector/patronum#pending) принимает эффекты и возвращает boolean - в зависимости от
   того, находится ли какой из эффектов в состоянии pending.
   Обязательно нужно очищать состояние в pending, мы сделаем, это чуть позже
2) [combineEvents](https://github.com/effector/patronum#combineevents) принимает в себя эвенты или эффекты и дожидается,
   когда каждый из них сработает и только после этого, сработает сам.

Время понять, как это же все работает.

1) Передаем [effects](https://effector.dev/docs/api/effector/effect)  getFilmDataFx и getFilmPosterFx
   в [combineEvents](https://github.com/effector/patronum#combineevents)
2) Когда getFilmDataFx.doneData и getFilmPosterFx.doneData сработают, неважно в каком порядке (doneData это метод
   возвращающий данные )
3) Передаем [combineEvents](https://github.com/effector/patronum#combineevents) в clock в Sample.
4) Когда [combineEvents](https://github.com/effector/patronum#combineevents) сработает, он запустит clock в Sample, и
   так же не забываем, что в этом объединенном эвенте, у нас находятся данные с эффектов. Названые, как film и poster
5) В [Sample](https://effector.dev/docs/api/effector/sample) есть функция fn() принимающая аргументами, данные из сlock (данные из clock и/иди source)
6) Выполняем такую же логику, как в прошлом случае с [Combine](https://effector.dev/docs/api/effector/combine)
7) Возвращаем результат, который будет передан в target
8) Наш target это стор  $film
9) После срабатывания логики, данные попадают в $film

NOTE: [combineEvents](https://github.com/effector/patronum#combineevents) запустит clock только после того как у эффектов сработают методы doneData (если сработает любой другой метод, например, из-за того, что запрос вернется с ошибкой, тогда общий эвент не сработает)


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
