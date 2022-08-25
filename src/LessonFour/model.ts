import { combineEvents } from 'patronum'
import { getFilmDataFx, getFilmPosterFx, sendFeedbackFx } from '../api'
import { createStore, sample } from 'effector'
import { createGate } from 'effector-react'

export const enum AppProcess {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export const AppGate = createGate('AppGate')

const combinedFetchingEvent = combineEvents({
  reset: AppGate.open,
  events: [getFilmDataFx.done, getFilmPosterFx.done],
})

export const $appProcess = createStore<AppProcess>(AppProcess.LOADING, {
  name: '$appProcess',
})

$appProcess
  .on(combinedFetchingEvent, () => AppProcess.IDLE)
  .on(sendFeedbackFx, () => AppProcess.LOADING)
  .on(sendFeedbackFx.done, () => AppProcess.SUCCESS)
  .on([sendFeedbackFx.fail, getFilmDataFx.fail, getFilmPosterFx.fail], () => AppProcess.FAIL)
  .reset(AppGate.close)

sample({
  clock: AppGate.open,
  target: [getFilmDataFx, getFilmPosterFx],
})
