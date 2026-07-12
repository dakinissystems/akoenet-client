import { createContext, useContext, useMemo, useReducer } from "react";

const SKIN_KEY = "dmp_skin_id";

function readSkinId() {
  try {
    return localStorage.getItem(SKIN_KEY) || "dakinis";
  } catch {
    return "dakinis";
  }
}

const PlayerContext = createContext(null);

const initialState = {
  volume: 0.85,
  balance: 0,
  shuffle: false,
  repeat: "off",
  skinId: readSkinId(),
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
    case "SET_SKIN": {
      try {
        localStorage.setItem(SKIN_KEY, action.payload);
      } catch {
        /* ignore */
      }
      return { ...state, skinId: action.payload };
    }
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
