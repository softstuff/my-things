import { useWizzard } from "./useWizzard";

export const ConfirmPanel = () => {
    const {state, dispatch} = useWizzard()
    return (
      <>
        <h2>Confirm</h2>
      </>
    );
  }