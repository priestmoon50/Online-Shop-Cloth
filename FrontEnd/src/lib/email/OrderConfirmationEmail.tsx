import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number; // Einzelpreis nach تخفیف (برای هر عدد)
}

interface OrderConfirmationEmailProps {
  name: string;
  orderId: string;
  items: OrderItem[];
  totalPrice: number; // مجموع نهایی (شامل ارسال/تخفیف)
  shipping?: number;  // اختیاری: هزینه ارسال
  discount?: number;  // اختیاری: مقدار تخفیف (مطلق)
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  orderDateISO?: string; // اختیاری: تاریخ سفارش
}

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(v || 0));

const OrderConfirmationEmail = ({
  name,
  orderId,
  items,
  totalPrice,
  shipping = 0,
  discount = 0,
  addressLine1,
  addressLine2,
  postalCode,
  city,
  orderDateISO,
}: OrderConfirmationEmailProps) => {
  const subtotal = Math.max(Number(totalPrice || 0) - Number(shipping || 0) + Number(discount || 0), 0);
  const orderDate = orderDateISO ? new Date(orderDateISO) : new Date();

  return (
    <Html>
      <Head />
      <Preview>Bestellbestätigung – #{orderId}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', padding: '20px' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
            color: '#222',
          }}
        >
          {/* LOGO */}
          <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Img
              src="https://mopastyle.de/images/Logo.png"
              alt="MopaStyle"
              height="40"
              style={{ display: 'inline-block' }}
            />
          </Section>

          {/* HEADER */}
          <Section>
            <Text style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Danke für Ihre Bestellung, {name}!
            </Text>
            <Text style={{ margin: 0 }}>
              Bestellnummer: <strong>#{orderId}</strong> — Datum:{' '}
              {orderDate.toLocaleDateString('de-DE')}
            </Text>
          </Section>

          {/* ADDRESS (optional) */}
          {(addressLine1 || postalCode || city) && (
            <Section style={{ marginTop: '16px' }}>
              <Text style={{ fontWeight: 'bold', marginBottom: '6px' }}>Lieferadresse</Text>
              <Text style={{ margin: 0 }}>
                {addressLine1 || ''}{addressLine2 ? `, ${addressLine2}` : ''}
              </Text>
              <Text style={{ margin: 0 }}>
                {postalCode || ''}{city ? ` ${city}` : ''}
              </Text>
            </Section>
          )}

          {/* ITEMS */}
          <Section style={{ marginTop: '20px' }}>
            <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: '14px' }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: '1px solid #e3e3e3', paddingBottom: '8px' }}>Artikel</th>
                  <th align="center" style={{ borderBottom: '1px solid #e3e3e3', paddingBottom: '8px' }}>Menge</th>
                  <th align="right" style={{ borderBottom: '1px solid #e3e3e3', paddingBottom: '8px' }}>Einzelpreis</th>
                  <th align="right" style={{ borderBottom: '1px solid #e3e3e3', paddingBottom: '8px' }}>Zwischensumme</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const lineTotal = Number(item.price) * Number(item.quantity);
                  return (
                    <tr key={i}>
                      <td style={{ padding: '8px 0' }}>{item.name}</td>
                      <td align="center" style={{ whiteSpace: 'nowrap' }}>{item.quantity}</td>
                      <td align="right">{fmt(item.price)}</td>
                      <td align="right">{fmt(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* TOTALS */}
            <table width="100%" style={{ borderCollapse: 'collapse', marginTop: '8px' }}>
              <tbody>
                <tr>
                  <td style={{ paddingTop: '6px' }}>Zwischensumme</td>
                  <td align="right">{fmt(subtotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td style={{ paddingTop: '2px' }}>Rabatt</td>
                    <td align="right">– {fmt(discount)}</td>
                  </tr>
                )}
                {shipping > 0 && (
                  <tr>
                    <td style={{ paddingTop: '2px' }}>Versand</td>
                    <td align="right">{fmt(shipping)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ paddingTop: '8px', fontWeight: 'bold' }}>Gesamtsumme</td>
                  <td align="right" style={{ fontWeight: 'bold' }}>{fmt(totalPrice)}</td>
                </tr>
              </tbody>
            </table>

            {/* TAX NOTE */}
            <Text style={{ fontSize: '14px', color: '#444', marginTop: '14px' }}>
              Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet.
            </Text>

            {/* DELIVERY NOTE */}
            <Text style={{ color: '#555', marginTop: '8px' }}>
              Wir informieren Sie, sobald Ihre Artikel versandt wurden.
            </Text>
          </Section>

          {/* LEGAL FOOTER */}
          <Hr style={{ margin: '28px 0' }} />
          <Section>
            <Text style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              Diese Rechnung enthält keine Umsatzsteuer gemäß § 19 Abs. 1 UStG.
            </Text>
            <Text style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
              Bei Fragen kontaktieren Sie uns bitte unter support@mopastyle.de.
            </Text>
          </Section>

          {/* FOOTER */}
          <Text style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '26px' }}>
            © {new Date().getFullYear()} MopaStyle. Alle Rechte vorbehalten.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;
