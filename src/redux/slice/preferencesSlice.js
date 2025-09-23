import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userCategories: [],
  userLocation: null,
  deliveryPoints: [],
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setPreferences(state, action) {
      state.userCategories = action.payload;
    },
    setUserLocation(state, action) {
      state.userLocation = action.payload;
    },
    setDeliveryPoints(state, action) {
      state.deliveryPoints = action.payload;
    },
    resetPreferences(state) {
      state.userCategories = [];
      state.userLocation = null;
      state.deliveryPoints = [];
    },
  },
});

export const { setPreferences, setUserLocation, setDeliveryPoints, resetPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
