"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Stack,
  IconButton,
  Paper,
  TableContainer,
  useMediaQuery,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

type Discount = {
  _id: string;
  code: string;
  percentage: number;
  createdAt?: string;
  expiresAt?: string | null;
};

export default function AdminDiscountPage() {
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get("/api/discounts");
      setDiscounts(res.data);
    } catch {
      setError("error.fetchingDiscounts");
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("/api/discounts", { code, percentage });
      setCode("");
      setPercentage(10);
      setError("");
      fetchDiscounts();
    } catch (err: any) {
      setError(err?.response?.data?.error || "error.addingDiscount");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/discounts", { data: { id } });
      fetchDiscounts();
    } catch {
      setError("error.deletingDiscount");
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
<Button variant="contained" color="warning" href="/admin">
  {t("back")}
</Button>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
<Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
  {t("manageDiscountCodes")}
</Typography>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <TextField
            label={t("discountCode")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth={isMobile}
          />
          <TextField
            label={t("percentage")}
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            fullWidth={isMobile}
            inputProps={{ min: 1, max: 100 }}
          />
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{ height: isMobile ? "auto" : "56px", whiteSpace: "nowrap" }}
          >
            افزودن
          </Button>
        </Stack>

        {error && (
          <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
            {t(error)}
          </Typography>
        )}

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableBody>
              {discounts.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>
                    <Typography fontWeight="bold">{d.code}</Typography>
                  </TableCell>
                  <TableCell>{d.percentage}%</TableCell>
               <TableCell>
                {d.expiresAt
                  ? new Date(d.expiresAt).toLocaleDateString()
                  : t("noExpiration")}
              </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDelete(d._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {discounts.length === 0 && (
                <TableRow>
                <TableCell colSpan={4} align="center">
  {t("noDiscountsDefined")}
</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
