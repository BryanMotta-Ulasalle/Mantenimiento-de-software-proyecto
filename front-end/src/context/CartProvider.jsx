import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/errors";
import {
  addCartItem,
  deleteCartItem,
  fetchCurrentCart,
  updateCartItem,
} from "../features/orders/api/cartApi";
import useAuth from "../hooks/useAuth";
import { CartContext } from "./CartContext";

const EMPTY_CART = {
  id: null,
  items: [],
  total_price: "0.00",
};

const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      return EMPTY_CART;
    }

    try {
      setIsLoading(true);
      setError(null);
      const currentCart = await fetchCurrentCart(user.id);
      setCart(currentCart);
      return currentCart;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo cargar el carrito."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isActive = true;

    const loadCart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const currentCart = await fetchCurrentCart(user.id);
        if (isActive) setCart(currentCart);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(requestError, "No se pudo cargar el carrito."),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadCart();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user]);

  const addProduct = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("Debes iniciar sesion para usar el carrito.");
    }

    const currentCart = await fetchCurrentCart(user.id);
    const existingItem = currentCart.items.find(
      (item) => item.product?.id === productId,
    );

    if (existingItem) {
      await updateCartItem(existingItem.id, existingItem.quantity + quantity);
    } else {
      await addCartItem({ productId, quantity });
    }

    return refreshCart();
  };

  const changeItemQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      await deleteCartItem(itemId);
    } else {
      await updateCartItem(itemId, quantity);
    }

    return refreshCart();
  };

  const removeItem = async (itemId) => {
    await deleteCartItem(itemId);
    return refreshCart();
  };

  const visibleCart = isAuthenticated ? cart : EMPTY_CART;
  const itemCount = visibleCart.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const value = {
    cart: visibleCart,
    data: visibleCart,
    itemCount,
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    refreshCart,
    addProduct,
    changeItemQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
