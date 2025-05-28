'use client';

import { Box, Container, Divider, Typography } from '@mui/material';

const impressumContent = `
Impressum
Webseite
Dieses Impressum gilt für alle Angebote unter der Domain:
www.mopastyle.de inklusive aller Subdomains (Unterseiten).

Soziale Medien
Dieses Impressum gilt auch für unsere Auftritte in den folgenden sozialen Medien:
Facebook: mopastyle
Instagram: mopastyle_
TikTok: @mopastyle_

Angaben gemäß § 5 DDG
Mohammad Ali Ahadi
Süllenstraße. 37
40599 Düsseldorf
Telefon: 017646654271
E-Mail: shop@mopastyle.de

Eintragung
Register: Der Handel mit Bekleidungstextilien, Versand und Internet-Einzelhandel Bekleidung, Schuhen und Accessories
Umsatzsteuer-Identifikationsnummer: DE369645709
`;

export default function ImpressumPage() {
  return (
    <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Impressum
        </Typography>

        <Divider sx={{ mb: 4, borderColor: '#ddd' }} />

        <Box>
          {impressumContent.split('\n').map((line, index) => {
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
