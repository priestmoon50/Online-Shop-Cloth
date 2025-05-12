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
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;