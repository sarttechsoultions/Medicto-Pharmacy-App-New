// src/hooks/useAddToCart.js
// ── Shows CartPopup instead of Toast after successful add ─────────────────────

import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../redux/slice/cartSlice';
import { api } from '../services/service';
import Toast from 'react-native-toast-message';

const discountedPrice = ( price, discount ) => {
  const p = Number( price ) || 0;
  const d = Number( discount ) || 0;
  return Number( ( p - ( p * d ) / 100 ).toFixed( 2 ) );
};

export default function useAddToCart() {
  const dispatch = useDispatch();
  const token = useSelector( ( state ) => state.auth.token );

  const addToCart = async ( medicine, setModalVisible ) => {
    if ( !token ) {
      setModalVisible?.( true );
      return;
    }

    dispatch( addItem( {
      id: medicine.id,
      name: medicine.name,
      desc: `${medicine.unit_type ?? ''} • ${medicine.pack_size ?? ''}`,
      price: discountedPrice( medicine.price, medicine.discount ),
      rawPrice: Number( medicine.price ) || 0,
      discountPct: Number( medicine.discount ) || 0,
      image: medicine.image ?? null,
      status: medicine.status ?? 'In Stock',
      stock: Number( medicine.stock ) || 0,
      qty: 1,
    } ) );

     Toast.show({
      type:  'success',
      text1: 'Added to Cart',
      text2: `${medicine.name} has been added to your cart.`,
      position: 'top',
      visibilityTime: 2000,
    });

     try {
      const res = await api.post('/cart-add', {
        medicine_id: medicine.id,
        quantity:    1,
      });

      if (!res.data?.status) {
        Toast.show({
          type:  'error',
          text1: 'Failed',
          text2: res.data?.message || 'Could not add to cart.',
        });
      }
    } catch (err) {
      Toast.show({
        type:  'error',
        text1: 'Error',
        text2: err.message || 'Something went wrong.',
      });
    }
  };

  return { addToCart };
}