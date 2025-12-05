export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  address?: string;
}

export interface Paybox {
  id: number;
  name: string;
  currency?: string;
}

export interface Organization {
  id: number;
  name: string;
  inn?: string;
}

export interface PriceType {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  article?: string;
  price: number;
  quantity: number;
  unit?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface SalePayload {
  customer_id: number;
  warehouse_id: number;
  paybox_id: number;
  organization_id: number;
  price_type_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
}


export interface Warehouse {
  id: number;
  name: string;
  address?: string;
}

export interface Paybox {
  id: number;
  name: string;
  balance?: number;
  currency?: string;
}

export interface Organization {
  id: number;
  name: string;
  type?: string;
  inn?: string;
}

export interface PriceType {
  id: number;
  name: string;
  tags?: string[];
}