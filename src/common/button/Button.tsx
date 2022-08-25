import st from './button.module.css'
import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

interface DetailedButton
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string
}

export const Button = ({ title, ...rest }: DetailedButton) => (
  <button className={st.btn} {...rest}>
    {title}
  </button>
)
