// src/data/types.ts


export interface Product {
  _id: string; 
  id: string | number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  sizes?: { size: string; stock: number }[];

  colors?: Array<string | number>;
  description?: string;
  rating?: number;
  stock?: number;
  sizeGuide?: string[];
  status?: string;
  reviews?: string[];
  discount?: number;
  imageUrl?: string;
  quantity?: number;
  isNew?: boolean;
  [x: string]: unknown; 
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image?: string;
  
  variants: {
    size?: string | number;
    color?: string | number;
    quantity: number;
  }[];
}


export interface User {
  id: string;
  username: string;
  phone: string;
  role: 'Customer' | 'Admin'; 
}


export interface Order {
  id: string;
  user: string;
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'; 
  date: Date; 
  [x: string]: string | number | Date | undefined; 
}

export interface ProductRatingProps {
  rating: number;
  reviewsCount: number;
}

export interface HomeSlide {
  _id?: string;
  imageUrl: string;
  title?: string;
}

export interface ProductPriceProps {
  price: number;
  discount?: number | null;
  discountPrice?: number | null;
}

export interface CategoryLink {
  _id?: string;
  title: string;
  imageUrl: string;
}


export interface ProductImagesProps {
  images: string[];
}

// تایپ‌های مربوط به فرم‌ها
export interface LoginFormInputs {
  phone: string;
  password: string;
}

export interface RegisterFormInputs {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}



export interface PasswordFieldProps {
  label: string;
  error: boolean;
  helperText?: string;  
  register: (name: string) => { onChange: () => void }; 
}

export interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
}



export interface LinkButtonsProps {
  forgotPasswordLink: string;
  registerLink: string;
}

export interface ForgotPasswordFormInputs {
  phone: string;
}
