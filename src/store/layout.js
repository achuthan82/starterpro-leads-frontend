import { createSlice } from '@reduxjs/toolkit';

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    isRTL: false,
    skin: 'default',
    layout: 'vertical',
    lastLayout: 'vertical',
    menuCollapsed: false,
    footerType: 'static',
    navbarType: 'floating',
    menuHidden: false,
    contentWidth: 'full'
  },
  reducers: {
    handleRTL: (state, action) => {
      state.isRTL = action.payload;
    },
    handleSkin: (state, action) => {
      state.skin = action.payload;
    },
    handleLayout: (state, action) => {
      state.layout = action.payload;
    },
    handleLastLayout: (state, action) => {
      state.lastLayout = action.payload;
    },
    handleMenuCollapsed: (state, action) => {
      state.menuCollapsed = action.payload;
    },
    handleFooterType: (state, action) => {
      state.footerType = action.payload;
    },
    handleNavbarType: (state, action) => {
      state.navbarType = action.payload;
    },
    handleMenuHidden: (state, action) => {
      state.menuHidden = action.payload;
    },
    handleContentWidth: (state, action) => {
      state.contentWidth = action.payload;
    }
  }
});

export const {
  handleRTL,
  handleSkin,
  handleLayout,
  handleLastLayout,
  handleMenuCollapsed,
  handleFooterType,
  handleNavbarType,
  handleMenuHidden,
  handleContentWidth
} = layoutSlice.actions;

export default layoutSlice.reducer;