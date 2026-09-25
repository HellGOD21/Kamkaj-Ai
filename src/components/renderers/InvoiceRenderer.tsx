import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Share2,
  Plus,
  Trash2,
  QrCode as QrIcon,
  Building2,
  CheckCircle,
  Copy,
  Download,
  IndianRupee,
  FileCheck,
  Send,
  Edit2,
  Loader2,
} from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../../types';
import { exportElementToPdf } from '../../utils/pdfExport';

interface InvoiceRendererProps {
  initialData: InvoiceData;
  onSave?: (updated: InvoiceData) => void;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({ initialData, onSave }) => {
  const [invoice, setInvoice] = useState<InvoiceData>(initialData);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isInterState, setIsInterState] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Recalculate totals
  const recalculate = (items: InvoiceItem[], taxPercent: number) => {
    const subtotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.rate || 0), 0);
    const taxAmount = Math.round((subtotal * (taxPercent / 100)) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      amount:
        field === 'quantity'
          ? (Number(value) || 0) * updatedItems[index].rate
          : field === 'rate'
          ? updatedItems[index].quantity * (Number(value) || 0)
          : updatedItems[index].amount,
    };
    const { subtotal, taxAmount, totalAmount } = recalculate(updatedItems, invoice.taxPercent);
    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
    };
    setInvoice(updatedInvoice);
    onSave?.(updatedInvoice);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      description: 'Additional Service / Product Line Item',
      hsnSac: '998314',
      quantity: 1,
      rate: 1000,
      amount: 1000,
    };
    const updatedItems = [...invoice.items, newItem];
    const { subtotal, taxAmount, totalAmount } = recalculate(updatedItems, invoice.taxPercent);
    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
    };
    setInvoice(updatedInvoice);
    onSave?.(updatedInvoice);
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    const { subtotal, taxAmount, totalAmount } = recalculate(updatedItems, invoice.taxPercent);
    const updatedInvoice = {
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount,
    };
    setInvoice(updatedInvoice);
    onSave?.(updatedInvoice);
  };

  const handleTaxChange = (taxPercent: number) => {
    const { subtotal, taxAmount, totalAmount } = recalculate(invoice.items, taxPercent);
    const updatedInvoice = {
      ...invoice,
      taxPercent,
      subtotal,
      taxAmount,
      totalAmount,
    };
    setInvoice(updatedInvoice);
    onSave?.(updatedInvoice);
  };

  // Generate real UPI Payment QR code
  useEffect(() => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(invoice.upiId || 'payments@okhdfcbank')}&pn=${encodeURIComponent(
      invoice.businessName || 'Business'
    )}&am=${invoice.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoice.invoiceNumber)}`;

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [invoice.upiId, invoice.businessName, invoice.totalAmount, invoice.invoiceNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const cleanFileName = `Invoice_${invoice.invoiceNumber || 'INV'}_${(invoice.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      await exportElementToPdf(invoiceRef.current, {
        filename: cleanFileName,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*Tax Invoice: ${invoice.invoiceNumber}*
From: *${invoice.businessName}*
Client: *${invoice.clientName}*
Total Due: *₹${invoice.totalAmount.toLocaleString('en-IN')}* (Due by ${invoice.dueDate})

Payment UPI ID: *${invoice.upiId}*
Bank Account: ${invoice.bankDetails?.accountNumber || 'Available in invoice'} (IFSC: ${invoice.bankDetails?.ifsc || ''})

Thank you for your business! Please reply once payment is initiated.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(invoice.upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">GST Rate:</span>
          {[0, 5, 12, 18, 28].map((t) => (
            <button
              key={t}
              onClick={() => handleTaxChange(t)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                invoice.taxPercent === t
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}%
            </button>
          ))}
          <label className="flex items-center gap-1.5 ml-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isInterState}
              onChange={(e) => setIsInterState(e.target.checked)}
              className="rounded bg-slate-850 border-slate-700 text-orange-500 focus:ring-0"
            />
            <span>Inter-State (IGST)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-orange-600/20 transition active:scale-95"
            title="Save Invoice as PDF file on your computer"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send on WhatsApp</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium border border-slate-700 transition"
            title="Print or system print dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Actual Printable Invoice Container */}
      <div
        ref={invoiceRef}
        className="printable-document bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 font-sans"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                GST Tax Invoice
              </span>
              <span className="text-xs text-slate-500">Original for Recipient</span>
            </div>
            <input
              type="text"
              value={invoice.businessName}
              onChange={(e) => setInvoice({ ...invoice, businessName: e.target.value })}
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 block w-full focus:bg-amber-50 rounded px-1 -ml-1 border-transparent focus:border-amber-400"
            />
            <p className="text-xs text-slate-600 mt-1 max-w-sm">{invoice.businessAddress}</p>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <p>
                <span className="font-semibold text-slate-700">GSTIN:</span>{' '}
                <input
                  type="text"
                  value={invoice.businessGstin || ''}
                  onChange={(e) => setInvoice({ ...invoice, businessGstin: e.target.value })}
                  placeholder="27AABCA1234F1Z5"
                  className="font-mono uppercase text-xs focus:bg-amber-50 px-1 rounded"
                />
              </p>
              <p>
                <span className="font-semibold text-slate-700">Phone:</span> {invoice.businessPhone} |{' '}
                <span className="font-semibold text-slate-700">Email:</span> {invoice.businessEmail}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="inline-block sm:text-right">
              <p className="text-xs uppercase text-slate-500 font-semibold">Invoice No</p>
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                className="text-lg font-bold font-mono text-slate-900 sm:text-right focus:bg-amber-50 rounded px-1"
              />
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <p>
                  <span className="text-slate-500">Date:</span>{' '}
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                    className="font-medium text-slate-800 focus:bg-amber-50 px-1 rounded"
                  />
                </p>
                <p>
                  <span className="text-slate-500">Due Date:</span>{' '}
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                    className="font-medium text-red-600 focus:bg-amber-50 px-1 rounded"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Billed To (Client)</p>
            <input
              type="text"
              value={invoice.clientName}
              onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
              className="text-base font-bold text-slate-900 mt-1 block w-full focus:bg-amber-50 rounded px-1 -ml-1"
            />
            <p className="text-xs text-slate-600 mt-1">{invoice.clientAddress}</p>
            {invoice.clientPhone && (
              <p className="text-xs text-slate-600 mt-1">Phone: {invoice.clientPhone}</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client GSTIN / State</p>
            <input
              type="text"
              value={invoice.clientGstin || ''}
              onChange={(e) => setInvoice({ ...invoice, clientGstin: e.target.value })}
              placeholder="Client GSTIN (optional)"
              className="text-xs font-mono uppercase font-semibold text-slate-800 mt-1 sm:text-right focus:bg-amber-50 rounded px-1"
            />
            <p className="text-xs text-slate-500 mt-1">Place of Supply: Maharashtra (27)</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Item & Description</th>
                <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                <th className="py-2.5 px-2 text-right">Qty</th>
                <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                <th className="py-2.5 px-2 text-center no-print w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={index} className="group hover:bg-slate-50/70 transition">
                  <td className="py-3 px-2 text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full font-medium text-slate-800 focus:bg-amber-50 rounded px-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="text"
                      value={item.hsnSac}
                      onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                      className="w-16 text-center font-mono text-slate-500 focus:bg-amber-50 rounded px-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-14 text-right font-medium text-slate-800 focus:bg-amber-50 rounded px-1"
                      min="1"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="w-20 text-right font-mono font-medium text-slate-800 focus:bg-amber-50 rounded px-1"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                    ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-2 text-center no-print">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="no-print mt-2">
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 rounded hover:bg-orange-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line Item</span>
          </button>
        </div>

        {/* Invoice Summary & UPI Settlement Section */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: UPI QR Code & Bank Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/60">
              {qrCodeUrl ? (
                <div className="p-1 bg-white rounded-lg shadow-sm shrink-0 border border-slate-200">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-24 h-24 object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <QrIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span>Instant UPI Scan & Pay</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px]">0% Fee</span>
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Scan via GPay, PhonePe, Paytm, or BHIM
                </p>
                <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200">
                  <span className="text-slate-800 font-bold truncate max-w-[150px]">{invoice.upiId}</span>
                  <button
                    onClick={handleCopyUPI}
                    className="text-slate-500 hover:text-orange-600 p-0.5"
                    title="Copy UPI ID"
                  >
                    {isCopied ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Wire Details */}
            {invoice.bankDetails && (
              <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>NEFT / RTGS / IMPS Bank Transfer</span>
                </p>
                <p>A/C Name: {invoice.bankDetails.accountName}</p>
                <p className="font-mono">A/C No: {invoice.bankDetails.accountNumber}</p>
                <p className="font-mono">IFSC Code: {invoice.bankDetails.ifsc}</p>
                <p>Bank: {invoice.bankDetails.bankName}</p>
              </div>
            )}
          </div>

          {/* Right: Calculations */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-slate-800">
                ₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {invoice.taxPercent > 0 && (
              <>
                {!isInterState ? (
                  <>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>CGST ({(invoice.taxPercent / 2).toFixed(1)}%):</span>
                      <span className="font-mono text-slate-800">
                        ₹{(invoice.taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                      <span>SGST ({(invoice.taxPercent / 2).toFixed(1)}%):</span>
                      <span className="font-mono text-slate-800">
                        ₹{(invoice.taxAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>IGST ({invoice.taxPercent}%):</span>
                    <span className="font-mono text-slate-800">
                      ₹{invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between py-3 border-t-2 border-slate-900 text-sm sm:text-base font-extrabold text-slate-900">
              <span>Total Amount Due:</span>
              <span className="font-mono text-emerald-700">
                ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900">Payment Note: </span>
              <textarea
                value={invoice.notes}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                className="w-full bg-transparent mt-1 text-[11px] text-slate-700 resize-none focus:outline-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
          <span>This is a computer generated invoice powered by KaamKaj AI</span>
          <span>Authorized Signatory • {invoice.businessName}</span>
        </div>
      </div>
    </div>
  );
};
