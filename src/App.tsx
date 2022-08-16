import React from 'react';
import st from './App.module.css'
import { StarRating } from "./LessonOne/star-rating";
import { Film } from "./LessonTwo/film";

export const App = () => {
    return (
        <div className={st.container}>
            <Film/>
            <StarRating/>
        </div>
    );
}

