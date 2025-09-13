export function generateReceiptHtml(order, user) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:32px;">
      <h1 style="color:#007bff;">Blue Technology Official Receipt</h1>
      <p><b>Receipt ID:</b> ${order.id}</p>
      <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
      <hr>
      <p><b>Customer:</b> ${user.username} (${user.email})</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="border:1px solid #ddd;padding:8px;">Product</th>
            <th style="border:1px solid #ddd;padding:8px;">Qty</th>
            <th style="border:1px solid #ddd;padding:8px;">Unit Price</th>
            <th style="border:1px solid #ddd;padding:8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td style="border:1px solid #ddd;padding:8px;">${item.product.name}</td>
              <td style="border:1px solid #ddd;padding:8px;">${item.quantity}</td>
              <td style="border:1px solid #ddd;padding:8px;">$${item.product.price.toFixed(2)}</td>
              <td style="border:1px solid #ddd;padding:8px;">$${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <hr>
      <h2 style="text-align:right;">Grand Total: $${order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</h2>
      <p style="font-size:12px;color:#888;text-align:center;">Thank you for shopping with Blue Technology!</p>
    </div>
  `;
}



export function generateBookingReceiptHtml(booking, user, service) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:32px;">
      <h1 style="color:#007bff;">Blue Technology Service Receipt</h1>
      <p><b>Receipt ID:</b> ${booking.id}</p>
      <p><b>Date:</b> ${new Date(booking.date).toLocaleString()}</p>
      <hr>
      <p><b>Customer:</b> ${user.username} (${user.email})</p>
      <p><b>Service:</b> ${service.name}</p>
      <p><b>Description:</b> ${service.description}</p>
      <p><b>Scheduled At:</b> ${new Date(booking.date).toLocaleString()}</p>
      <p><b>Status:</b> ${booking.status}</p>
      <h2 style="text-align:right;">Service Price: $${service.price.toFixed(2)}</h2>
      <p style="font-size:12px;color:#888;text-align:center;">Thank you for booking with Blue Technology!</p>
    </div>
  `;
}