import { FETCH_GAME_DATA, FETCH_SCORES } from './constants'; // ,

const initialState = {
  gameData: [],
  scores: [],
};

const myReducer = (state = initialState, action) => {
  const newState = { ...state };
  switch (action.type) {
    case FETCH_GAME_DATA: state = { ...state, gameData: action.val };
      return state;

    case FETCH_SCORES: state = { ...state, scores: action.val };
      return state;

    default:
      return newState;
  }
};

export default myReducer;
