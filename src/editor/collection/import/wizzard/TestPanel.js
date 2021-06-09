import { useWizzard } from "./useWizzard";

export const TestPanel = () => {
    const {state, dispatch} = useWizzard()
    return (
      <>
        <h2>Test</h2>
      </>
    );
  }