'use client';

import { Box, Container, Divider, Typography } from '@mui/material';

const widerrufContent = `
Wiederrufsbelehrung

Verbraucher haben ein vierzehntägiges Widerrufsrecht.
Widerrufsbelehrung
Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag , an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns über die Adresse (Süllenstr.37 , 40599 Düsseldorf , Deutschland, oder die E-Mail Adressen: shop@mopastyle.de oder support@mopastyle.de , mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.

Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.

Folgen des Widerrufs 
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.

Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.

Besondere Hinweise Wenn Sie diesen Vertrag durch ein Darlehen finanzieren und ihn später widerrufen, sind sie auch an den Darlehensvertrag nicht mehr gebunden, sofern beide Verträge eine wirtschaftliche Einheit bilden. Dies ist insbesondere dann anzunehmen, wenn wir gleichzeitig Ihr Darlehensgeber sind oder wenn sich Ihr Darlehensgeber im Hinblick auf die Finanzierung unserer Mitwirkung bedient. Wenn uns das Darlehen bei Wirksamwerden des Widerrufs bereits zugeflossen ist, tritt Ihr Darlehensgeber im Verhältnis zu Ihnen hinsichtlich der Rechtsfolgen des Widerrufs oder der Rückgabe in unsere Rechte und Pflichten aus dem finanzierten Vertrag ein. Letzteres gilt nicht, wenn der vorliegende Vertrag den Erwerb von Finanzinstrumenten (z.B. von Wertpapieren, Devisen oder Derivaten) zum Gegenstand hat.

Wollen Sie eine vertragliche Bindung so weitgehend wie möglich vermeiden, machen Sie von Ihrem Widerrufsrecht Gebrauch und widerrufen Sie zudem den Darlehensvertrag, wenn Ihnen auch dafür ein Widerrufsrecht zusteht.
`;

export default function WiderrufsbelehrungPage() {
  return (
    <Box sx={{ bgcolor: '#f9f9f9', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Widerrufsbelehrung
        </Typography>

        <Divider sx={{ mb: 4, borderColor: '#ddd' }} />

        <Box>
          {widerrufContent.split('\n').map((line, index) => {
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
