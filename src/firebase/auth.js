import firebase from "firebase/app"

export const signup = async ({firstName, lastName, email, password}) => {
    const resp = await firebase.auth().createUserWithEmailAndPassword(email, password)
    const user = resp.user
    await resp.user.updateProfile({ displayName: `${firstName} ${lastName}`})
    return user
}

export const logout = () => {
    return firebase.auth().signOut()
}

export const signin = async ({ email, password}) => {
    const resp = await firebase.auth().signInWithEmailAndPassword(email, password)
    return resp.user
}