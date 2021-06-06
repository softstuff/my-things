import React, {useContext, useEffect, useState} from 'react'
import {auth} from './config'
import queryString from 'query-string'
import {useHistory, useLocation} from 'react-router-dom'
import {signInWithCustomToken} from './auth'
import NewTenant from '../pages/NewTenant'
import Signin from '../pages/Signin'
import {CircularProgress} from '@material-ui/core'


export const UserContext = React.createContext()

export const UserProvider = (props) => {
    const location = useLocation()
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const [claims, setClaims] = useState()
    const [jira, setJira] = useState()


    const loadClames = async (forceRefresh) => {

        if (auth.currentUser){
            const tokenResult = await auth.currentUser.getIdTokenResult(forceRefresh)
            console.log('fetched clames', tokenResult.claims)
            setClaims(tokenResult.claims)

        } else {
            setClaims(null)
        }
        return claims
    }



    useEffect(() => {

        console.log('subscribe onAuthStateChanged, JWT', location)

        const unsubscribe = auth.onAuthStateChanged(async (user) => {

            const query = queryString.parse(location.search)
        
            if (user) {
                console.log('onAuthStateChanged triggered with user')
                await loadClames(true)

                if(query.xdm_e){
                    setJira({
                        lic: query.lic,
                        channel: query.xdm_c,
                        domain: query.xdm_e
                    })
                }

                console.log('done login')
                setLoading(false)
                

            } else {
                console.log('onAuthStateChanged triggered with no user')
                // Jira entry from IFrame
                if (query.jwt) {
                    try {
                        const freshToken = await window.AP.context.getToken()
                        console.log('Found a Jira JWT exchanging tokens, freshToken', freshToken)
                        const res = await fetch(`/api/auth/jira/login?jwt=${freshToken}`)
                        if (!res.ok){
                            const error = await res.text()
                            console.log('Response', res.ok, res.status, res.statusText, error)
                            history.push('/error', { message: error })
                            return
                        }
                        console.log('Response', res.ok, res.status, res.statusText)
                        const body = await res.json()
                        console.log('Token exchange, got result', body)
                        const customToken = body.customToken
                        console.log('exchangeToken', customToken)

                        const result = await signInWithCustomToken(customToken)
                        console.log('loginWithToken', result)

                    } catch (error) {
                        console.log('Failed to exchange tokens', error)
                        setClaims(null)
                        history.push('/error', { message: error })

                    }
                } else {
                    console.log('Not logged in and no Jira jwt was found, running standalone')
                    setClaims(null)
                    setLoading(false)
                }
            }
        })

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            
                { (()=>{
                    if(loading){
                        return (<CircularProgress />)
                    } else if(!claims?.user_id) {
                        if (location.pathname === '/signin' || location.pathname === '/signup' ) {
                            return (props.children)
                        }
                        return (<Signin/>)
                    } else if(!claims?.myThings?.tenantId) {
                        return (
                            <UserContext.Provider value={{claims, jira, loadClames}} >
                                <NewTenant/>
                            </UserContext.Provider>)
                    } else {
                        return (
                            <UserContext.Provider value={{claims, jira, loadClames}} >
                                {props.children}
                            </UserContext.Provider>)
                    }
                })()}
            
        </>
    )
}

export const useSession = () => {
    const session = useContext(UserContext)
    return session
}