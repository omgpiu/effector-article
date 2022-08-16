# Process for page

Last part that I want to share is how to make process 

1) Create Gate for whole App 
2) Create a store for process
3) Create subscribe for process store by method .on
4) Create combinedEvent from patronum
5) Create sample for reset stores

Let's find out how it works. 

1) Create store $appProcess with defaultValue as Loading state
2) 1st .on -> when all events in combined events triggers store change value to IDLE
3) 2nd .on when sendFeedbackFx triggers store changes to LOADING
4) 3rd .on when  sendFeedbackFx returns value store changes to SUCCESS
5) 4th if sendFeedbackFx,getFilmDataFx,getFilmPosterFx fails stores changes to FAIL


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

## That's all 