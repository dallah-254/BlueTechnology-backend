import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function welcomeEmail(username) {
  return {
    subject: "Welcome to Blue Technology!",
    html: `<div style="font-family:sans-serif;padding:20px;">
      <h2 style="color:#007bff;">Welcome, ${username}!</h2>
      <p>We're excited to have you at Blue Technology. Explore our products and services!</p>
      <hr>
      <p style="font-size:12px;color:#888;">Blue Technology Team</p>
    </div>`
  };
}

export function orderEmail(order, user) {
  return {
    subject: "Order Confirmation",
    html: `<div style="font-family:sans-serif;padding:20px;">
      <h2 style="color:#28a745;">Thank you for your order, ${user.username}!</h2>
      <p>Your order <b>#${order.id}</b> has been received.</p>
      <ul>
        ${order.items.map(item => `<li>${item.quantity} x ${item.product.name} @ $${item.product.price}</li>`).join("")}
      </ul>
      <p>Total: <b>$${order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}</b></p>
      <hr>
      <p style="font-size:12px;color:#888;">Blue Technology Team</p>
    </div>`
  };
}

export function productPurchaseEmail(product, user) {
  return {
    subject: "Product Purchase Confirmation",
    html: `<div style="font-family:sans-serif;padding:20px;">
      <h2 style="color:#17a2b8;">Hi ${user.username}, you bought ${product.name}!</h2>
      <img src="${product.imageUrl}" alt="${product.name}" style="max-width:200px;">
      <p>${product.description}</p>
      <p>Price: <b>$${product.price}</b></p>
      <hr>
      <p style="font-size:12px;color:#888;">Blue Technology Team</p>
    </div>`
  };
}
export function bookingEmail(booking, user, service) {
  return {
    subject: "Service Booking Confirmation",
    html: `
      <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#007bff;">Hi ${user.username}, your booking for ${service.name} is confirmed!</h2>
        <p>Booking ID: <b>${booking.id}</b></p>
        <p>Scheduled At: <b>${new Date(booking.date).toLocaleString()}</b></p>
        <p>Service: <b>${service.name}</b></p>
        <p>Description: ${service.description}</p>
        <hr>
        <p style="font-size:12px;color:#888;">Blue Technology Team</p>
      </div>
    `
  };
}
export async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"Blue Technology" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}