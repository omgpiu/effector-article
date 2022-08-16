import st from "./form.module.css";
import { Film } from "../LessonTwo/film";
import { StarRating } from "../LessonOne/star-rating";
import React, { ChangeEvent, FormEvent } from "react";
import { $badge, $feedbackText, sendFeedback, setFeedbackText } from "./model";
import { useStore } from "effector-react";
import { Button } from "../common";

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
            <Button title='Submit'/>
        </form>
    );
}
