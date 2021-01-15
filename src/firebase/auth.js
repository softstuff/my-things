import { auth } from './config'

export const signup = async ({firstName, lastName, email, password}) => {
    const resp = await auth.createUserWithEmailAndPassword(email, password)
    const user = resp.user
    await resp.user.updateProfile({ displayName: `${firstName} ${lastName}`})
    return user
}

export const logout = () => {
    return auth.signOut()
}

export const signin = async ({ email, password}) => {
    const resp = await auth.signInWithEmailAndPassword(email, password)
    return resp.user
}

export const signInWithCustomToken = async (token) => {
    const resp = await auth.signInWithCustomToken(token)

    return resp
}