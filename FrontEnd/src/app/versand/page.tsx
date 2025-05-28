'use client';

import { Box, Container, Divider, Typography } from '@mui/material';

const versandContent = `
Versand

5.1. Die genannten Preise beziehen sich auf die im Internet veröffentlichten Artikel unter Beachtung der jeweiligen Beschreibung.

5.2. Die Preise sind Endpreise, d.h., sie sind einschließlich der gesetzlich gültigen MwSt. Es gilt jeweils der Preis zum Zeitpunkt der Bestellung. Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum der MOPASTYLE.

5.3. Versandkosten:
Die Versandkosten betragen je nach Paketgröße zwischen 3-7€.

Rücksendekosten:
Da MOPASTYLE die besten Preise für die Ware bietet, werden Rücksendekosten nur in Sonderfällen akzeptiert (z. B. bei falsch gelieferter oder fehlerhafter Ware). Ansonsten trägt der Kunde die Rücksendekosten.

Liefergebiet:
Lieferung nur innerhalb Deutschlands.
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
          Versandinformation
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
