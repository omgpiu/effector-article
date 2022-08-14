import st from "./Form.module.css";
import { Film } from "../film/film";
import { StarRating } from "../rating/star-rating";
import React, { ChangeEvent, FormEvent } from "react";
import { $badge, $feedbackText, sendFeedback, setFeedbackText } from "./model";
import { useStore } from "effector-react";

export const Form = () => {
    const value = useStore($feedbackText)
    const badge = useStore($badge)

    const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setFeedbackText(e.target.value.trim())
    }

    const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        sendFeedback()
    }

    return (
        <form className={st.container} onSubmit={onSubmitHandler}>
            <Film/>
            <StarRating/>
            <div className={`${st[badge.color]} ${st.info}`}>
                {badge.title}
            </div>
            <textarea onChange={onChangeHandler} value={value}/>
            <button type='submit'>Send Feedback</button>
        </form>
    );
}
