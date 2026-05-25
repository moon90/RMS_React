import React from 'react';

const ReceiptTemplate = React.forwardRef(({ order, settings }, ref) => {
  if (!order) return null;

  const printIframeRef = React.useRef(null);
  const contentRef = React.useRef(null);

  const getSetting = (key) => {
    const setting = settings.find(s => (s.settingKey || s.SettingKey) === key);
    return (setting?.settingValue ?? setting?.SettingValue) || '';
  };

  const restaurantName = getSetting('RestaurantName') || 'RMS Restaurant';
  const restaurantAddress = getSetting('RestaurantAddress') || '';
  const restaurantPhone = getSetting('RestaurantPhone') || '';
  const headerNote = getSetting('ReceiptHeaderNote') || 'Welcome to our restaurant!';
  const footerNote = getSetting('ReceiptFooterNote') || 'Thank you for dining with us!';
  const currencySymbol = getSetting('CurrencySymbol') || '$';
  const vatNumber = getSetting('VATNumber') || '';

  const total = Number(order.total || order.Total || 0);
  const tax = Number(order.taxAmount || order.TaxAmount || 0);
  const serviceCharge = Number(order.serviceChargeAmount || order.ServiceChargeAmount || 0);
  const discount = Number(order.discountAmount || order.DiscountAmount || 0);
  const tip = Number(order.tipAmount || order.TipAmount || 0);
  const grandTotal = total + tax + serviceCharge - discount + tip;
  const received = Number(order.received || order.Received || 0);
  const change = Number(order.changeAmount || order.ChangeAmount || 0);

  const handlePrint = () => {
    if (!contentRef.current) return;
    const printContent = contentRef.current.innerHTML;
    const iframe = printIframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px; 
              color: black; 
              margin: 0; 
              padding: 5mm; 
              width: 70mm;
            }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .italic { font-style: italic; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mt-8 { margin-top: 2rem; }
            .mt-4 { margin-top: 1rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-1.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-4 { padding-top: 1rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .border-b { border-bottom: 1px solid black; }
            .border-t { border-top: 1px solid black; }
            .border-dashed { border-style: dashed; }
            .border-double { border-style: double; border-width: 3px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .w-full { width: 100%; }
            .text-right { text-align: right; }
            .text-base { font-size: 14px; }
            .text-lg { font-size: 18px; }
            .tracking-tighter { letter-spacing: -0.05em; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid black; }
            .h-1 { height: 4px; }
          </style>
        </head>
        <body onload="window.print();">
          <div style="width: 70mm;">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    doc.close();
  };

  // Expose handlePrint to parent via ref
  React.useImperativeHandle(ref, () => ({
    print: handlePrint
  }));

  return (
    <>
      <div style={{ display: 'none' }}>
        <div ref={contentRef}>
          <div className="text-center mb-4 space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tighter">{restaurantName}</h2>
            {restaurantAddress && <p className="leading-tight">{restaurantAddress}</p>}
            {restaurantPhone && <p>Tel: {restaurantPhone}</p>}
            {vatNumber && <p>VAT/TRN: {vatNumber}</p>}
            <div className="border-b border-dashed mb-2 mt-2"></div>
            <p className="italic font-bold">{headerNote}</p>
          </div>

          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Bill ID: SR-{order.orderID ?? order.orderId ?? order.id ?? 'N/A'}</span>
              <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Type: {order.orderType ?? 'Standard'}</span>
              <span>{order.orderTime ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {order.tableName && <div>Table: {order.tableName}</div>}
            {order.waiterName && <div>Waiter: {order.waiterName}</div>}
          </div>


          <div className="border-b mb-2"></div>

          <table className="w-full mb-4">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.orderDetails || order.OrderDetails || []).map((item, index) => (
                <tr key={index} className="border-b border-gray-50 align-top">
                  <td className="py-1.5 pr-2">{item.productName ?? item.ProductName ?? item.product?.productName ?? item.product?.ProductName ?? 'Product'}</td>
                  <td className="py-1.5 text-center">{item.quantity ?? 1}</td>
                  <td className="py-1.5 text-right">{currencySymbol}{Number(item.price ?? item.Price ?? 0).toFixed(2)}</td>
                  <td className="py-1.5 text-right">{currencySymbol}{Number(item.amount ?? item.Amount ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>

          </table>

          <div className="border-t pt-2 space-y-1.5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax/VAT</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge</span>
                <span>{currencySymbol}{serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{currencySymbol}{discount.toFixed(2)}</span>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between">
                <span>Tip</span>
                <span>{currencySymbol}{tip.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t my-1"></div>
            <div className="flex justify-between text-base font-black tracking-tighter">
              <span>TOTAL</span>
              <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
            <div className="border-b border-double my-1 h-1"></div>
            <div className="flex justify-between">
              <span>Received</span>
              <span>{currencySymbol}{received.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Change</span>
              <span>{currencySymbol}{change.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="font-bold italic">{footerNote}</p>
            <div className="pt-4" style={{ fontSize: '8px', color: '#666' }}>
              *** Thank You - Come Again ***
              <br />
              Powered by RMS-WEB
            </div>
          </div>
        </div>
      </div>
      <iframe
        ref={printIframeRef}
        style={{ position: 'absolute', width: '0', height: '0', border: 'none', visibility: 'hidden' }}
        title="Print Receipt"
      />
    </>
  );
});

export default ReceiptTemplate;
