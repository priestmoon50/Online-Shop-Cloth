import { Html, Head, Preview, Body, Container, Section, Text } from '@react-email/components';
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
      <Container>
        <Section>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Thank you for your order, {name}!
          </Text>
          <Text>Your order <strong>#{orderId}</strong> has been received.</Text>
          <ul>
            {items.map((item, i) => (
              <li key={i}>
                {item.name} × {item.quantity} – €{item.price}
              </li>
            ))}
          </ul>
          <Text>
            <strong>Total: €{totalPrice.toFixed(2)}</strong>
          </Text>
          <Text>We'll notify you once your items are on the way.</Text>
        </Section>

        {/* ✅ LEGAL NOTE FOR GERMAN INVOICE */}
        <Section style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            <strong>Note:</strong> As a small business according to § 19 Abs. 1 UStG, we do not charge VAT.
          </Text>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            This invoice does not include VAT in accordance with German tax regulations for Kleinunternehmer.
            Please transfer the invoice amount within 14 days to the provided IBAN.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;
