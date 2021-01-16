import React from 'react'
import { useLocation } from 'react-router-dom';

const Error = () => {
    const location = useLocation();
    const message = location.state.message;
    return (
        <div style={{textAlign:"center"}}>
            <h>Error</h>
            <p>{message}</p>
        </div>
    )
}

export default Error