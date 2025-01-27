"use server";

import {getActionsCart} from './cartActionPrisma'
//import {getActionsCart } from './cartActionsLocal'
const cartService = await getActionsCart();
export const fetchCartItems = cartService.fetchCartItems;
export const addToCartAction = cartService.addToCartAction;
export const removeCartItemAction = cartService.removeCartItemAction;
export const updateCartItemAction = cartService.updateCartItemAction;
export const fetchOrCreateCart = cartService.fetchOrCreateCart;
export const updateOrCreateCartItem = cartService.updateOrCreateCartItem;
export const updateCart = cartService.updateCart;
