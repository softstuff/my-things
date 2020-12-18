import React, { useEffect, useState, useContext } from 'react'
import firebase from 'firebase/app'
import queryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { signInWithCustomToken } from './auth'

export const UserContext = React.createContext()

export const UserProvider = (props) => {
    const [session, setSession] = useState({})
    const location = useLocation()




    useEffect(() => {

        console.log('subscribe onAuthStateChanged, JWT', location)

        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {

            // setSession(session => ({ ...session, loading: true }))

            const query = queryString.parse(location.search)
        

            console.log('onAuthStateChanged triggered')

            if (user) {

                const tokenResult = await user.getIdTokenResult(true)
                console.log('fetched clames', tokenResult, tokenResult.claims)

                const newSession = {
                    ...session,
                    user: {
                        displayName: user.displayName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        photoURL: user.photoURL,
                        providerId: user.providerId,
                        uid: user.uid
                    },
                    signInProvider: tokenResult.signInProvider,
                    authTime: tokenResult.authTime,
                    claims: {},
                    loading: false
                }
                Object.keys(tokenResult.claims).filter( claim => claim.startsWith('x_mt_')).forEach(key => {
                    newSession.claims[key] = tokenResult.claims[key]
                    console.log(`Adding app claims ${key} = ${tokenResult.claims[key]}`)
                });
                if(query.xdm_e){
                    newSession.jira = {
                        lic: query.lic,
                        channel: query.xdm_c,
                        domain: query.xdm_e
                    }
                }

                setSession(session => newSession)
                console.log('done login', newSession)

            } else {

                //TODO use AP.context.getToken() instead to get away with not validation the QSH claims
                if (query.jwt) {
                    try {
                        debugger
                        const freshToken = await window.AP.context.getToken()
                        console.log('Found a Jira JWT exchanging tokens, freshToken', freshToken)
                        const res = await fetch(`/api/auth/jira/login?jwt=${freshToken}`)
                        const body = await res.json()
                        console.log('Token exchange, got result', body)
                        const customToken = body.customToken
                        console.log('exchangeToken', customToken)

                        const result = await signInWithCustomToken(customToken)
                        console.log('loginWithToken', result)

                        setSession(session => ({
                            ...session,
                            loading: false,
                            extra: {
                                isNewUser: result.additionalUserInfo.isNewUser,
                                profile: result.additionalUserInfo.profile,
                                providerId: result.additionalUserInfo.proficerId,
                                username: result.additionalUserInfo.username
                            }
                        }))
                        console.log('Logged in to firebase', session)
                    } catch (error) {
                        console.log('Failed to exchange tokens', error)
                        setSession({})
                    }
                } else {
                    console.log('Not logged in and no Jira jwt was found, running standalone')
                    setSession({})
                }
            }
        })

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <UserContext.Provider value={session} >
                {!session.loading && props.children}
            </UserContext.Provider>
        </>
    )
}

export const useSession = () => {
    const session = useContext(UserContext)
    return session
}