"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Image from "next/image";
import { Product } from "@/data/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";

const ProductCard: React.FC<Product> = ({
  id,
  images,
  name,
  price,
  discountPrice,
  isNew,
}) => {
  const { t } = useTranslation();
  const imagesArray = images || [];
  const hasDiscount = typeof discountPrice === "number" && discountPrice < price;

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
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          height: 460,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
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
            {isNew && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  bgcolor: "error.main",
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  fontWeight: 600,
                  zIndex: 2,
                }}
              >
                {t("new")}
              </Box>
            )}

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
                priority
              />
            )}
          </Box>
        </Link>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "3.2em",
            }}
          >
            {name}
          </Typography>

          <Box>
            {hasDiscount ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    fontSize: { xs: "1rem", sm: "0.875rem" },
                  }}
                >
                  €{price}
                </Typography>
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1rem" },
                  }}
                >
                  €{discountPrice}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                €{price}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ProductCard);
