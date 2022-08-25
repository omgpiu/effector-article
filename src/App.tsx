import React from 'react'
import { Form } from './LessonThree/Form'
import { $appProcess, AppGate, AppProcess } from './LessonFour/model'
import { useGate, useStore } from 'effector-react'
import { Loader, ResultBlank } from './common'

const render = (state: AppProcess) => {
  const map = {
    [AppProcess.IDLE]: <Form />,
    [AppProcess.SUCCESS]: <ResultBlank type={AppProcess.SUCCESS} />,
    [AppProcess.FAIL]: <ResultBlank type={AppProcess.FAIL} />,
    [AppProcess.LOADING]: <Loader />,
  }

  return map[state]
}

export const App = () => {
  useGate(AppGate)
  const state = useStore($appProcess)
  return <>{render(state)}</>
}
