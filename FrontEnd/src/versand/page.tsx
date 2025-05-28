'use client';

import { Box, Container, Divider, Typography } from '@mui/material';

const versandContent = `
Versand:

Ihre Bestellung wird in der Regel direkt nach Zahlungseingang versendet. Die Lieferzeit beträgt innerhalb Deutschlands ca. 2 bis 4 Werktage
Ab einem Bestellwert von 50 € Kostenloser Versand

du hast die Möglichkeit deine Bestellung (mit Absprache) am selben Tag abholen kommen.
`;

export default function VersandPage() {
  return (
    <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Versandinformationen
        </Typography>

        <Divider sx={{ mb: 4, borderColor: '#ddd' }} />

        <Box>
          {versandContent.split('\n').map((line, index) => {
            const trimmed = line.trim();

            if (!trimmed) return <Box key={index} mb={2} />;

            const isHeading =
              /^[0-9]+(\.|[\)])\s/.test(trimmed) ||
              /^[A-ZÄÖÜ]/.test(trimmed) && trimmed.length < 100;

            return (
              <Typography
                key={index}
                variant={isHeading ? 'subtitle1' : 'body2'}
                sx={{
                  fontWeight: isHeading ? 'bold' : 'normal',
                  lineHeight: 1.9,
                  color: '#333',
                  mb: 2,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {trimmed}
              </Typography>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
