-- Migrasi dari Xendit ke Tripay
-- Rename kolom subscription_invoices agar tidak menggunakan nama provider spesifik

alter table subscription_invoices
  rename column xendit_fee to gateway_fee;

alter table subscription_invoices
  rename column xendit_invoice_id to payment_reference;

alter table subscription_invoices
  rename column xendit_invoice_url to payment_url;

comment on column subscription_invoices.gateway_fee is 'Biaya payment gateway (Tripay). Sebelumnya xendit_fee.';
comment on column subscription_invoices.payment_reference is 'Reference ID dari payment gateway (Tripay reference). Sebelumnya xendit_invoice_id.';
comment on column subscription_invoices.payment_url is 'URL halaman pembayaran dari payment gateway (Tripay payment_url). Sebelumnya xendit_invoice_url.';
