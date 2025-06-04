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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get("/api/discounts");
      setDiscounts(res.data);
    } catch (err: any) {
      setError("خطا در دریافت لیست تخفیف‌ها");
    }
  };

  const handleAdd = async () => {
    try {
      const res = await axios.post("/api/discounts", {
        code,
        percentage,
      });
      setCode("");
      setPercentage(10);
      setError("");
      fetchDiscounts();
    } catch (err: any) {
      setError(err?.response?.data?.error || "خطا در افزودن تخفیف");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/discounts", { data: { id } });
      fetchDiscounts();
    } catch {
      setError("خطا در حذف تخفیف");
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        مدیریت کد تخفیف
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="کد تخفیف"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <TextField
          label="درصد"
          type="number"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
        />
        <Button variant="contained" onClick={handleAdd}>
          افزودن
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Table>
        <TableBody>
          {discounts.map((d) => (
            <TableRow key={d._id}>
              <TableCell>{d.code}</TableCell>
              <TableCell>{d.percentage}%</TableCell>
              <TableCell>
                {d.expiresAt
                  ? new Date(d.expiresAt).toLocaleDateString()
                  : "بدون انقضا"}
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
        </TableBody>
      </Table>
    </Box>
  );
}
