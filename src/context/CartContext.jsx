import { createContext, useEffect, useReducer } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "ecommerce_cart";

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("No se pudo guardar el carrito en localStorage:", error);
  }
};

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.warn("No se pudo cargar el carrito desde localStorage:", error);
    return [];
  }
};

const cartReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case "ADD_TO_CART": {
      const qtyToAdd =
        action.payload &&
        action.payload.quantity &&
        Number(action.payload.quantity) > 0
          ? Number(action.payload.quantity)
          : 1;

      const productInCart = state.find((item) => item.id === action.payload.id);
      if (productInCart) {
        newState = state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      } else {
        newState = [...state, { ...action.payload, quantity: qtyToAdd }];
      }
      break;
    }

    case "REMOVE_FROM_CART":
      newState = state.filter((item) => item.id !== action.payload);
      break;

    case "DECREASE_QUANTITY": {
      const productToDecrease = state.find(
        (item) => item.id === action.payload
      );
      if (productToDecrease && productToDecrease.quantity === 1) {
        newState = state.filter((item) => item.id !== action.payload);
      } else {
        newState = state.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      break;
    }

    case "CLEAR_CART":
      newState = [];
      break;

    case "LOAD_CART":
      newState = action.payload;
      break;

    default:
      return state;
  }

  if (action.type !== "LOAD_CART") {
    saveCartToStorage(newState);
  }

  return newState;
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart.length > 0) {
      dispatch({ type: "LOAD_CART", payload: savedCart });
    }
  }, []);

  const addToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const decreaseQuantity = (productId) => {
    dispatch({ type: "DECREASE_QUANTITY", payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };
export default CartContext;
