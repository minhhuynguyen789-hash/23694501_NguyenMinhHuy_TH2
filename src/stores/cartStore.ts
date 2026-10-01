import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT, PRICE_MULTIPLIER } from '@constants/student';
import { Product } from '@services/productApi';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  shippingFee: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  changeQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  setShippingFee: (fee: number) => void;
  
  // Helpers
  getTotalQuantity: () => number;
  getProductTotal: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingFee: 0,

      addItem: (product: Product) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            };
            return { items: updatedItems };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        });
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      changeQuantity: (productId: number, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: qty } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], shippingFee: 0 });
      },

      setShippingFee: (fee: number) => {
        set({ shippingFee: fee });
      },

      getTotalQuantity: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getProductTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const itemPrice = Math.round(item.product.price * PRICE_MULTIPLIER);
          return sum + itemPrice * item.quantity;
        }, 0);
      },

      getFinalTotal: () => {
        const { getProductTotal, shippingFee } = get();
        return getProductTotal() + shippingFee;
      },
    }),
    {
      name: `ktxgo-cart-${STUDENT.mssv}`,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;
