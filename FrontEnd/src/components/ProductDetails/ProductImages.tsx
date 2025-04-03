// components/ProductDetails/ProductImages.tsx
import { FC } from 'react';
import { Container } from '@mui/material';
import Image from 'next/image';
import Slider from "react-slick"; // ایمپورت اسلایدر react-slick
import { ProductImagesProps } from '@/data/types'; // ایمپورت تایپ از types.tsx
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ProductImages: FC<ProductImagesProps> = ({ images }) => {
  // تنظیمات اسلایدر
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <Container>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <Image 
              src={image} 
              alt={`Product image ${index + 1}`} 
              width={500} 
              height={500} 
              style={{ width: '100%', height: 'auto' }} 
              
            />
          </div>
        ))}
      </Slider> 
    </Container>
  );
};

export default ProductImages;
