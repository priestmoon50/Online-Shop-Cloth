"use client";

import { Container, Box } from "@mui/material";
import Slider from "react-slick";
import Image from "next/image";
import styles from "./page.module.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ProductGrid from "./ProductGrid";

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
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

const images = ["/images/HomeSlide1.webp", "/images/HomeSlide2.webp"];

export default function HomeClient() {
  return (
    <Container maxWidth={false} disableGutters sx={{ py: { xs: 2, md: 4 } }}>
      <Box className={styles.sliderContainer}>
        <Slider {...sliderSettings}>
          {images.map((src, index) => (
            <Box
              key={index}
              sx={{
                width: "100vw",
                height: { xs: "50vh", sm: "60vh", md: "70vh" },
                position: "relative",
                margin: 0,
              }}
            >
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </Box>
          ))}
        </Slider>
      </Box>

      <Box sx={{ mt: { xs: 2, sm: 4, md: 6 }, mb: 0, pb: 0 }}>
        <ProductGrid />
      </Box>
    </Container>
  );
}
