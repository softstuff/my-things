import {useContext} from "react"
import {UserContext} from "../../firebase/UserProvider"


export const useUser = () => {
    const {claims} = useContext(UserContext)
    
    return {
        tenantId: claims.myThings.tenantId,
        uid: claims.user_id,
        canEdit: () => claims.moderator || claims.myThings.admin
    }
}