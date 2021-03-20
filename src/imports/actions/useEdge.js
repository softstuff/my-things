import { useCallback } from "react";
import { useStoreState } from "react-flow-renderer";


export const useEdge = () => {

    const edges = useStoreState((store) => store.edges);

    const onlySingleEdge = useCallback (connection => {
        return !edges.some(edge => edge.target === connection.target && edge.targetHandle === connection.targetHandle)
    },[])

    return { onlySingleEdge }
}