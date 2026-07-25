import { useNavigationState } from '@react-navigation/native';
import CartPopup from './CartPopup';
export default function CartPopupWrapper() {
  const currentRoute = useNavigationState((state) => {
    const route = state?.routes?.[state.index];
    return route?.name;
  });

  if (currentRoute === 'CartScreen') return null;
  return <CartPopup />;
}