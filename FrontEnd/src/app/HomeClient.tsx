'use client';

import { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import Slider from 'react-slick';
import Image from 'next/image';
import axios from 'axios';
import styles from './page.module.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ProductGrid from './ProductGrid';
import { HomeSlide } from '@/data/types';

interface ArrowProps {
  onClick?: () => void;
}

const PreviousArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <div className={`${styles.customArrow} ${styles.leftArrow}`} onClick={onClick}>
    <ArrowBackIosIcon className={styles.arrowIcon} />
  </div>
);

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <div className={`${styles.customArrow} ${styles.rightArrow}`} onClick={onClick}>
    <ArrowForwardIosIcon className={styles.arrowIcon} />
  </div>
);

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  nextArrow: <NextArrow />,
  prevArrow: <PreviousArrow />,
  appendDots: (dots: React.ReactNode) => (
    <div className={styles.dotsContainer}>
      <ul className={styles.dotsList}>{dots}</ul>
    </div>
  ),
  customPaging: () => <div className={styles.customPaging} />,
};

export default function HomeClient() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    axios.get('/api/home-slides').then((res) => {
      const urls = res.data.map((item: HomeSlide) => item.imageUrl);
      setImages(urls);
    });
  }, []);

  return (
    <Container maxWidth={false} disableGutters sx={{ p: 0, m: 0 }}>
      <Box className={styles.sliderContainer}>
        {images.length > 0 && (
          <Slider {...sliderSettings}>
            {images.map((src, index) => (
              <Box
                key={index}
                sx={{
                  width: '100%',
                  height: {
                    xs: '65vh',
                    sm: '80vh',
                    md: '90vh',
                  },
                  minHeight: {
                    xs: '400px',
                    sm: '500px',
                    md: '600px',
                  },
                  position: 'relative',
                  margin: 0,
                }}
              >
                <Image
                  src={src}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: 0,
                  }}
                />
              </Box>
            ))}
          </Slider>
        )}
      </Box>

      <Box sx={{ mt: { xs: 2, sm: 4, md: 6 } }}>
        <ProductGrid />
      </Box>
    </Container>
  );
}
