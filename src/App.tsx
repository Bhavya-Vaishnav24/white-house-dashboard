import React, { useState, useEffect, useRef } from 'react'
import { 
  ShoppingBag, Plus, Minus, Trash2, MapPin, Search, Phone, 
  LogOut, Bell, Clock, CreditCard, CheckCircle, 
  ArrowRight, Lock, Filter, X, ExternalLink, Flame, Star
} from 'lucide-react'
import { 
  supabase
} from './supabaseClient'

// --- MENU INTERFACES ---
interface MenuItem {
  id: number
  name: string
  category: string
  description: string
  image: string
  price: number
  availability: boolean
  veg: boolean      // true for Veg (green dot), false for Non-Veg (red dot)
  popular?: boolean // true if shown in the horizontal popular slider
}

// --- CART INTERFACES ---
interface CartItem {
  item: MenuItem
  quantity: number
  activePrice: number
}

interface SupabaseOrder {
  id: string
  customer_name: string
  phone: string
  item_summary: string
  items: CartItem[]
  subtotal: number
  packaging: number
  total: number
  payment_status: string
  order_status: string
  maps_link: string
  created_at: string
}

// --- CATEGORIES LIST (Lovable Order) ---
const CATEGORIES = [
  'All',
  'Bites',
  'Sandwich',
  'Burgers',
  'Omelette',
  'Desserts',
  'Cut Fruits',
  'Maggie',
  'Rolls',
  'Combos',
  'Noodles',
  'Veg Starters',
  'Chicken Starters',
  'Pasta',
  'Fresh Fruit Juices',
  'Beverages',
  'Refreshments',
  'Milkshakes'
]

// --- MENU DATA (REAL EXPANDED MENU) ---
const MENU_ITEMS: MenuItem[] = [
  // Bites
  { id: 1, name: 'French Fries (M)', category: 'Bites', description: 'Crispy medium potato fries, served with ketchup.', price: 45, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-1?auto=format&fit=crop&w=500&q=80', availability: true, veg: true, popular: true },
  { id: 2, name: 'French Fries (L)', category: 'Bites', description: 'Crispy large potato fries, perfect for sharing.', price: 69, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-2?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 3, name: 'Peri Peri Fries (M)', category: 'Bites', description: 'Medium fries tossed in spicy peri peri powder.', price: 49, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-3?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 4, name: 'Peri Peri Fries (L)', category: 'Bites', description: 'Large fries loaded with spicy peri-peri seasoning.', price: 75, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-4?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 5, name: 'Chicken Popcorn', category: 'Bites', description: 'Bite-sized crispy tender chicken pops.', price: 69, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-5?auto=format&fit=crop&w=500&q=80', availability: true, veg: false, popular: true },
  { id: 6, name: 'Loaded Cheesy Fries', category: 'Bites', description: 'Crispy potato fries layered with liquid cheese.', price: 89, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-6?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 7, name: 'Chilli Garlic Pops', category: 'Bites', description: 'Golden garlic seasoned crispy potato pops.', price: 49, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-7?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 8, name: 'Veg Nuggets', category: 'Bites', description: 'Golden fried vegetable nuggets with dip.', price: 49, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-8?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 9, name: 'Chicken Nuggets', category: 'Bites', description: 'Crispy seasoned minced chicken nuggets.', price: 69, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-9?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },

  // Sandwich
  { id: 10, name: 'Veg Sandwich', category: 'Sandwich', description: 'Fresh vegetables, green chutney, and butter.', price: 49, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-10?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 11, name: 'Corn Sandwich', category: 'Sandwich', description: 'Sweet corn kernels, onion, and mayonnaise.', price: 59, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-11?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 12, name: 'Mushroom Sandwich', category: 'Sandwich', description: 'Spiced sautéed mushrooms in grilled bread.', price: 59, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-12?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 13, name: 'Paneer Sandwich', category: 'Sandwich', description: 'Spiced paneer cottage cheese filling.', price: 65, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-13?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 14, name: 'Chicken Sandwich', category: 'Sandwich', description: 'Seasoned chicken chunks with fresh cream mayo.', price: 75, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-14?auto=format&fit=crop&w=500&q=80', availability: true, veg: false, popular: true },

  // Burgers
  { id: 15, name: 'Veg Burger', category: 'Burgers', description: 'Vegetable patty, lettuce, onion, and mayo.', price: 49, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-15?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 16, name: 'Chicken Burger', category: 'Burgers', description: 'Crispy chicken patty, cheese, and burger spread.', price: 69, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-16?auto=format&fit=crop&w=500&q=80', availability: true, veg: false, popular: true },

  // Omelette
  { id: 17, name: 'Omelette', category: 'Omelette', description: 'Double egg omelette with onions and pepper.', price: 29, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-17?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 18, name: 'Bread Omelette', category: 'Omelette', description: 'Pan-fried double egg wrapped over toasted bread.', price: 39, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-18?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },

  // Desserts
  { id: 19, name: 'Vanilla Ice Cream', category: 'Desserts', description: 'Creamy scoop of vanilla bean ice cream.', price: 39, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-19?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 20, name: 'Chocolate Ice Cream', category: 'Desserts', description: 'Classic scoop of sweet chocolate ice cream.', price: 45, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-20?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 21, name: 'Brownie', category: 'Desserts', description: 'Rich hot chocolate fudge brownie block.', price: 49, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-21?auto=format&fit=crop&w=500&q=80', availability: true, veg: true, popular: true },
  { id: 22, name: 'Brownie with Ice Cream', category: 'Desserts', description: 'Warm brownie served with cold vanilla scoop.', price: 65, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-22?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Cut Fruits
  { id: 23, name: 'Mixed Fruit Bowl', category: 'Cut Fruits', description: 'Assorted diced seasonal fresh fruits.', price: 39, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-23?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 24, name: 'Mixed Fruit with Ice Cream', category: 'Cut Fruits', description: 'Seasonal fruits topped with vanilla gelato.', price: 55, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-24?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Maggie
  { id: 25, name: 'Veg Maggi', category: 'Maggie', description: 'Instant Maggi noodles with fresh veggies.', price: 39, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-25?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 26, name: 'Corn Maggi', category: 'Maggie', description: 'Maggi noodles tossed with sweet corn.', price: 45, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-26?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 27, name: 'Cheese Maggi', category: 'Maggie', description: 'Maggi cooked with melting cheese sauce.', price: 49, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-27?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 28, name: 'Egg Maggi', category: 'Maggie', description: 'Spiced Maggi noodles cooked with scrambled egg.', price: 49, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-28?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },

  // Rolls
  { id: 29, name: 'Chicken Jumbo Roll', category: 'Rolls', description: 'Double chicken roll with egg layers.', price: 110, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-29?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 30, name: 'Chicken Roll', category: 'Rolls', description: 'Classic spiced flatbread chicken wrap.', price: 80, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-30?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 31, name: 'Egg Roll', category: 'Rolls', description: 'Flatbread wrap layered with eggs and onions.', price: 50, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-31?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 32, name: 'Veg Roll', category: 'Rolls', description: 'Flatbread wrapped with vegetable croquettes.', price: 50, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-32?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 33, name: 'Mushroom Roll', category: 'Rolls', description: 'Spiced garlic mushroom flatbread wrap.', price: 65, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-33?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 34, name: 'Paneer Roll', category: 'Rolls', description: 'Spiced cottage cheese paneer cube wrap.', price: 70, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-34?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Combos
  { id: 35, name: 'Veg Sandwich + Fries + Coke', category: 'Combos', description: 'Veg sandwich, fries, and cold soda beverage combo.', price: 99, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-35?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 36, name: 'Chicken Sandwich + Fries + Coke', category: 'Combos', description: 'Chicken sandwich, fries, and cold soda beverage combo.', price: 129, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-36?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 37, name: 'Veg Burger + Fries + Coke', category: 'Combos', description: 'Veg burger, crispy potato fries, and soft drink.', price: 109, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-37?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 38, name: 'Chicken Burger + Fries + Coke', category: 'Combos', description: 'Chicken burger, crispy potato fries, and soft drink.', price: 129, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-38?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },

  // Noodles
  { id: 39, name: 'Chicken Schezwan Noodles (H)', category: 'Noodles', description: 'Half portion of fiery hot chicken schezwan stir-fried noodles.', price: 65, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-39?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 40, name: 'Chicken Schezwan Noodles (F)', category: 'Noodles', description: 'Full portion of fiery hot chicken schezwan stir-fried noodles.', price: 95, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-40?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 41, name: 'Chicken Noodles (H)', category: 'Noodles', description: 'Half portion of stir-fried noodles with chicken shreds.', price: 65, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-41?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 42, name: 'Chicken Noodles (F)', category: 'Noodles', description: 'Full portion of stir-fried noodles with chicken shreds.', price: 90, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-42?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 43, name: 'Egg Schezwan Noodles (H)', category: 'Noodles', description: 'Half portion of spicy egg schezwan noodles.', price: 55, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-43?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 44, name: 'Egg Schezwan Noodles (F)', category: 'Noodles', description: 'Full portion of spicy egg schezwan noodles.', price: 70, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-44?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 45, name: 'Egg Noodles (H)', category: 'Noodles', description: 'Half portion of wok-tossed egg noodles.', price: 50, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-45?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 46, name: 'Egg Noodles (F)', category: 'Noodles', description: 'Full portion of wok-tossed egg noodles.', price: 65, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-46?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 47, name: 'Veg Schezwan Noodles (H)', category: 'Noodles', description: 'Half portion of spicy stir-fried vegetable noodles.', price: 40, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-47?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 48, name: 'Veg Schezwan Noodles (F)', category: 'Noodles', description: 'Full portion of spicy stir-fried vegetable noodles.', price: 55, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-48?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 49, name: 'Veg Noodles', category: 'Noodles', description: 'Wok-tossed noodles with shredded vegetables.', price: 50, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-49?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Veg Starters
  { id: 50, name: 'Paneer Chilly (H)', category: 'Veg Starters', description: 'Half portion of paneer, bell pepper, and dark soy.', price: 60, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-50?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 51, name: 'Paneer Chilly (F)', category: 'Veg Starters', description: 'Full portion of paneer, bell pepper, and dark soy.', price: 80, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-51?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 52, name: 'Paneer Manchurian (H)', category: 'Veg Starters', description: 'Half portion of paneer balls in sweet & sour soy.', price: 60, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-52?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 53, name: 'Paneer Manchurian (F)', category: 'Veg Starters', description: 'Full portion of paneer balls in sweet & sour soy.', price: 80, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-53?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 54, name: 'Paneer Pepper Dry (H)', category: 'Veg Starters', description: 'Half portion of paneer tossed in black pepper.', price: 60, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-54?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 55, name: 'Paneer Pepper Dry (F)', category: 'Veg Starters', description: 'Full portion of paneer tossed in black pepper.', price: 80, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-55?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 56, name: 'Gobi Manchurian (H)', category: 'Veg Starters', description: 'Half portion of crispy cauliflower in ginger soy.', price: 50, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-56?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 57, name: 'Gobi Manchurian (F)', category: 'Veg Starters', description: 'Full portion of crispy cauliflower in ginger soy.', price: 70, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-57?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 58, name: 'Gobi Chilly (H)', category: 'Veg Starters', description: 'Half portion of crispy gobi tossed in soy-chilli.', price: 50, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-58?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 59, name: 'Gobi Chilly (F)', category: 'Veg Starters', description: 'Full portion of crispy gobi tossed in soy-chilli.', price: 70, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-59?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 60, name: 'Mushroom Chilly (H)', category: 'Veg Starters', description: 'Half portion of spiced chilly mushroom.', price: 50, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-60?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 61, name: 'Mushroom Chilly (F)', category: 'Veg Starters', description: 'Full portion of spiced chilly mushroom.', price: 70, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-61?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 62, name: 'Mushroom Manchurian (H)', category: 'Veg Starters', description: 'Half portion of crispy fried mushrooms in manchurian.', price: 50, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-62?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 63, name: 'Mushroom Manchurian (F)', category: 'Veg Starters', description: 'Full portion of crispy fried mushrooms in manchurian.', price: 70, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-63?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 64, name: 'Mushroom Pepper Dry (H)', category: 'Veg Starters', description: 'Half portion of mushrooms tossed in garlic pepper.', price: 50, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-64?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 65, name: 'Mushroom Pepper Dry (F)', category: 'Veg Starters', description: 'Full portion of mushrooms tossed in garlic pepper.', price: 70, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-65?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 66, name: 'Baby Corn Chilly (H)', category: 'Veg Starters', description: 'Half portion of baby corn cuts in chilli garlic.', price: 50, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-66?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 67, name: 'Baby Corn Chilly (F)', category: 'Veg Starters', description: 'Full portion of baby corn cuts in chilli garlic.', price: 70, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-67?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 68, name: 'Baby Corn Manchurian (H)', category: 'Veg Starters', description: 'Half portion of crispy baby corn in ginger soy.', price: 50, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-68?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 69, name: 'Baby Corn Manchurian (F)', category: 'Veg Starters', description: 'Full portion of crispy baby corn in ginger soy.', price: 70, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-69?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 70, name: 'Baby Corn Pepper Dry (H)', category: 'Veg Starters', description: 'Half portion of baby corn seasoned with black pepper.', price: 50, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-70?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 71, name: 'Baby Corn Pepper Dry (F)', category: 'Veg Starters', description: 'Full portion of baby corn seasoned with black pepper.', price: 70, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-71?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Chicken Starters
  { id: 72, name: 'Dragon Chicken Boneless (H)', category: 'Chicken Starters', description: 'Half portion of sweet-spicy chicken strips fried with cashews.', price: 70, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-72?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 73, name: 'Dragon Chicken Boneless (F)', category: 'Chicken Starters', description: 'Full portion of sweet-spicy chicken strips fried with cashews.', price: 120, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-73?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 74, name: 'Andhra Style Chilly Chicken (H)', category: 'Chicken Starters', description: 'Half portion of green chilli hot chicken stir-fry.', price: 70, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-74?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 75, name: 'Andhra Style Chilly Chicken (F)', category: 'Chicken Starters', description: 'Full portion of green chilli hot chicken stir-fry.', price: 120, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-75?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 76, name: 'Chilly Chicken (H)', category: 'Chicken Starters', description: 'Half portion of classic dark soy chilli chicken.', price: 70, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-76?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 77, name: 'Chilly Chicken (F)', category: 'Chicken Starters', description: 'Full portion of classic dark soy chilli chicken.', price: 120, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-77?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 78, name: 'Lemon Chicken (H)', category: 'Chicken Starters', description: 'Half portion of sweet-sour glazed lemon chicken.', price: 70, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-78?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 79, name: 'Lemon Chicken (F)', category: 'Chicken Starters', description: 'Full portion of sweet-sour glazed lemon chicken.', price: 120, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-79?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 80, name: 'Chicken Schezwan (H)', category: 'Chicken Starters', description: 'Half portion of chicken in spicy schezwan red chili.', price: 70, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-80?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 81, name: 'Chicken Schezwan (F)', category: 'Chicken Starters', description: 'Full portion of chicken in spicy schezwan red chili.', price: 120, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-81?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 82, name: 'Chicken Manchurian (H)', category: 'Chicken Starters', description: 'Half portion of sweet-ginger glazed chicken pieces.', price: 70, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-82?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 83, name: 'Chicken Manchurian (F)', category: 'Chicken Starters', description: 'Full portion of sweet-ginger glazed chicken pieces.', price: 120, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-83?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 84, name: 'Chicken Pepper Dry (H)', category: 'Chicken Starters', description: 'Half portion of black pepper chicken toss with curry leaves.', price: 70, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-84?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 85, name: 'Chicken Pepper Dry (F)', category: 'Chicken Starters', description: 'Full portion of black pepper chicken toss with curry leaves.', price: 120, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-85?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 86, name: 'Chicken 65 (H)', category: 'Chicken Starters', description: 'Half portion of deep-fried chicken spiced with curry leaves and yogurt.', price: 70, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-86?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 87, name: 'Chicken 65 (F)', category: 'Chicken Starters', description: 'Full portion of deep-fried chicken spiced with curry leaves and yogurt.', price: 120, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-87?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 88, name: 'Garlic Chicken (H)', category: 'Chicken Starters', description: 'Half portion of garlic and soy reduction glazed chicken.', price: 70, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-88?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 89, name: 'Garlic Chicken (F)', category: 'Chicken Starters', description: 'Full portion of garlic and soy reduction glazed chicken.', price: 120, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-89?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 90, name: 'Chicken Kabab (H)', category: 'Chicken Starters', description: 'Half portion of deep fried local spiced bone chicken.', price: 60, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-90?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 91, name: 'Chicken Kabab (F)', category: 'Chicken Starters', description: 'Full portion of deep fried local spiced bone chicken.', price: 110, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-91?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },

  // Pasta
  { id: 92, name: 'Red Hot Chicken Pan Pasta', category: 'Pasta', description: 'Penne cooked in red hot tomato and chicken mix.', price: 100, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-92?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 93, name: 'Veg Fiesta Pasta', category: 'Pasta', description: 'Rich rose sauce pasta with mixed vegetables.', price: 65, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-93?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 94, name: 'Alfredo Pasta', category: 'Pasta', description: 'White creamy sauce pasta with herbs and cheese.', price: 100, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-94?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 95, name: 'Sweet Corn White Pasta', category: 'Pasta', description: 'White sauce pasta with sweet corn kernels.', price: 65, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-95?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Fresh Fruit Juices
  { id: 96, name: 'Watermelon Juice', category: 'Fresh Fruit Juices', description: 'Fresh pressed sweet watermelon juice.', price: 39, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-96?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 97, name: 'Muskmelon Juice', category: 'Fresh Fruit Juices', description: 'Fresh muskmelon blend, sweet and cold.', price: 39, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-97?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 98, name: 'Mosambi Juice', category: 'Fresh Fruit Juices', description: 'Freshly pressed sweet lime mosambi juice.', price: 39, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-98?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 99, name: 'Pineapple Juice', category: 'Fresh Fruit Juices', description: 'Sweet tangy tropical pineapple juice.', price: 39, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-99?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 100, name: 'Orange Juice', category: 'Fresh Fruit Juices', description: 'Freshly squeezed citrus orange juice.', price: 39, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-100?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 101, name: 'Apple Juice', category: 'Fresh Fruit Juices', description: 'Freshly blended red apple juice.', price: 49, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-101?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 102, name: 'Mixed Fruit Juice', category: 'Fresh Fruit Juices', description: 'Health blend of seasonal fruit pulp.', price: 49, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-102?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 103, name: 'Pomegranate Juice', category: 'Fresh Fruit Juices', description: 'Antioxidant red pomegranate seed juice.', price: 49, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-103?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Beverages
  { id: 104, name: 'Plain Milk', category: 'Beverages', description: 'Fresh hot plain milk cup.', price: 12, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-104?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 105, name: 'Tea', category: 'Beverages', description: 'Steaming hot local tea brew.', price: 12, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-105?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 106, name: 'Coffee', category: 'Beverages', description: 'Hot brewed filter coffee.', price: 15, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-106?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 107, name: 'Black Coffee', category: 'Beverages', description: 'Strong brewed hot black coffee.', price: 12, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-107?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 108, name: 'Lemon Tea', category: 'Beverages', description: 'Black tea infused with lemon squeeze.', price: 12, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-108?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 109, name: 'Boost', category: 'Beverages', description: 'Hot milk with chocolate Boost malt.', price: 17, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-109?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 110, name: 'Horlicks', category: 'Beverages', description: 'Hot milk mixed with Horlicks powder.', price: 17, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-110?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 111, name: 'Badam Milk', category: 'Beverages', description: 'Hot milk flavored with almonds and cardamom.', price: 17, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-111?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 112, name: 'Hot Chocolate', category: 'Beverages', description: 'Rich cocoa powder in hot steamed milk.', price: 25, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-112?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 113, name: 'Cold Coffee', category: 'Beverages', description: 'Thick blended sweet cold coffee.', price: 45, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-113?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Refreshments
  { id: 114, name: 'Curacao Mojito', category: 'Refreshments', description: 'Blue Curacao syrup, mint, lime, and soda.', price: 39, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-114?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 115, name: 'Classic Mojito', category: 'Refreshments', description: 'Fresh lime, mint, sugar, and sparkling soda.', price: 39, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-115?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 116, name: 'Salt Lime Soda', category: 'Refreshments', description: 'Fresh lime juice, soda and salt.', price: 25, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-116?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 117, name: 'Sweet Lime Soda', category: 'Refreshments', description: 'Fresh lime juice, soda and sugar.', price: 25, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-117?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 118, name: 'Salt Lassi', category: 'Refreshments', description: 'Chilled salted yogurt drink.', price: 29, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-118?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 119, name: 'Sweet Lassi', category: 'Refreshments', description: 'Creamy sweet whipped lassi drink.', price: 29, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-119?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 120, name: 'Butter Milk', category: 'Refreshments', description: 'Spiced butter milk with coriander and ginger.', price: 15, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-120?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Milkshakes
  { id: 121, name: 'Banana Milkshake', category: 'Milkshakes', description: 'Creamy milkshake blended with fresh banana.', price: 49, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-121?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 122, name: 'Papaya Milkshake', category: 'Milkshakes', description: 'Creamy thick papaya milkshake.', price: 49, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-122?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 123, name: 'Muskmelon Milkshake', category: 'Milkshakes', description: 'Refreshing sweet muskmelon shake.', price: 49, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-123?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 124, name: 'Pomegranate Milkshake', category: 'Milkshakes', description: 'Rich pomegranate milkshake blend.', price: 59, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-124?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 125, name: 'Butter Fruit Milkshake', category: 'Milkshakes', description: 'Rich thick avocado milkshake.', price: 69, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-125?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 126, name: 'Mango Milkshake', category: 'Milkshakes', description: 'Mango pulp blended with milk and vanilla.', price: 59, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-126?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 127, name: 'Apple Milkshake', category: 'Milkshakes', description: 'Smooth red apple shake with honey.', price: 59, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-127?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 128, name: 'Chocolate Milkshake', category: 'Milkshakes', description: 'Chocolate syrup shake with cocoa powder.', price: 59, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-128?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 129, name: 'Vanilla Milkshake', category: 'Milkshakes', description: 'Sweet milk blended with vanilla bean gelato.', price: 59, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-129?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 130, name: 'Oreo Milkshake', category: 'Milkshakes', description: 'Thick shake with crushed Oreo cookies.', price: 69, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-130?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 131, name: 'Kitkat Milkshake', category: 'Milkshakes', description: 'Creamy shake blended with KitKat chunks.', price: 69, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-131?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },

  // Fried Rice
  { id: 132, name: 'Chicken Triple Schezwan Fried Rice', category: 'Fried Rice', description: 'Fried rice with chicken chunks, schezwan gravy, and fried noodles.', price: 110, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-132?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 133, name: 'Schezwan Chicken Fried Rice (H)', category: 'Fried Rice', description: 'Half portion of spicy schezwan chicken fried rice.', price: 70, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352-133?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 134, name: 'Schezwan Chicken Fried Rice (F)', category: 'Fried Rice', description: 'Full portion of spicy schezwan chicken fried rice.', price: 95, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929-134?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 135, name: 'Chicken Fried Rice (H)', category: 'Fried Rice', description: 'Half portion of wok tossed chicken fried rice.', price: 65, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445-135?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 136, name: 'Chicken Fried Rice (F)', category: 'Fried Rice', description: 'Full portion of wok tossed chicken fried rice.', price: 90, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601-136?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 137, name: 'Schezwan Egg Rice (H)', category: 'Fried Rice', description: 'Half portion of spicy schezwan scrambled egg rice.', price: 55, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327-137?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 138, name: 'Schezwan Egg Rice (F)', category: 'Fried Rice', description: 'Full portion of spicy schezwan scrambled egg rice.', price: 70, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061-138?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 139, name: 'Egg Fried Rice (H)', category: 'Fried Rice', description: 'Half portion of wok tossed egg fried rice.', price: 50, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836-139?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 140, name: 'Egg Fried Rice (F)', category: 'Fried Rice', description: 'Full portion of wok tossed egg fried rice.', price: 65, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c-140?auto=format&fit=crop&w=500&q=80', availability: true, veg: false },
  { id: 141, name: 'Schezwan Veg Fried Rice', category: 'Fried Rice', description: 'Spicy stir-fried vegetable rice.', price: 60, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38-141?auto=format&fit=crop&w=500&q=80', availability: true, veg: true },
  { id: 142, name: 'Veg Fried Rice', category: 'Fried Rice', description: 'Classic wok-tossed mixed vegetable rice.', price: 50, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543-142?auto=format&fit=crop&w=500&q=80', availability: true, veg: true }
]

// --- WEB AUDIO API CHIME ---
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      
      gainNode.gain.setValueAtTime(0.25, start)
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05)
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      osc.start(start)
      osc.stop(start + duration)
    }

    // Double chime: G5 (783.99Hz) then C6 (1046.50Hz)
    playTone(783.99, now, 0.4)
    playTone(1046.50, now + 0.12, 0.8)
  } catch (err) {
    console.error('Failed to play chime synthesizer:', err)
  }
}

// Parses latitude/longitude from google maps link q=lat,lng
const getCoordinatesFromUrl = (url: string) => {
  if (!url) return null
  try {
    const match = url.match(/q=([-+]?\d*\.\d+|\d+),([-+]?\d*\.\d+|\d+)/)
    if (match && match[1] && match[2]) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
    }
  } catch (e) {
    console.error('Error parsing coordinates from maps url:', e)
  }
  return null
}

export default function App() {
  // Navigation: 'customer' | 'admin'
  const [view, setView] = useState<'customer' | 'admin'>('customer')
  
  // --- CUSTOMER APP STATES ---
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [menuSearch, setMenuSearch] = useState('')
  const [vegFilter, setVegFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All') // Filter chip state

  // Category sticky header reference
  const categoryBarRef = useRef<HTMLDivElement>(null)

  // Geolocation states
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Checkout Form
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)
  
  // Success Screen
  const [placedOrder, setPlacedOrder] = useState<any | null>(null)
  
  // --- ADMIN AUTH STATES ---
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminSession, setAdminSession] = useState<any | null>(null)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  // --- ADMIN DASHBOARD STATES ---
  const [orders, setOrders] = useState<SupabaseOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState<SupabaseOrder | null>(null)
  const [newOrderToast, setNewOrderToast] = useState<{ id: string; name: string } | null>(null)

  // Webhook and connection integrations from build environment variables
  const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''

  // Sync state navigation with URL pathname / and /admin
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname
      if (path.startsWith('/admin')) {
        setView('admin')
      } else {
        setView('customer')
      }
    }
    handleUrlRouting()
    window.addEventListener('popstate', handleUrlRouting)
    return () => window.removeEventListener('popstate', handleUrlRouting)
  }, [])

  // Scroll handler to jump directly to Browse Menu section
  const handleScrollToMenu = () => {
    const el = document.getElementById('browse-menu-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Check Admin Session on mount
  useEffect(() => {
    const client = supabase
    if (!client) return

    client.auth.getSession().then(({ data: { session } }) => {
      setAdminSession(session)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Admin orders realtime subscription
  useEffect(() => {
    const client = supabase
    if (!client || !adminSession) return

    fetchOrders()

    const ordersChannel = client
      .channel('orders-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as SupabaseOrder
          setOrders(prev => [newOrder, ...prev])
          playChime()
          setNewOrderToast({ id: newOrder.id, name: newOrder.customer_name })
          setTimeout(() => setNewOrderToast(null), 5000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as SupabaseOrder
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
          if (selectedOrder && selectedOrder.id === updatedOrder.id) {
            setSelectedOrder(updatedOrder)
          }
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(ordersChannel)
    }
  }, [adminSession])

  // Get orders list
  const fetchOrders = async () => {
    const client = supabase
    if (!client) return
    setLoadingOrders(true)
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('Error loading orders:', err.message)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Handle Admin Status updates
  const handleUpdateStatus = async (orderId: string, statusType: 'order' | 'payment', newValue: string) => {
    const client = supabase
    if (!client) return
    try {
      const field = statusType === 'order' ? 'order_status' : 'payment_status'
      const { error } = await client
        .from('orders')
        .update({ [field]: newValue })
        .eq('id', orderId)
      
      if (error) throw error
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    }
  }

  // Handle Admin Log in
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = supabase
    if (!client) return
    setAuthLoading(true)
    setAuthError('')
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      })
      if (error) throw error
      setAdminSession(data.session)
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handle Admin Log out
  const handleAdminLogout = async () => {
    const client = supabase
    if (!client) return
    await client.auth.signOut()
    setAdminSession(null)
  }

  // --- CART SYSTEM ---
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id)
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { item, quantity: 1, activePrice: item.price }]
    })
  }

  const updateCartQty = (itemId: number, change: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.item.id === itemId) {
          const newQty = i.quantity + change
          return newQty > 0 ? { ...i, quantity: newQty } : null
        }
        return i
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId))
  }

  // Total Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.activePrice * item.quantity), 0)
  const packagingFee = cart.length > 0 ? 5 : 0
  const total = subtotal + packagingFee

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Location capturing handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setLocationLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat)
        setLongitude(lng)
        const link = `https://www.google.com/maps?q=${lat},${lng}`
        setMapsLink(link)
        setLocationLoading(false)
      },
      (error) => {
        console.error('Error fetching location:', error)
        let msg = 'Failed to fetch location.'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow location access to continue.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location coordinates are unavailable.'
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.'
        }
        setLocationError(msg)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  // Submit Customer Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = supabase
    if (!client) {
      alert('Supabase database client not configured.')
      return
    }

    if (!customerName || !phone) {
      alert('Please fill in your name and phone number.')
      return
    }

    if (!latitude || !longitude) {
      alert('Please click "Use Current Location" to provide your delivery coordinates.')
      return
    }

    setSubmittingOrder(true)

    // Format item summary for quick counter display
    const itemSummary = cart.map(i => `${i.quantity} x ${i.item.name}`).join(', ')

    const orderData = {
      customer_name: customerName,
      phone: phone,
      item_summary: itemSummary,
      items: cart,
      subtotal: subtotal,
      packaging: packagingFee,
      total: total,
      maps_link: mapsLink
    }

    try {
      const { data, error } = await client
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error

      setPlacedOrder(data)
      setCart([])
      setLatitude(null)
      setLongitude(null)
      setMapsLink('')
      setIsCheckoutOpen(false)
      setIsCartOpen(false)

      if (n8nWebhookUrl) {
        const payload = {
          order_id: data.id,
          customer_name: data.customer_name,
          phone: data.phone,
          item_summary: data.item_summary,
          total: data.total,
          order_status: data.order_status,
          maps_link: data.maps_link
        }
        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.error('Failed to trigger client n8n webhook:', err))
      }
    } catch (err: any) {
      alert('Failed to place order: ' + err.message)
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Live order status poll (for success screen)
  useEffect(() => {
    const client = supabase
    if (!placedOrder || !client) return

    const successChannel = client
      .channel(`order-success-${placedOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${placedOrder.id}` },
        (payload) => {
          setPlacedOrder(payload.new)
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(successChannel)
    }
  }, [placedOrder])

  // Filter & Search Orders (Admin Dashboard)
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.item_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery)
      
    const matchesStatus = statusFilter === 'All' || order.order_status === statusFilter.toLowerCase()
    const matchesPayment = paymentFilter === 'All' || order.payment_status === paymentFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPayment
  })

  // Filter menu items by Category + Veg + Search (Customer Digital Menu)
  const displayedMenuItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(menuSearch.toLowerCase())
    
    let matchesVeg = true
    if (vegFilter === 'Veg') matchesVeg = item.veg === true
    if (vegFilter === 'Non-Veg') matchesVeg = item.veg === false

    return matchesCategory && matchesSearch && matchesVeg
  })

  // Popular items filter
  const popularMenuItems = MENU_ITEMS.filter(item => item.popular === true)

  return (
    <div className="app-root">
      {/* --- CUSTOMER VIEW --- */}
      {view === 'customer' && (
        <div className="customer-app-wrapper">
          {/* Transparent Floating Glass Header */}
          <header className="glass-header">
            <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>W</div>
                <div>
                  <h1 className="brand-title" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>White House</h1>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', fontWeight: 'bold', marginTop: '-2px' }}>Cafe & Bistro</p>
                </div>
              </div>
              <div></div>
            </div>
          </header>

          {/* Placed Order Success Screen */}
          {placedOrder ? (
            <div className="container" style={{ padding: '0 1rem' }}>
              <div className="success-card">
                <div className="success-icon-wrapper">
                  <CheckCircle size={28} />
                </div>
                <h2 className="brand-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Thank you, {placedOrder.customer_name}. Your order has been dispatched to the kitchen.
                </p>

                <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>#{placedOrder.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bill Amount:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>₹{placedOrder.total}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.85rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Payment:</span>
                    <span className={`badge badge-${placedOrder.payment_status}`}>{placedOrder.payment_status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.65rem', marginTop: '0.65rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Status:</span>
                    <span className={`badge badge-${placedOrder.order_status}`}>{placedOrder.order_status}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => setPlacedOrder(null)}
                >
                  Order Something Else
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. HERO SECTION (Zomato Banner style) */}
              <div className="hero-container">
                <div className="hero-overlay-card">
                  <h1 className="brand-title hero-title">White House Cafe</h1>
                  <div className="hero-badges-row">
                    <span className="hero-badge-pill rating"><Star size={12} fill="currentColor" /> 4.7 (2.1k)</span>
                    <span className="hero-badge-pill"><Clock size={12} /> 20–30 min</span>
                    <span className="hero-badge-pill">Packaging ₹5 flat</span>
                  </div>
                  <button className="btn btn-primary start-ordering-btn" style={{ padding: '0.85rem 2.25rem', fontSize: '0.95rem', fontWeight: 'bold' }} onClick={handleScrollToMenu}>
                    Start Ordering
                  </button>
                </div>
              </div>

              {/* Centered Main Content Wrapper */}
              <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem 5rem 1.5rem' }}>
                
                {/* 2. SEARCH & FILTER SECTION */}
                <div className="search-filter-container">
                  <div className="search-pill-wrapper">
                    <Search size={16} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      className="search-pill-input" 
                      placeholder="Search menu..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                    />
                  </div>
                  <div className="filter-chips-group">
                    {(['All', 'Veg', 'Non-Veg'] as const).map(f => (
                      <button 
                        key={f}
                        className={`filter-chip ${vegFilter === f ? 'active' : ''}`}
                        onClick={() => setVegFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. POPULAR SECTION (Horizontal Slider) */}
                {menuSearch === '' && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div className="popular-header">
                      <Flame size={18} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
                      <span>Popular right now</span>
                    </div>
                    <div className="popular-slider">
                      {popularMenuItems.map(item => {
                        const cartItem = cart.find(i => i.item.id === item.id)
                        return (
                          <div key={item.id} className="popular-item-card">
                            <div className="popular-card-image-wrapper">
                              <img src={item.image} alt={item.name} className="popular-card-image" />
                              <div className="popular-card-dot">
                                <span className={`food-type-icon ${item.veg ? 'veg' : 'non-veg'}`}>
                                  <span className="food-type-dot"></span>
                                </span>
                              </div>
                            </div>
                            <div className="popular-card-content">
                              <h4 className="popular-card-title">{item.name}</h4>
                              <div className="popular-card-footer">
                                <span className="popular-card-price">₹{item.price}</span>
                                {cartItem ? (
                                  <div className="qty-pill-controller">
                                    <button className="qty-pill-btn" onClick={() => updateCartQty(item.id, -1)}><Minus size={11} /></button>
                                    <span className="qty-pill-value">{cartItem.quantity}</span>
                                    <button className="qty-pill-btn" onClick={() => addToCart(item)}><Plus size={11} /></button>
                                  </div>
                                ) : (
                                  <button className="add-pill-btn" onClick={() => addToCart(item)}>ADD</button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. BROWSE MENU SECTION */}
                <div id="browse-menu-section" className="browse-menu-header">
                  <h2>Browse Menu</h2>
                </div>

                {/* Sticky category pills (horizontal, scrollable) */}
                <div ref={categoryBarRef} className="sticky-category-bar">
                  <div className="category-pills-slider">
                    {CATEGORIES.map(category => (
                      <button 
                        key={category}
                        className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. MENU ITEM CARDS (Vertical Rows, left text, right image + overlay button) */}
                <div className="menu-cards-list">
                  {displayedMenuItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                      <ShoppingBag size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                      <p>No dishes found matching your criteria.</p>
                    </div>
                  ) : (
                    displayedMenuItems.map(item => {
                      const cartItem = cart.find(i => i.item.id === item.id)
                      return (
                        <div key={item.id} className="menu-item-row-card">
                          
                          {/* Card Content Left */}
                          <div className="menu-item-left">
                            <div className="menu-item-indicator-row">
                              <span className={`food-type-icon ${item.veg ? 'veg' : 'non-veg'}`}>
                                <span className="food-type-dot"></span>
                              </span>
                              {item.popular && <span className="menu-item-popular-badge">★ Popular</span>}
                            </div>
                            <h3 className="menu-item-name">{item.name}</h3>
                            <p className="menu-item-meta">{item.category} • White House Cafe</p>
                            <div className="menu-item-price">₹{item.price}</div>
                          </div>

                          {/* Card Image / Button Right */}
                          <div className={`menu-item-right ${item.image ? '' : 'no-image'}`}>
                            {item.image && (
                              <img src={item.image} alt={item.name} className="menu-item-food-image" />
                            )}
                            <div className="menu-item-btn-positioner">
                              {cartItem ? (
                                <div className="qty-pill-controller" style={{ height: '30px' }}>
                                  <button className="qty-pill-btn" style={{ width: '28px' }} onClick={() => updateCartQty(item.id, -1)}><Minus size={12} /></button>
                                  <span className="qty-pill-value" style={{ width: '20px' }}>{cartItem.quantity}</span>
                                  <button className="qty-pill-btn" style={{ width: '28px' }} onClick={() => addToCart(item)}><Plus size={12} /></button>
                                </div>
                              ) : (
                                <button className="add-pill-btn" style={{ padding: '0.45rem 1.4rem', fontSize: '0.8rem' }} onClick={() => addToCart(item)}>
                                  ADD
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      )
                    })
                  )}
                </div>

              </div>
            </>
          )}

          {/* 6. CART: Mobile Floating Cart Button */}
          {cart.length > 0 && (
            <button className="floating-cart" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={18} />
              <span>View Cart ({cartItemsCount} items)</span>
              <span style={{ marginLeft: 'auto', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.5rem', borderRadius: '20px' }}>₹{total}</span>
            </button>
          )}

          {/* Mobile Cart Drawer Overlay & Body */}
          {isCartOpen && (
            <>
              <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)} />
              <div className="cart-drawer">
                <div className="cart-header">
                  <h2 className="brand-title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingBag size={18} /> Your Cart
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                      <ShoppingBag size={40} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                      <p>Your cart is empty.</p>
                    </div>
                  ) : (
                    cart.map(cartItem => (
                      <div key={cartItem.item.id} className="cart-item">
                        <div className="cart-item-info">
                          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className={`food-type-icon ${cartItem.item.veg ? 'veg' : 'non-veg'}`} style={{ width: '10px', height: '10px', borderWidth: '1px', padding: '0px' }}>
                              <span className="food-type-dot" style={{ width: '4px', height: '4px' }}></span>
                            </span>
                            <span>{cartItem.item.name}</span>
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            ₹{cartItem.activePrice} x {cartItem.quantity}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <div className="qty-pill-controller" style={{ height: '30px' }}>
                              <button className="qty-pill-btn" style={{ width: '26px' }} onClick={() => updateCartQty(cartItem.item.id, -1)}><Minus size={12} /></button>
                              <span className="qty-pill-value" style={{ width: '20px' }}>{cartItem.quantity}</span>
                              <button className="qty-pill-btn" style={{ width: '26px' }} onClick={() => addToCart(cartItem.item)}><Plus size={12} /></button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(cartItem.item.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="summary-row">
                      <span>Parcel Charge</span>
                      <span>₹{packagingFee}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Grand Total</span>
                      <span>₹{total}</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      Checkout <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 7. CHECKOUT: Location capturing and form */}
          {isCheckoutOpen && (
            <div className="checkout-modal-overlay">
              <div className="checkout-modal">
                <div className="checkout-header">
                  <h2 className="brand-title" style={{ fontSize: '1.1rem' }}>Delivery Checkout</h2>
                  <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handlePlaceOrder} className="checkout-body">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">WhatsApp Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Location capture block */}
                  <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Delivery Location Coordinates *</label>
                    
                    {latitude && longitude ? (
                      <div className="location-box success">
                        <CheckCircle size={18} style={{ color: 'var(--success)', marginBottom: '0.25rem' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}>Coordinates Captured</div>
                          <div className="location-text" style={{ marginTop: '0.15rem' }}>Latitude: {latitude.toFixed(6)}</div>
                          <div className="location-text">Longitude: {longitude.toFixed(6)}</div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', height: '28px', marginTop: '0.25rem' }}
                          onClick={handleGetLocation}
                        >
                          Change Coordinates
                        </button>
                      </div>
                    ) : (
                      <div className="location-box">
                        <MapPin size={18} style={{ color: 'var(--accent)', marginBottom: '0.25rem' }} />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}>One-Click Location Capture</div>
                          <div className="location-text" style={{ marginTop: '0.15rem', maxWidth: '280px' }}>
                            {locationError ? (
                              <span style={{ color: 'var(--danger)', fontWeight: '500' }}>{locationError}</span>
                            ) : (
                              'Click below to allow location access and generate your delivery route.'
                            )}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          style={{ width: '100%', gap: '0.35rem', height: '36px', fontSize: '0.75rem', marginTop: '0.5rem' }}
                          onClick={handleGetLocation}
                          disabled={locationLoading}
                        >
                          {locationLoading ? (
                            <>
                              <div className="flex-center" style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
                              Acquiring position...
                            </>
                          ) : (
                            <>
                              <MapPin size={14} /> Use Current Location
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>Subtotal:</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Parcel Charge (₹5):</span>
                      <span>₹{packagingFee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.25rem' }}>
                      <span>Grand Total:</span>
                      <span style={{ color: 'var(--accent)' }}>₹{total}</span>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.85rem' }}
                      disabled={submittingOrder || !latitude || !longitude}
                    >
                      {submittingOrder ? 'Inserting Order...' : (!latitude || !longitude) ? 'Awaiting Coordinates' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADMIN VIEW --- */}
      {view === 'admin' && (
        <div className="admin-app-wrapper">
          {/* Admin Login Screen */}
          {!adminSession ? (
            <div className="login-container">
              <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>W</div>
                  <h2 className="brand-title" style={{ fontSize: '1.4rem', color: '#fff' }}>White House Cafe</h2>
                  <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Admin Control Panel</p>
                </div>

                <form onSubmit={handleAdminLogin}>
                  {authError && (
                    <div style={{ backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                      {authError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Admin Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@whitehousecafe.com"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      required 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', gap: '0.5rem' }}
                    disabled={authLoading}
                  >
                    <Lock size={16} /> {authLoading ? 'Authenticating...' : 'Sign In'}
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ width: '100%', marginTop: '0.75rem' }}
                    onClick={() => {
                      window.history.pushState({}, '', '/')
                      setView('customer')
                    }}
                  >
                    Back to Digital Menu
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Admin Dashboard Layout */
            <div className="dashboard-grid">
              {/* Sidebar */}
              <aside className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>W</div>
                  <div>
                    <h2 className="brand-title" style={{ fontSize: '1rem' }}>White House</h2>
                    <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '-2px', textTransform: 'uppercase' }}>Console</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>Main</div>
                  <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--border-focus)' }}>
                    <Bell size={16} /> Live Orders
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} title={adminSession.user.email}>{adminSession.user.email.split('@')[0]} (Admin)</span>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', gap: '0.5rem', justifyContent: 'center', color: 'var(--danger)' }}
                    onClick={handleAdminLogout}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </aside>

              {/* Main Console Content */}
              <main className="dashboard-main">
                {/* Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Active Order Feed</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time synchronization active</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => {
                      window.history.pushState({}, '', '/')
                      setView('customer')
                    }}>
                      Customer App <ExternalLink size={14} />
                    </button>
                    <button className="btn btn-primary" onClick={fetchOrders}>
                      Refresh Feed
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="filter-bar">
                  <div className="search-input-wrapper">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      className="form-input search-input" 
                      placeholder="Search orders (ID, customer name, summary...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filters-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
                      <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Order:</span>
                    </div>
                    {['All', 'New', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map(filter => (
                      <button 
                        key={filter} 
                        className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
                        onClick={() => setStatusFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="filters-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
                      <CreditCard size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment:</span>
                    </div>
                    {['All', 'Pending', 'Paid', 'Failed'].map(filter => (
                      <button 
                        key={filter} 
                        className={`filter-btn ${paymentFilter === filter ? 'active' : ''}`}
                        onClick={() => setPaymentFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Table */}
                <div className="table-container">
                  {loadingOrders ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                      <span>Loading incoming orders...</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Bell size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                      <p>No orders found matching the filter criteria.</p>
                    </div>
                  ) : (
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Time</th>
                          <th>Customer</th>
                          <th>Phone</th>
                          <th>Item Summary</th>
                          <th>Total</th>
                          <th>Payment Status</th>
                          <th>Order Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(order => (
                          <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                            <td style={{ fontWeight: 'bold' }}>#{order.id}</td>
                            <td className="order-time">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              <div style={{ fontSize: '0.65rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                            </td>
                            <td style={{ fontWeight: '500' }}>{order.customer_name}</td>
                            <td style={{ fontSize: '0.85rem' }}>{order.phone}</td>
                            <td>
                              <div className="order-summary-text" title={order.item_summary}>
                                {order.item_summary}
                              </div>
                            </td>
                            <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>₹{order.total}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <select 
                                className="select-dark"
                                value={order.payment_status}
                                onChange={(e) => handleUpdateStatus(order.id, 'payment', e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <select 
                                className={`select-dark badge-${order.order_status}`}
                                value={order.order_status}
                                onChange={(e) => handleUpdateStatus(order.id, 'order', e.target.value)}
                                style={{ fontWeight: 'bold' }}
                              >
                                <option value="new">New</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {order.maps_link ? (
                                  <a href={order.maps_link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-icon" title="View Map Route" style={{ width: '32px', height: '32px' }}>
                                    <MapPin size={14} />
                                  </a>
                                ) : (
                                  <div style={{ width: '32px', height: '32px' }} />
                                )}
                                <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => setSelectedOrder(order)} title="View Details">
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Live sound and Toast alert for new orders */}
                {newOrderToast && (
                  <div className="toast">
                    <Bell size={18} style={{ color: 'var(--accent)', animation: 'bounce 1s infinite' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>New Order Received!</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{newOrderToast.id} from {newOrderToast.name}</div>
                    </div>
                  </div>
                )}

                {/* Detailed view Modal */}
                {selectedOrder && (
                  <div className="checkout-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="checkout-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                      <div className="checkout-header">
                        <h2 className="brand-title" style={{ fontSize: '1.1rem' }}>Order Details #{selectedOrder.id}</h2>
                        <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                          <X size={20} />
                        </button>
                      </div>
                      <div className="checkout-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Customer Details</span>
                            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginTop: '0.2rem' }}>{selectedOrder.customer_name}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <Phone size={12} /> {selectedOrder.phone}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Delivery Context</span>
                            <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Placed: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                            {selectedOrder.maps_link ? (
                              <>
                                <a href={selectedOrder.maps_link} target="_blank" rel="noopener noreferrer" className="link-maps" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                  <MapPin size={12} /> View Google Maps Link <ExternalLink size={10} />
                                </a>
                                {(() => {
                                  const coords = getCoordinatesFromUrl(selectedOrder.maps_link)
                                  return coords ? (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                      Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                    </div>
                                  ) : null
                                })()}
                              </>
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>No Location details provided</div>
                            )}
                          </div>
                        </div>

                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order Items Summary</h4>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                          {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                            selectedOrder.items.map((cartItem: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.4rem', marginBottom: '0.4rem', borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                                <span>
                                  {cartItem.quantity} x {cartItem.item?.name || 'Item'}
                                </span>
                                <span style={{ fontWeight: 'bold' }}>₹{cartItem.activePrice * cartItem.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '0.85rem' }}>{selectedOrder.item_summary}</p>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.4rem' }}>
                            <span>Subtotal</span>
                            <span>₹{selectedOrder.subtotal}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            <span>Parcel Charge</span>
                            <span>₹{selectedOrder.packaging}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginTop: '0.4rem' }}>
                            <span>Grand Total</span>
                            <span style={{ color: 'var(--accent)' }}>₹{selectedOrder.total}</span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Payment Status</label>
                            <select 
                              className="select-dark"
                              style={{ width: '100%', height: '40px' }}
                              value={selectedOrder.payment_status}
                              onChange={(e) => handleUpdateStatus(selectedOrder.id, 'payment', e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Order Status</label>
                            <select 
                              className="select-dark"
                              style={{ width: '100%', height: '40px' }}
                              value={selectedOrder.order_status}
                              onChange={(e) => handleUpdateStatus(selectedOrder.id, 'order', e.target.value)}
                            >
                              <option value="new">New</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          className="btn btn-secondary"
                          style={{ width: '100%', marginTop: '1.25rem' }}
                          onClick={() => setSelectedOrder(null)}
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
