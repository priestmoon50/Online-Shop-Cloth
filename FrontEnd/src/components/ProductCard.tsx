"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Image from "next/image";
import { Product } from "@/data/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import { convertToEuro } from "@/utils/convertCurrency";

const ProductCard: React.FC<Product> = ({
  id,
  images,
  name,
  price,
  discount,
}) => {
  const { t } = useTranslation();
  const discountedPrice = discount ? price - (price * discount) / 100 : null;
  const imagesArray = images || [];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <motion.div
      id={`product-${id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card sx={{ position: "relative", overflow: "hidden", height: "100%" }}>
        <Link href={`/product/${id}`} passHref>
          <Box
            sx={{
              width: "100%",
              height: 300,
              position: "relative",
              cursor: "pointer",
              mb: 2,
            }}
          >
            {imagesArray.length > 1 ? (
              <Slider {...sliderSettings}>
                {imagesArray.map((img, index) => (
                  <Box
                    key={index}
                    sx={{ position: "relative", width: "100%", height: 300 }}
                  >
                    <Image
                      src={img}
                      alt={`${name}-${index}`}
                      layout="fill"
                      objectFit="cover"
                      priority={index === 0}
                    />
                  </Box>
                ))}
              </Slider>
            ) : (
              <Image
                src={imagesArray[0] || "/placeholder.jpg"}
                alt={name}
                layout="fill"
                objectFit="cover"
                priority={true}
              />
            )}
          </Box>
        </Link>

        <CardContent>
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Box>
            {discountedPrice ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    fontSize: { xs: "1rem", sm: "0.875rem" },
                  }}
                >
                  {t("price")}: €{convertToEuro(price)}
                </Typography>
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1rem" },
                  }}
                >
                  {t("discountedPrice")}: €{convertToEuro(discountedPrice)}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("price")}: €{convertToEuro(price)}
              </Typography>
            )}
          </Box>

          {/* دکمه حذف شد */}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ProductCard);
