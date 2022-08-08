import React from 'react';
import st from './App.module.css'
import { StarRating } from "./rating/star-rating";
import { Film } from "./film/film";

export const App = () => {
    return (
        <div className={st.container}>
            <Film/>
            <StarRating/>
        </div>
    );
}

