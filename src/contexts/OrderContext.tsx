import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Customer, Warehouse, Paybox, Organization, PriceType, Product, OrderItem } from '../types';

interface OrderContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  warehouse: Warehouse | null;
  setWarehouse: (warehouse: Warehouse | null) => void;
  paybox: Paybox | null;
  setPaybox: (paybox: Paybox | null) => void;
  organization: Organization | null;
  setOrganization: (organization: Organization | null) => void;
  priceType: PriceType | null;
  setPriceType: (priceType: PriceType | null) => void;
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
  addItem: (product: Product) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearOrder: () => void;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [paybox, setPaybox] = useState<Paybox | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [priceType, setPriceType] = useState<PriceType | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  

  const addItem = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.product.id !== id));
  };

  const clearOrder = () => {
    setCustomer(null);
    setWarehouse(null);
    setPaybox(null);
    setOrganization(null);
    setPriceType(null);
    setItems([]);
  };

  return (
    <OrderContext.Provider
      value={{
        customer,
        setCustomer,
        warehouse,
        setWarehouse,
        paybox,
        setPaybox,
        organization,
        setOrganization,
        priceType,
        setPriceType,
        items,
        setItems,
        addItem,
        updateItemQuantity,
        removeItem,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
