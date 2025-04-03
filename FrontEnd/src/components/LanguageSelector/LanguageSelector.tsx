'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface LanguageSelectorProps {
  isOpen?: boolean; // prop اختیاری برای کنترل باز شدن مودال
  onClose?: () => void; // prop اختیاری برای بسته شدن مودال
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    } else {
      const hasSelectedLanguage = localStorage.getItem('selectedLanguage');
      if (!hasSelectedLanguage) {
        setOpen(true);
      }
    }
  }, [isOpen]);

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('selectedLanguage', locale);
    setOpen(false);
    if (onClose) onClose(); // اگر onClose تعریف شده باشد، آن را فراخوانی کن
  };

  return (
    <Modal open={open} onClose={() => { setOpen(false); if (onClose) onClose(); }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 300, sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Select Your Language
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please choose your preferred language
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 50,
              padding: '8px 16px',
              fontSize: '0.875rem',
            }}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              borderRadius: 50,
              padding: '8px 16px',
              fontSize: '0.875rem',
            }}
            onClick={() => handleLanguageChange('fa')}
          >
            فارسی
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 50,
              padding: '8px 16px',
              fontSize: '0.875rem',
            }}
            onClick={() => handleLanguageChange('fr')}
          >
            Français
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{
              borderRadius: 50,
              padding: '8px 16px',
              fontSize: '0.875rem',
            }}
            onClick={() => handleLanguageChange('de')}
          >
            Deutsch
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 50,
              padding: '8px 16px',
              fontSize: '0.875rem',
            }}
            onClick={() => handleLanguageChange('es')}
          >
            Español
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LanguageSelector;
