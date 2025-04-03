import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { Product } from '@/data/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick'; // اضافه کردن اسلایدر

const ProductCard: React.FC<Product> = ({
  id,
  images,
  name,
  price,
  discount,
}) => {
  const { t } = useTranslation();
  
  const discountedPrice = discount ? price - (price * discount) / 100 : null;
  const imagesArray = images ? images : [];

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
      <Card sx={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
        <Box sx={{ width: '100%', height: '300px', position: 'relative' }}>
          {imagesArray.length > 1 ? (
            <Slider {...sliderSettings}>
              {imagesArray.map((img, index) => (
                <Box key={index} sx={{ position: 'relative', width: '100%', height: '300px' }}>
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
              src={imagesArray[0] || '/placeholder.jpg'}
              alt={name}
              layout="fill"
              objectFit="cover"
              priority={true}
            />
          )}
        </Box>

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
                    textDecoration: 'line-through',
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                  }}
                >
                  {t('price')}: ${price}
                </Typography>
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1rem' },
                  }}
                >
                  {t('discountedPrice')}: ${discountedPrice}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('price')}: ${price}
              </Typography>
            )}
          </Box>

          <Grid  container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Link  href={`/product/${id}`} passHref>
                <Button
                
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    padding: { xs: '1px 8px', sm: '8px 12px' },
                    fontSize: { xs: '0.75rem', sm: '0.775rem' },
                    borderRadius: '4px',
                  }}
                >
                  {t('viewDetails')}
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ProductCard);
