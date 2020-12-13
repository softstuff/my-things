import React from 'react'


const Main = (props) => {

    
    return (
        <main className={props.content}>
            {props.children}
        </main>
    )
}

export default Main