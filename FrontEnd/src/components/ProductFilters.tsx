import React, { useState, useEffect } from "react";
import {
  Slider,
  Typography,
  TextField,
  Box,
  Stack,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

interface ProductFiltersProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  priceRange,
  setPriceRange,
  searchTerm,
  setSearchTerm,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  const [inputValues, setInputValues] = useState<string[]>([
    priceRange[0].toString(),
    priceRange[1].toString(),
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

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "flex-start",
          gap: 4,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap={isMobile ? "wrap" : "nowrap"}
        >
          <TextField
            type="number"
            label={t("min")}
            value={inputValues[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            inputProps={{ min: 1, max: priceRange[1] }}
            size="small"
            sx={{
              width: 80,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: 36,
              },
            }}
          />

          {!isMobile && <Typography>-</Typography>}

          <TextField
            type="number"
            label={t("max")}
            value={inputValues[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            inputProps={{ min: priceRange[0], max: 5000 }}
            size="small"
            sx={{
              width: 80,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: 36,
              },
            }}
          />

          <Box
            sx={{
              bgcolor: "#f9c900",
              color: "#000",
              px: 1.2,
              py: 0.5,
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              minWidth: 26,
              textAlign: "center",
            }}
          >
            €
          </Box>
        </Stack>

        <Box sx={{ width: isMobile ? "100%" : "50%" }}>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={1}
            max={5000}
            sx={{
              height: isMobile ? 4 : 2,
            }}
          />
        </Box>

        {!isMobile && (
          <Box sx={{ width: 250 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#000" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <CloseIcon
                      onClick={() => setSearchTerm("")}
                      sx={{
                        cursor: "pointer",
                        fontSize: 18,
                        color: "#555",
                        "&:hover": {
                          color: "#000",
                        },
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  height: 36,
                  backgroundColor: "#fff",
                  transition: "all 0.3s ease",
                  "& fieldset": {
                    borderColor: "#ccc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#aaa",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#444",
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductFilters;
