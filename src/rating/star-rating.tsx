import { useStore } from "effector-react";
import st from './rating.module.css'
import { $hover, $rating, setHover, setRating } from "./model";

export const StarRating = () => {
    const rating = useStore($rating)
    const hover = useStore($hover)

    return (
        <div className={st.container}>
            {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className={index <= (hover || rating) ? st.on : st.off}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(rating)}
                    >
                        <span className="star">&#9733;</span>
                    </button>
                );
            })}
        </div>
    );
};