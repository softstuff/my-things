import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import queryString from 'query-string'
import { signInWithCustomToken } from '../firebase/auth'
import { useSession } from '../firebase/UserProvider';

function Jira() {
    const [jiraUser, setJiraUser] = useState()
    const [userCredentials, setUserCredentials] = useState()
    const location = useLocation()
    const { user: firebaseUser, claims } = useSession()


    const query = queryString.parse(location.search)
    console.log(' query param is ', query)

    useEffect(() => {
        if(window.AP?.user) {
            window.AP.user.getCurrentUser((user) => {
                setJiraUser(user)
                console.log("The Atlassian Account ID is", user.atlassianAccountId, user);
            });
        } else {
            console.log("No Atlassian Account ID was found");
        }
    }, [])

    useEffect(() => {
        const asyncWorker = async () => {
            try {
                const res = await fetch(`/api/auth/jira/login?jwt=${query?.jwt}`)
                const body = await res.json()
                console.log('Token exchange, got result', body)
                const customToken = body.customToken

                const result = await signInWithCustomToken(customToken)
                console.log('Logged in to firebase', JSON.stringify(result))
                setUserCredentials(result)          
            } catch(error) {
                console.log('Failed to exchange tokens', error)
            }
        }

        asyncWorker()
      }, [query.jwt])


    return (
        <>
            <h1>Jira</h1>

            <p>You are Jira user: {jiraUser?.atlassianAccountId}</p>

            <p>Jira query parameters</p>
            { query ? (
                <ul>
                    {Object.getOwnPropertyNames(query).map( (key, index) => 
                        <li key={index}>{key} = {query[key]}</li>
                    )}
                </ul>
            ) : (
                <p>Query parameters is loading</p>
            )}

            <p>Firebase user {firebaseUser?.uid}</p>
            <p>Firebase user {JSON.stringify(firebaseUser)}</p>
            <p>Firebase claims {JSON.stringify(claims)}</p>

            <p>userCredentials{JSON.stringify(userCredentials)}</p>
        </>
    )
}

export default Jira
