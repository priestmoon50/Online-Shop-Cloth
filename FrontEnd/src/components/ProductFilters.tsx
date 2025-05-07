import React, { useState, useEffect } from "react";
import { Slider, Typography, TextField, Box, Stack, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ProductFiltersProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ priceRange, setPriceRange }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');

  const [inputValues, setInputValues] = useState<string[]>([
    priceRange[0].toString(),
    priceRange[1].toString()
  ]);

  useEffect(() => {
    setInputValues([priceRange[0].toString(), priceRange[1].toString()]);
  }, [priceRange]);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...inputValues];
    updated[index] = value;
    setInputValues(updated);

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      const newRange = [...priceRange];
      newRange[index] = parsed;

      if (
        newRange[0] >= 1 &&
        newRange[0] <= newRange[1] &&
        newRange[1] <= 5000
      ) {
        setPriceRange(newRange);
      }
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Typography fontWeight={500} mb={1}>
        {t("priceRange")}
      </Typography>

      <Slider
        value={priceRange}
        onChange={handlePriceChange}
        valueLabelDisplay="auto"
        min={1}
        max={5000}
      />

      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems={isMobile ? "stretch" : "center"}
        mt={2}
      >
        <TextField
          type="number"
          label={t("min")}
          value={inputValues[0]}
          onChange={(e) => handleInputChange(0, e.target.value)}
          inputProps={{ min: 1, max: priceRange[1] }}
          size="small"
        />
        <Typography sx={{ display: isMobile ? "none" : "block" }}>-</Typography>
        <TextField
          type="number"
          label={t("max")}
          value={inputValues[1]}
          onChange={(e) => handleInputChange(1, e.target.value)}
          inputProps={{ min: priceRange[0], max: 5000 }}
          size="small"
        />
        <Typography>{t("currency")}</Typography>
      </Stack>
    </Box>
  );
};

export default ProductFilters;
