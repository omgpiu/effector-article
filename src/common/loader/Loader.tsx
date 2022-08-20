import st from './loader.module.css'

export const Loader = () => {
  return (
    <div className={st.container}>
      <div className={st.loader}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
