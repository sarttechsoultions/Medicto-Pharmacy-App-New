// src/store/cartSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],        // [{ cartId, id, name, desc, price, rawPrice, discountPct, qty, image, status, stock }]
  loading: false,
  error: null,
  popupVisible: false,
  lastAdded: null,
};

const cartSlice = createSlice( {
  name: 'cart',
  initialState,
  reducers: {
    // ── Called after fetching /api/cart ──────────────────────────────────────
    setCart: ( state, action ) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },

    // ── Optimistic add (before API confirms) ────────────────────────────────
    addItem: ( state, action ) => {
      const existing = state.items.find( ( i ) => i.id === action.payload.id );
      if ( existing ) {
        existing.qty += action.payload.qty ?? 1;
      } else {
        state.items.push( { ...action.payload, qty: action.payload.qty ?? 1 } );
      }
      state.lastAdded = { ...action.payload, qty: 1 };
      state.popupVisible = true;
    },

    // ── Optimistic qty update ────────────────────────────────────────────────
    updateItemQty: ( state, action ) => {
      const { cartId, qty } = action.payload;
      const item = state.items.find( ( i ) => i.cartId === cartId );
      if ( item ) {
        if ( qty <= 0 ) {
          state.items = state.items.filter( ( i ) => i.cartId !== cartId );
        } else {
          item.qty = qty;
        }
      }
    },

    // ── Optimistic remove ────────────────────────────────────────────────────
    removeItem: ( state, action ) => {
      state.items = state.items.filter( ( i ) => i.cartId !== action.payload );
    },

    // ── Clear cart (on logout / order placed) ───────────────────────────────
    clearCart: ( state ) => {
      state.items = [];
    },

    setCartLoading: ( state, action ) => { state.loading = action.payload; },
    setCartError: ( state, action ) => { state.error = action.payload; state.loading = false; },
    showCartPopup: ( state, action ) => {
      state.lastAdded = action.payload ?? state.lastAdded;
      state.popupVisible = true;
    },
    hideCartPopup: ( state ) => {
      state.popupVisible = false;
      // keep lastAdded so popup can animate out gracefully
    },
  },
} );

export const {
  setCart,
  addItem,
  updateItemQty,
  removeItem,
  clearCart,
  setCartLoading,
  setCartError,
  showCartPopup,
  hideCartPopup,
} = cartSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems = ( state ) => state.cart.items;
export const selectCartItemCount = ( state ) =>
  state.cart.items.reduce( ( sum, i ) => sum + Number( i.qty ), 0 );
export const selectCartTotal = ( state ) =>
  state.cart.items.reduce( ( sum, i ) => sum + Number( i.price ) * Number( i.qty ), 0 );

export default cartSlice.reducer;