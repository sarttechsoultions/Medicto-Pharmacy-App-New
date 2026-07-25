import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice'
import cartReducer   from './slice/cartSlice';
import ordersReducer from './slice/orderSlice';
 
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart:   cartReducer,
    orders: ordersReducer,
  },
});