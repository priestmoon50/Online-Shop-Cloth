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
  price: number;
}

interface OrderConfirmationEmailProps {
  name: string;
  orderId: string;
  items: OrderItem[];
  totalPrice: number;
}

const OrderConfirmationEmail = ({
  name,
  orderId,
  items,
  totalPrice,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Order Confirmation - #{orderId}</Preview>
    <Body style={{ backgroundColor: '#f6f9fc', padding: '20px' }}>
      <Container
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '30px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* LOGO */}
        <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Img src="https://mopastyle.de/images/Logo.png" alt="MopaStyle" height="40" />

        </Section>

        {/* MAIN CONTENT */}
        <Section>
          <Text style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            Thank you for your order, {name}!
          </Text>
          <Text style={{ marginBottom: '20px' }}>
            Your order <strong>#{orderId}</strong> has been received.
          </Text>

          {/* ORDER ITEMS TABLE */}
          <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th align="left" style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>Item</th>
                <th align="center" style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>Qty</th>
                <th align="right" style={{ borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 0' }}>{item.name}</td>
                  <td align="center">{item.quantity}</td>
                  <td align="right">€{Number(item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <table width="100%" style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td style={{ paddingTop: '10px', fontWeight: 'bold' }}>Zwischensumme</td>
                <td align="right">€{Number(totalPrice).toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Rechnungsbetrag</td>
                <td align="right">€{Number(totalPrice).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* TAX + PROFIT NOTICE */}
          <Text style={{ fontSize: '14px', color: '#444', marginBottom: '8px' }}>
            gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
          </Text>
          <Text style={{ fontSize: '14px', color: '#444', marginBottom: '20px' }}>
            Ihr Gewinn aus diesem Verkauf beträgt z. B. €{(totalPrice * 0.3).toFixed(2)}
          </Text>

          {/* Delivery Notice */}
          <Text style={{ color: '#555' }}>
            We'll notify you once your items are on the way.
          </Text>
        </Section>

        {/* LEGAL FOOTER */}
        <Hr style={{ margin: '30px 0' }} />
        <Section>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            <strong>Note:</strong> As a small business according to § 19 Abs. 1 UStG, we do not charge VAT.
          </Text>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            This invoice does not include VAT in accordance with German tax regulations for Kleinunternehmer.
            Please transfer the invoice amount within 14 days to the provided IBAN.
          </Text>
        </Section>

        {/* FOOTER */}
        <Text style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '30px' }}>
          © {new Date().getFullYear()} MopaStyle. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);
 
export default OrderConfirmationEmail;
