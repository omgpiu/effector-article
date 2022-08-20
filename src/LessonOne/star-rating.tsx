import { useStore } from 'effector-react'
import st from './rating.module.css'
import { $hover, $rating, setHoveredRating, setRating } from './model'
import { RatingValue } from '../types'

export const StarRating = () => {
  const rating = useStore($rating)
  const hover = useStore($hover)

  return (
    <div className={st.container}>
      {[...Array(5)].map((star, index) => {
        index += 1
        return (
          <button
            type="button"
            key={index}
            className={index <= (hover || rating) ? st.on : st.off}
            onClick={() => setRating(index as RatingValue)}
            onMouseEnter={() => setHoveredRating(index as RatingValue)}
            onMouseLeave={() => setHoveredRating(rating)}
          >
            <span className="star">&#9733;</span>
          </button>
        )
      })}
    </div>
  )
}
