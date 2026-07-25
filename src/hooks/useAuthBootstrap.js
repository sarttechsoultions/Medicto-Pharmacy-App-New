import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setAuth } from '../redux/slice/authSlice';
import { setApiToken, api } from '../services/service';
import { setCart } from '../redux/slice/cartSlice';

const discountedPrice = (price, discount) => {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return Number((p - (p * d) / 100).toFixed(2));
};

export default function useAuthBootstrap() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const restore = async () => {
      try {
        const token   = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');

        if (token) {
          const user = userStr ? JSON.parse(userStr) : null;
          setApiToken(token);
          dispatch(setAuth({ token, user }));

          // ── Fetch cart silently so badge shows correct count immediately ──
          try {
            const res = await api.get('/cart');
            if (res.data?.status) {
              dispatch(
                setCart(
                  res.data.data.map((item) => ({
                    cartId:      item.id,
                    id:          item.medicine_id,
                    qty:         Math.max(1, Number(item.quantity) || 1),
                    name:        item.medicine?.name ?? 'Unknown',
                    desc:        `${item.medicine?.unit_type ?? ''} • ${item.medicine?.pack_size ?? ''} qty`,
                    price:       discountedPrice(item.medicine?.price, item.medicine?.discount),
                    rawPrice:    Number(item.medicine?.price) || 0,
                    discountPct: Number(item.medicine?.discount) || 0,
                    image:       item.medicine?.image ?? null,
                    status:      item.medicine?.status ?? 'In Stock',
                    stock:       Number(item.medicine?.stock) || 0,
                  }))
                )
              );
            }
          } catch {
            // cart fetch failed silently — badge just shows 0
          }
        }
      } catch (e) {
        console.warn('Auth restore failed:', e);
      } finally {
        setBootstrapped(true);
      }
    };

    restore();
  }, []);

  return bootstrapped;
}