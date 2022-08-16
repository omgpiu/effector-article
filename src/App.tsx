import React from 'react';
import st from './App.module.css'
import { StarRating } from "./LessonOne/star-rating";

export const App = () => {
    return (
        <div className={st.container}>
            <StarRating/>
        </div>
    );
}

