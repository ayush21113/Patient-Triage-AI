const initialState = {
  selectedEncounterId: null,
  sheet: null,
  auditOpen: false,
  fairnessOpen: false,
  mode: "NORMAL",
  modeDetail: null,
  acknowledgedAlerts: {},
  movements: {},
  overrides: {},
  collapsedEncounterIds: []
};

function reduce(state, action) {
  switch (action.type) {
    case "SELECT_ENCOUNTER":
      return { ...state, selectedEncounterId: action.encounterId };
    case "OPEN_ARRIVAL":
      return { ...state, sheet: { type: "arrival" } };
    case "OPEN_REASSESS":
      return {
        ...state,
        sheet: { type: "reassess", encounterId: action.encounterId }
      };
    case "CLOSE_SHEET":
      return { ...state, sheet: null };
    case "OPEN_AUDIT":
      return { ...state, auditOpen: true };
    case "CLOSE_AUDIT":
      return { ...state, auditOpen: false };
    case "OPEN_FAIRNESS":
      return { ...state, fairnessOpen: true };
    case "CLOSE_FAIRNESS":
      return { ...state, fairnessOpen: false };
    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        modeDetail: action.detail
      };
    case "ACK_ALERT":
      return {
        ...state,
        acknowledgedAlerts: {
          ...state.acknowledgedAlerts,
          [action.encounterId]: action.at
        }
      };
    case "SET_MOVEMENT":
      return {
        ...state,
        movements: {
          ...state.movements,
          [action.encounterId]: action.movement
        }
      };
    case "SET_OVERRIDE":
      return {
        ...state,
        overrides: {
          ...state.overrides,
          [action.encounterId]: action.override
        }
      };
    case "SET_COLLAPSED":
      return {
        ...state,
        collapsedEncounterIds: action.encounterIds
      };
    default:
      throw new Error(`Unknown state action: ${action.type}`);
  }
}

export function createStore(seed = {}) {
  let state = { ...initialState, ...seed };
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      state = reduce(state, action);
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
