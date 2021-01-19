import React from 'react'
import {useSession} from '../firebase/UserProvider'
import { auth } from '../firebase/config'

const Profile = () => {
    const { claims } = useSession()

    if(!claims) {
        return null
    }

    return (
        <>
            
            <div>
                <p>Name: {auth.currentUser.displayName}</p>
                <p>Email: {auth.currentUser.email}</p>
                <p>ID: {auth.currentUser.uid}</p>
            </div>
            <hr/>
            <div>
            { Object.getOwnPropertyNames(claims.myThings).map(key =>
                <p key={key}>{key}: {claims.myThings[key]}</p>
            )}
            </div>
            <hr/>
        </>
    )
}

export default Profile
