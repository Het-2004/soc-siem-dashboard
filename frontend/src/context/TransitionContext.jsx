import { createContext, useContext, useState } from "react";

const TransitionCtx = createContext(null);

export function TransitionProvider({ children }) {
    const [showing, setShowing] = useState(false);

    const triggerTransition = () => setShowing(true);
    const clearTransition = () => setShowing(false);

    return (
        <TransitionCtx.Provider value={{ showing, triggerTransition, clearTransition }}>
            {children}
        </TransitionCtx.Provider>
    );
}

export const useTransition = () => useContext(TransitionCtx);
