# Отправка данных и разделение эвентов

## Прежде, чем мы начнем

Парочка ссылок, по которым стоит пройтись для лучшего понимания раздела. Это ссылочки на доку эффектора и/или патронума.

1) [Split](https://effector.dev/docs/api/effector/split/)
2) [Reset Stores](https://effector.dev/docs/api/effector/store#resettriggersarray)
3) [Effect](https://effector.dev/docs/api/effector/createEffect)

### Повторение, мать учения

### Задача

1) Отправка данных на API (либо на мок)
2) Сбросить значение сторов
3) Сделать поток отправки вариативным от условий
4) Передать данные из сторов в эвенты/эффекты 
5) Если выбрать любой рейтинг отличный от 0 и нажать на звезду, тогда при наведении текст и цвет не должен меняться.
6) Но по нажатию на другие звезды текст и цвет должен меняться.

Мы уже встречались с - [Effect](https://effector.dev/docs/api/effector/createEffect),в этом уроке мы вновь поработаем с ним для асинхронной работы для отправки данных. 
Но, так как я не нашел куда отправлять данные, мы просто замокаем поведение API.
Аргумент isReject поможет нам в дальнейшем, протестировать работу методов done/fail и высторить логику в зависимости от возвращенного результата.

Иногда удобней передать аргументы в эффект через реструктуризацию в sample из source в target.


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

Я создал несколько эвентов и сторов для textarea и баджа. Стор $badge содержит в себе заголовок и цвет, они должны меняться динамически при взаимодействии юзера.
Это мы все уже делал, ничего нового. Подробнее останавливаться не будем.

## Время зачистки

Вы могли заметить- [reset for  stores](https://effector.dev/docs/api/effector/store#resettriggersarray).
Этот метод сбрасывает значение сторов к изначальному состоянию.
[Reset](https://effector.dev/docs/api/effector/store#resettriggersarray) это метод стора. Передадим туда эвент или массив с эвентами, и когда любой из них сработает, стор вернется к своему изначальному состоянию.
Обычно используется, когда уходим со страницы, либо после отправки данных для сброса всех полей формы.

Очередная рубрика, как это работает?

1) Создаем евент/эффект
2) Передаем этот евент/эффект либо массив разных эвентов/эффектов в метод reset.
3) Вызываем в любом месте нашего кода эвенты. Через [Sample](https://effector.dev/docs/api/effector/sample) как target или императивно во View слоев. 

Workflow:

1) sendFeedbackFx срабатывает 
2) Clock в [Sample](https://effector.dev/docs/api/effector/sample) запускает массив эвентов  в target.
3) resetRatingStores и  resetFormStores запускают работу методов reset в сторах.

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

## [Split](https://effector.dev/docs/api/effector/split/) поможет направить данные как тебе нужно

Иногда возникает необходимость запускать разные ветки кода и [Split](https://effector.dev/docs/api/effector/split/) нам в этом поможет.
Две важные вещи про split. В matches и cases - методы должны назваться одинаково. В методах объекта matches ты делаешь какую-то проверку,
и если метод вернет true, тогда он запустит метод с тем же самым именем в объекте cases.

Идем по шагам:

1) Не важно где запускаем sendFeedback.
2) Выбираем $rating как source
3) В объекте matches создаем два метода и проверяем данные из $rating, рейтинг больше 0?  
4) Метод sendSuccess в объекте matches  вернул  true, значит сработает метод в объекте cases с именем sendSuccess.

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

## Отправка данных 

В этом разделе поработаем с большим [Sample](https://effector.dev/docs/api/effector/sample). По сравнению с прошлыми sample, он отличается и немного сложнее.
Основное то, что в source можно передавать сторы массивом или объектом, чтобы получать данные с них в функции fn() ниже. 

1) Когда sendSuccess будет запущен, он запустит clock в [Sample](https://effector.dev/docs/api/effector/sample)
2) Мы передали объект в source. Теперь, мы можем получать данные сторов в функциях fn() и filter.
3) Source передает данные в fn и мы получаем их по ключам объекта.
4) Мапим данные в fn(), чтобы передать этот объект в target. 

Обязательно здесь то, что обязательно должны совпадать тип данных из fn() в target.
sendFeedbackFx ожидает получить аргументы ``({text, rating, id, isReject}: Feedback)`` и если попытаться передать их как то по другому, то получим ошибку.

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
  fn: ({ feedback, rating, film }) => {
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

##  [Sample](https://effector.dev/docs/api/effector/sample) с условями в фильтре

Даже если мы не передаем clock в [Sample](https://effector.dev/docs/api/effector/sample), мы можем положиться на source.
Когда store в source измениться, это запустит sample. Это будет работать только тогда, когда нет clock.

1) $rating или $hover изменились
2) filter проверяет рейтинг больше 0
3) Если да, фильтр вернет false и fn() не сработает
4) Если нет, то filter вернет true и запустит fn()
5) fn() получает аргумент с наведенным рейтингом и передает его в target

```ts
sample({
  source: {
    rating: $rating,
    hovered: $hover,
  },
  filter: ({ rating }) => !rating,
  fn: ({ hovered }) => BADGE_INFO[hovered],
  target: $badge,
});

```
Надеюсь, в этой части все было понятно. Одна вещь могла смутить

Вот эта запись
```ts
filter: Boolean,
```

тоже самое что и эта

```ts
filter: (rating) => Boolean(rating),
```

Но мы можем использовать такую запись только в том случае, если у нас из clock или source приходит одно значение, которое можем привести к булевому.

Если Boolean(payload из clock/source) => true => fn и target сработают.

```ts
sample({
  source: $rating,
  filter: Boolean,
  fn: (rating) => BADGE_INFO[rating],
  target: $badge,
});
```
Можно переписать  эти два  [Sample](https://effector.dev/docs/api/effector/sample) на [Split](https://effector.dev/docs/api/effector/split/), но получиться чуть больше кода.
Это дело вкусовщины и лени.