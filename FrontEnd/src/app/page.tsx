"use client";

import { Container, Box } from "@mui/material";
import Slider from "react-slick";
import Image from "next/image";
import styles from "./page.module.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ProductGrid from "./ProductGrid"; // اضافه کردن ProductGrid
import CategoryLinks from "./CategoryLinks"; 

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Custom Left Arrow
// Custom Left Arrow
const PreviousArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <div
    className={`${styles.customArrow} ${styles.leftArrow}`}
    onClick={onClick}
  >
    <ArrowBackIosIcon className={styles.arrowIcon} />
  </div>
);

// Custom Right Arrow
const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <div
    className={`${styles.customArrow} ${styles.rightArrow}`}
    onClick={onClick}
  >
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
  autoplaySpeed: 2000,
  nextArrow: <NextArrow />,
  prevArrow: <PreviousArrow />,
  appendDots: (dots: React.ReactNode) => (
    <div className={styles.dotsContainer}>
      <ul className={styles.dotsList}>{dots}</ul>
    </div>
  ),
  customPaging: () => <div className={styles.customPaging} />,
};

const images = [
  "/images/HomeSlide1.webp",
  "/images/HomeSlide2.webp",
];


export default function Home() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box className={styles.sliderContainer}>
        <Slider {...sliderSettings}>
          {images.map((src, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                height: { xs: "50vh", sm: "60vh", md: "70vh" }, // ارتفاع پویا برای نسخه‌های مختلف
                position: "relative",
              }}
            >
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Slider>
      </Box>

      {/* اضافه کردن لینک‌های فیلتر */}

      <CategoryLinks />


      {/* اضافه کردن ProductGrid زیر اسلایدر */}
      <Box sx={{ mt: 6 }}>
        <ProductGrid />
      </Box>
    </Container>
  );
}
