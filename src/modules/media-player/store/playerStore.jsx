import { createContext, useContext, useMemo, useReducer } from "react";

const PlayerContext = createContext(null);

const initialState = {
  volume: 0.85,
  balance: 0,
  shuffle: false,
  repeat: "off",
  skinId: "classic",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "SET_BALANCE":
      return { ...state, balance: action.payload };
    case "SET_SHUFFLE":
      return { ...state, shuffle: action.payload };
    case "SET_REPEAT":
      return { ...state, repeat: action.payload };
    case "SET_SKIN":
      return { ...state, skinId: action.payload };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayerStore() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayerStore must be used within PlayerProvider");
  return ctx;
}
