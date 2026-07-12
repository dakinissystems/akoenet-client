import { SKIN_LIST } from "../skins/index.js";
import { usePlayerStore } from "../store/playerStore.jsx";

export function SkinPicker() {
  const { state, dispatch } = usePlayerStore();

  return (
    <div className="dmp-skin-picker" role="group" aria-label="Skin">
      {SKIN_LIST.map((skin) => (
        <button
          key={skin.id}
          type="button"
          className={`dmp-skin-picker__btn${state.skinId === skin.id ? " is-active" : ""}`}
          title={skin.name}
          onClick={() => dispatch({ type: "SET_SKIN", payload: skin.id })}
          data-skin-preview={skin.id}
        >
          <span className="dmp-skin-picker__swatch" style={{ background: skin.colors.accent }} />
          <span className="dmp-skin-picker__label">{skin.name}</span>
        </button>
      ))}
    </div>
  );
}
