import { AppProcess } from '../../LessonFour/model'
import { ErrorImg, SuccessImg } from '../../assets'
import st from './result-blank.module.css'
import { Button } from '../button/Button'

interface ResultBlankProps {
  type: Omit<AppProcess, AppProcess.FAIL | AppProcess.SUCCESS>
}

const map = {
  [AppProcess.FAIL]: {
    text: 'Something went wrong',
    img: ErrorImg,
  },
  [AppProcess.SUCCESS]: {
    text: 'Feedback was sent successfully',
    img: SuccessImg,
  },
}

export const ResultBlank = ({ type }: ResultBlankProps) => {
  const { text, img } = map[type]
  return (
    <div className={st.container}>
      <img src={img} alt={text} />
      <p>{text}</p>
      <Button title="Return" onClick={() => window.location.reload()} />
    </div>
  )
}
