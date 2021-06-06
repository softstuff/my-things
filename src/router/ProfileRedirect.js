import React from 'react'
import {Redirect, Route} from 'react-router-dom'
import {useSession} from '../firebase/UserProvider'

const ProfileRedirect = ({component: Component, ...rest}) => {
    const { claims } = useSession()

    return <Route 
        {...rest} 
        render={(props) =>
            !claims?.user_id ? (
                <Component {...props}/>
             ): ( 
                <Redirect 
                    to={{ pathname: '/profile', state: { from: props.location }}}/>
            )}
        />
}

export default ProfileRedirect