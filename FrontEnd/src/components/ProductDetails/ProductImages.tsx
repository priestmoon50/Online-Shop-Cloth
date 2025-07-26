'use client';

import { FC } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import Slider from 'react-slick';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { ProductImagesProps } from '@/data/types';
import styles from './ProductImages.module.css';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ArrowProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}


const CustomPrevArrow: FC<ArrowProps> = ({ onClick }) => (
  <div
    className={`${styles.customArrow} ${styles.leftArrow}`}
    onClick={onClick}
  >
    <ArrowBackIos className={styles.arrowIcon} />
  </div>
);

const CustomNextArrow: FC<ArrowProps> = ({ onClick }) => (
  <div
    className={`${styles.customArrow} ${styles.rightArrow}`}
    onClick={onClick}
  >
    <ArrowForwardIos className={styles.arrowIcon} />
  </div>
);



const ProductImages: FC<ProductImagesProps> = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    draggable: false,
    swipe: true,
    touchMove: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };


  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mb: { xs: 4, md: 0 },
      }}
    >
      <Box
        sx={{
          width: { xs: '95vw', sm: '90vw', md: '500px' },
          maxWidth: '100%',

          position: 'relative',
          touchAction: 'manipulation', // زوم فعال بمونه
        }}
      >




        <Slider {...settings}>
          {images.map((image, index) => (
            <Box
              key={index}
              sx={{
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pinch-zoom',
              }}
            >
 <Image
  src={image}
  alt={`Product image ${index + 1}`}
  width={1200}
  height={1600}
  style={{
    width: '100%',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: 12,
    display: 'block',
  }}
/>

            </Box>
          ))}

        </Slider>
      </Box>
    </Box>
  );
};

export default ProductImages;
