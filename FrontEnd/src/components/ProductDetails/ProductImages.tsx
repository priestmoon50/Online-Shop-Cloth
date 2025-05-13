import { FC } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import Slider from "react-slick";
import { ProductImagesProps } from '@/data/types';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ProductImages: FC<ProductImagesProps> = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
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
        }}
      >
        <Slider {...settings}>
          {images.map((image, index) => (
            <Box key={index}>
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                width={1200}
                height={1600}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
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
