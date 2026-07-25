// src/store/ordersSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],    
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders  = action.payload;
      state.loading = false;
      state.error   = null;
    },

    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },

    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) order.status = status;
    },

    clearOrders: (state) => {
      state.orders = [];
    },

    setOrdersLoading: (state, action) => { state.loading = action.payload; },
    setOrdersError:   (state, action) => { state.error   = action.payload; state.loading = false; },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrderStatus,
  clearOrders,
  setOrdersLoading,
  setOrdersError,
} = ordersSlice.actions;

export const selectOrders        = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectActiveOrders  = (state) =>
  state.orders.orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));

export default ordersSlice.reducer;