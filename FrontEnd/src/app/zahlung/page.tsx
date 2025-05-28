'use client';

import { Box, Container, Divider, Typography } from '@mui/material';

const zahlungContent = `
Zahlungsmethoden bei MOPASTYLE

Rückgabe und Umtausch 
wie kann ich Artikel zurücksenden oder umtauschen? Falls dir ein Artikel nicht passt oder nicht gefällt, kannst du ihn innerhalb von 14 Tagen nach Erhalt problemlos an uns zurücksenden oder umtauschen. Bitte achte darauf, dass die Ware ungetragen, ungewaschen und im Originalzustand ist.

Wie funktioniert der Umtausch? 
Möchtest du einen Artikel umtauschen (z. B. eine andere Größe), sende ihn bitte zurück und gib in deinem Rücksendeformular deinen Umtauschwunsch an. Wir senden dir den neuen Artikel, sofern verfügbar, schnellstmöglich zu. Sollte der gewünschte Artikel nicht mehr auf Lager sein, erstatten wir dir automatisch den Kaufbetrag.

Welche Artikel sind vom Umtausch ausgeschlossen?
Bitte beachte, dass folgende Artikel vom Umtausch ausgeschlossen sind: 
Sale Ware


Wer trägt die Rücksendekosten? 
Weil MOPA beim Verkauf der Ware die tiefste Preise anbietet wird eine Rückwirkendekosten nur in Sonderfällen akzeptiert z. B. beschädigte oder falsch gelieferte Ware) übernehmen selbstverständlich wir die Kosten.

Wie erhalte ich mein Geld zurück?
Nach Erhalt und Prüfung deiner Rücksendung erstatten wir dir den Kaufbetrag innerhalb weniger Werktage auf dein ursprüngliches Zahlungsmittel.

Wohin soll ich die Retoure schicken?
Bitte senden Sie Ihre Retouren an folgende Adresse: 
Süllenstr. 37
40599 Düsseldorf 
Mohammad Ali Ahadi
`;

export default function ZahlungPage() {
  return (
    <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Zahlungsmethoden
        </Typography>

        <Divider sx={{ mb: 4, borderColor: '#ddd' }} />

        <Box>
          {zahlungContent.split('\n').map((line, index) => {
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
