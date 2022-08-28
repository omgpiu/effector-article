# Состояние на странице

И наконец, рассмотрим как можно управлять состояниями на странице.

1) Создаем Gate для всего приложения
2) Создаем стор для состояний страницы
3) Создаем подписки на изменения стора через метод .on
4) Создаем combinedEvent из Patronum
5) Создаем sample для сброса сторов

Посмотрим, что получилось.

1) Создамем стор $appProcess c начальным состоянием Loading.
2) Первый .on когда все эвенты в объединенном евенте сработают, тогда состояние сменится на IDLE
3) Второй .on когда sendFeedbackFx сработет, он запустит изменение состояния на LOADING
4) Третий .on когда  sendFeedbackFx зарезолвится с done, состояние перейдет в  SUCCESS.
5) Четвертый если sendFeedbackFx,getFilmDataFx,getFilmPosterFx вернут reject (метод .fail), тогда состояние будет FAIL.

Метод .on может срабатывать в разной последовательности, в зависимости от срабатывания треггера, который мы передали первым аргументом.

```ts
export const $appProcess = createStore<AppProcess>(AppProcess.LOADING, {
  name: '$appProcess'
})

$appProcess
  .on(combinedFetchingEvent, () => AppProcess.IDLE)
  .on(sendFeedbackFx, () => AppProcess.LOADING)
  .on(sendFeedbackFx.done, () => AppProcess.SUCCESS)
  .on([sendFeedbackFx.fail, getFilmDataFx.fail, getFilmPosterFx.fail], () => AppProcess.FAIL)
  .reset(AppGate.close)
```

## На этом все, спасибо за внимание!
