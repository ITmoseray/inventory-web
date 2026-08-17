--
-- PostgreSQL database dump
--

\restrict HvDXIlbNcTkUkws9kjdL1hXLuNOmvZC50lTJd8J6NWd2Tz3xiEnxLD9NUakZVJD

-- Dumped from database version 18.4 (c9a59a4)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."_SaleToTransactionTag" DROP CONSTRAINT IF EXISTS "_SaleToTransactionTag_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_SaleToTransactionTag" DROP CONSTRAINT IF EXISTS "_SaleToTransactionTag_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_PurchaseToTransactionTag" DROP CONSTRAINT IF EXISTS "_PurchaseToTransactionTag_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_PurchaseToTransactionTag" DROP CONSTRAINT IF EXISTS "_PurchaseToTransactionTag_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_PermissionToRole" DROP CONSTRAINT IF EXISTS "_PermissionToRole_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_PermissionToRole" DROP CONSTRAINT IF EXISTS "_PermissionToRole_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_ExpenseToTransactionTag" DROP CONSTRAINT IF EXISTS "_ExpenseToTransactionTag_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ExpenseToTransactionTag" DROP CONSTRAINT IF EXISTS "_ExpenseToTransactionTag_A_fkey";
ALTER TABLE IF EXISTS ONLY public."Wastage" DROP CONSTRAINT IF EXISTS "Wastage_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Wastage" DROP CONSTRAINT IF EXISTS "Wastage_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."TransactionTag" DROP CONSTRAINT IF EXISTS "TransactionTag_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Supplier" DROP CONSTRAINT IF EXISTS "Supplier_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPriceList" DROP CONSTRAINT IF EXISTS "SupplierPriceList_supplierId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPriceList" DROP CONSTRAINT IF EXISTS "SupplierPriceList_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPriceList" DROP CONSTRAINT IF EXISTS "SupplierPriceList_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPayment" DROP CONSTRAINT IF EXISTS "SupplierPayment_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPayment" DROP CONSTRAINT IF EXISTS "SupplierPayment_supplierId_fkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPayment" DROP CONSTRAINT IF EXISTS "SupplierPayment_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockTransfer" DROP CONSTRAINT IF EXISTS "StockTransfer_toLocationId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockTransfer" DROP CONSTRAINT IF EXISTS "StockTransfer_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockTransfer" DROP CONSTRAINT IF EXISTS "StockTransfer_fromLocationId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolTerm" DROP CONSTRAINT IF EXISTS "SchoolTerm_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolStudent" DROP CONSTRAINT IF EXISTS "SchoolStudent_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolStaff" DROP CONSTRAINT IF EXISTS "SchoolStaff_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayslip" DROP CONSTRAINT IF EXISTS "SchoolPayslip_staffId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayslip" DROP CONSTRAINT IF EXISTS "SchoolPayslip_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayment" DROP CONSTRAINT IF EXISTS "SchoolPayment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayment" DROP CONSTRAINT IF EXISTS "SchoolPayment_invoiceId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayment" DROP CONSTRAINT IF EXISTS "SchoolPayment_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayment" DROP CONSTRAINT IF EXISTS "SchoolPayment_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolLibraryBook" DROP CONSTRAINT IF EXISTS "SchoolLibraryBook_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolLeaveRequest" DROP CONSTRAINT IF EXISTS "SchoolLeaveRequest_staffId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolLeaveRequest" DROP CONSTRAINT IF EXISTS "SchoolLeaveRequest_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolInvoice" DROP CONSTRAINT IF EXISTS "SchoolInvoice_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolInvoice" DROP CONSTRAINT IF EXISTS "SchoolInvoice_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostel" DROP CONSTRAINT IF EXISTS "SchoolHostel_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostelAllocation" DROP CONSTRAINT IF EXISTS "SchoolHostelAllocation_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostelAllocation" DROP CONSTRAINT IF EXISTS "SchoolHostelAllocation_hostelId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostelAllocation" DROP CONSTRAINT IF EXISTS "SchoolHostelAllocation_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolGrade" DROP CONSTRAINT IF EXISTS "SchoolGrade_termId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolGrade" DROP CONSTRAINT IF EXISTS "SchoolGrade_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolGrade" DROP CONSTRAINT IF EXISTS "SchoolGrade_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolGrade" DROP CONSTRAINT IF EXISTS "SchoolGrade_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolEnrollment" DROP CONSTRAINT IF EXISTS "SchoolEnrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolEnrollment" DROP CONSTRAINT IF EXISTS "SchoolEnrollment_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolEnrollment" DROP CONSTRAINT IF EXISTS "SchoolEnrollment_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolCourse" DROP CONSTRAINT IF EXISTS "SchoolCourse_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBroadcast" DROP CONSTRAINT IF EXISTS "SchoolBroadcast_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBroadcastRecipient" DROP CONSTRAINT IF EXISTS "SchoolBroadcastRecipient_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBroadcastRecipient" DROP CONSTRAINT IF EXISTS "SchoolBroadcastRecipient_broadcastId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBookCheckout" DROP CONSTRAINT IF EXISTS "SchoolBookCheckout_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBookCheckout" DROP CONSTRAINT IF EXISTS "SchoolBookCheckout_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBookCheckout" DROP CONSTRAINT IF EXISTS "SchoolBookCheckout_bookId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolAttendance" DROP CONSTRAINT IF EXISTS "SchoolAttendance_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolAttendance" DROP CONSTRAINT IF EXISTS "SchoolAttendance_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolAttendance" DROP CONSTRAINT IF EXISTS "SchoolAttendance_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderStatusHistory" DROP CONSTRAINT IF EXISTS "SalesOrderStatusHistory_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderStatusHistory" DROP CONSTRAINT IF EXISTS "SalesOrderStatusHistory_salesOrderId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderItem" DROP CONSTRAINT IF EXISTS "SalesOrderItem_salesOrderId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderItem" DROP CONSTRAINT IF EXISTS "SalesOrderItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderItem" DROP CONSTRAINT IF EXISTS "SalesOrderItem_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesDraft" DROP CONSTRAINT IF EXISTS "SalesDraft_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesDraft" DROP CONSTRAINT IF EXISTS "SalesDraft_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."SalesDraft" DROP CONSTRAINT IF EXISTS "SalesDraft_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_tableId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_staffId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_patientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."SaleItem" DROP CONSTRAINT IF EXISTS "SaleItem_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."SaleItem" DROP CONSTRAINT IF EXISTS "SaleItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."SaleItem" DROP CONSTRAINT IF EXISTS "SaleItem_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Role" DROP CONSTRAINT IF EXISTS "Role_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."RestaurantTable" DROP CONSTRAINT IF EXISTS "RestaurantTable_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Referral" DROP CONSTRAINT IF EXISTS "Referral_referrerBusinessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Referral" DROP CONSTRAINT IF EXISTS "Referral_referredBusinessId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReferralCode" DROP CONSTRAINT IF EXISTS "ReferralCode_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quote" DROP CONSTRAINT IF EXISTS "Quote_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quote" DROP CONSTRAINT IF EXISTS "Quote_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuoteItem" DROP CONSTRAINT IF EXISTS "QuoteItem_quoteId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuoteItem" DROP CONSTRAINT IF EXISTS "QuoteItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."PushSubscription" DROP CONSTRAINT IF EXISTS "PushSubscription_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Purchase" DROP CONSTRAINT IF EXISTS "Purchase_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Purchase" DROP CONSTRAINT IF EXISTS "Purchase_supplierId_fkey";
ALTER TABLE IF EXISTS ONLY public."Purchase" DROP CONSTRAINT IF EXISTS "Purchase_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."PurchaseItem" DROP CONSTRAINT IF EXISTS "PurchaseItem_purchaseId_fkey";
ALTER TABLE IF EXISTS ONLY public."PurchaseItem" DROP CONSTRAINT IF EXISTS "PurchaseItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."PurchaseItem" DROP CONSTRAINT IF EXISTS "PurchaseItem_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Promotion" DROP CONSTRAINT IF EXISTS "Promotion_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."Product" DROP CONSTRAINT IF EXISTS "Product_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProductUnit" DROP CONSTRAINT IF EXISTS "ProductUnit_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProductBundle" DROP CONSTRAINT IF EXISTS "ProductBundle_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prescription" DROP CONSTRAINT IF EXISTS "Prescription_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prescription" DROP CONSTRAINT IF EXISTS "Prescription_patientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Prescription" DROP CONSTRAINT IF EXISTS "Prescription_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payroll" DROP CONSTRAINT IF EXISTS "Payroll_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payroll" DROP CONSTRAINT IF EXISTS "Payroll_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_invoiceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Patient" DROP CONSTRAINT IF EXISTS "Patient_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."LoyaltyTier" DROP CONSTRAINT IF EXISTS "LoyaltyTier_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."LoyaltyCampaign" DROP CONSTRAINT IF EXISTS "LoyaltyCampaign_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Location" DROP CONSTRAINT IF EXISTS "Location_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."LocationStock" DROP CONSTRAINT IF EXISTS "LocationStock_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."LocationStock" DROP CONSTRAINT IF EXISTS "LocationStock_locationId_fkey";
ALTER TABLE IF EXISTS ONLY public."LicenseVoucher" DROP CONSTRAINT IF EXISTS "LicenseVoucher_tierId_fkey";
ALTER TABLE IF EXISTS ONLY public."LicenseVoucher" DROP CONSTRAINT IF EXISTS "LicenseVoucher_redeemedById_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_patientId_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_labTechnicianId_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_doctorId_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_consultationId_fkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_invoiceId_fkey";
ALTER TABLE IF EXISTS ONLY public."GiftCard" DROP CONSTRAINT IF EXISTS "GiftCard_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."GiftCardTransaction" DROP CONSTRAINT IF EXISTS "GiftCardTransaction_giftCardId_fkey";
ALTER TABLE IF EXISTS ONLY public."Expense" DROP CONSTRAINT IF EXISTS "Expense_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Expense" DROP CONSTRAINT IF EXISTS "Expense_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Debt" DROP CONSTRAINT IF EXISTS "Debt_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Debt" DROP CONSTRAINT IF EXISTS "Debt_customerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Debt" DROP CONSTRAINT IF EXISTS "Debt_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."DebtPayment" DROP CONSTRAINT IF EXISTS "DebtPayment_debtId_fkey";
ALTER TABLE IF EXISTS ONLY public."Customer" DROP CONSTRAINT IF EXISTS "Customer_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_saleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_patientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_doctorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_appointmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Business" DROP CONSTRAINT IF EXISTS "Business_activationTierId_fkey";
ALTER TABLE IF EXISTS ONLY public."BundleItem" DROP CONSTRAINT IF EXISTS "BundleItem_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."BundleItem" DROP CONSTRAINT IF EXISTS "BundleItem_bundleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Batch" DROP CONSTRAINT IF EXISTS "Batch_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Batch" DROP CONSTRAINT IF EXISTS "Batch_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."BankTransaction" DROP CONSTRAINT IF EXISTS "BankTransaction_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_businessId_fkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_patientId_fkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_doctorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_businessId_fkey";
DROP INDEX IF EXISTS public."_SaleToTransactionTag_B_index";
DROP INDEX IF EXISTS public."_PurchaseToTransactionTag_B_index";
DROP INDEX IF EXISTS public."_PermissionToRole_B_index";
DROP INDEX IF EXISTS public."_ExpenseToTransactionTag_B_index";
DROP INDEX IF EXISTS public."Wastage_productId_idx";
DROP INDEX IF EXISTS public."Wastage_businessId_reason_idx";
DROP INDEX IF EXISTS public."Wastage_businessId_idx";
DROP INDEX IF EXISTS public."User_verificationToken_idx";
DROP INDEX IF EXISTS public."User_username_key";
DROP INDEX IF EXISTS public."User_roleId_idx";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."User_businessId_idx";
DROP INDEX IF EXISTS public."TransactionTag_businessId_name_key";
DROP INDEX IF EXISTS public."TransactionTag_businessId_idx";
DROP INDEX IF EXISTS public."Supplier_businessId_idx";
DROP INDEX IF EXISTS public."Supplier_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."SupplierPriceList_supplierId_productId_key";
DROP INDEX IF EXISTS public."SupplierPriceList_supplierId_idx";
DROP INDEX IF EXISTS public."SupplierPriceList_businessId_idx";
DROP INDEX IF EXISTS public."SupplierPayment_supplierId_idx";
DROP INDEX IF EXISTS public."SupplierPayment_businessId_idx";
DROP INDEX IF EXISTS public."StockTransfer_toLocationId_idx";
DROP INDEX IF EXISTS public."StockTransfer_productId_idx";
DROP INDEX IF EXISTS public."StockTransfer_fromLocationId_idx";
DROP INDEX IF EXISTS public."StockMovement_businessId_productId_idx";
DROP INDEX IF EXISTS public."StockMovement_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."SchoolTerm_businessId_idx";
DROP INDEX IF EXISTS public."SchoolStudent_businessId_studentId_key";
DROP INDEX IF EXISTS public."SchoolStudent_businessId_idx";
DROP INDEX IF EXISTS public."SchoolStaff_businessId_idx";
DROP INDEX IF EXISTS public."SchoolPayslip_staffId_idx";
DROP INDEX IF EXISTS public."SchoolPayslip_businessId_idx";
DROP INDEX IF EXISTS public."SchoolPayment_studentId_idx";
DROP INDEX IF EXISTS public."SchoolPayment_receiptNumber_key";
DROP INDEX IF EXISTS public."SchoolPayment_courseId_idx";
DROP INDEX IF EXISTS public."SchoolPayment_businessId_idx";
DROP INDEX IF EXISTS public."SchoolLibraryBook_businessId_idx";
DROP INDEX IF EXISTS public."SchoolLeaveRequest_staffId_idx";
DROP INDEX IF EXISTS public."SchoolLeaveRequest_businessId_idx";
DROP INDEX IF EXISTS public."SchoolInvoice_studentId_idx";
DROP INDEX IF EXISTS public."SchoolInvoice_businessId_idx";
DROP INDEX IF EXISTS public."SchoolHostel_businessId_idx";
DROP INDEX IF EXISTS public."SchoolHostel_businessId_blockName_roomNumber_key";
DROP INDEX IF EXISTS public."SchoolHostelAllocation_studentId_idx";
DROP INDEX IF EXISTS public."SchoolHostelAllocation_hostelId_idx";
DROP INDEX IF EXISTS public."SchoolHostelAllocation_businessId_idx";
DROP INDEX IF EXISTS public."SchoolGrade_termId_idx";
DROP INDEX IF EXISTS public."SchoolGrade_studentId_idx";
DROP INDEX IF EXISTS public."SchoolGrade_studentId_courseId_termId_key";
DROP INDEX IF EXISTS public."SchoolGrade_courseId_idx";
DROP INDEX IF EXISTS public."SchoolGrade_businessId_idx";
DROP INDEX IF EXISTS public."SchoolEnrollment_studentId_idx";
DROP INDEX IF EXISTS public."SchoolEnrollment_studentId_courseId_key";
DROP INDEX IF EXISTS public."SchoolEnrollment_courseId_idx";
DROP INDEX IF EXISTS public."SchoolEnrollment_businessId_idx";
DROP INDEX IF EXISTS public."SchoolCourse_businessId_idx";
DROP INDEX IF EXISTS public."SchoolCourse_businessId_courseCode_key";
DROP INDEX IF EXISTS public."SchoolBroadcast_businessId_idx";
DROP INDEX IF EXISTS public."SchoolBroadcastRecipient_studentId_idx";
DROP INDEX IF EXISTS public."SchoolBroadcastRecipient_broadcastId_idx";
DROP INDEX IF EXISTS public."SchoolBookCheckout_studentId_idx";
DROP INDEX IF EXISTS public."SchoolBookCheckout_businessId_idx";
DROP INDEX IF EXISTS public."SchoolBookCheckout_bookId_idx";
DROP INDEX IF EXISTS public."SchoolAttendance_studentId_idx";
DROP INDEX IF EXISTS public."SchoolAttendance_studentId_courseId_date_key";
DROP INDEX IF EXISTS public."SchoolAttendance_courseId_idx";
DROP INDEX IF EXISTS public."SchoolAttendance_businessId_idx";
DROP INDEX IF EXISTS public."SalesOrder_soNumber_key";
DROP INDEX IF EXISTS public."SalesOrder_soNumber_idx";
DROP INDEX IF EXISTS public."SalesOrder_businessId_status_idx";
DROP INDEX IF EXISTS public."SalesOrder_businessId_idx";
DROP INDEX IF EXISTS public."SalesOrder_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."SalesOrderStatusHistory_salesOrderId_idx";
DROP INDEX IF EXISTS public."SalesOrderItem_salesOrderId_idx";
DROP INDEX IF EXISTS public."SalesOrderItem_businessId_idx";
DROP INDEX IF EXISTS public."SalesDraft_userId_idx";
DROP INDEX IF EXISTS public."SalesDraft_draftNumber_key";
DROP INDEX IF EXISTS public."SalesDraft_businessId_idx";
DROP INDEX IF EXISTS public."Sale_invoiceNumber_key";
DROP INDEX IF EXISTS public."Sale_businessId_idx";
DROP INDEX IF EXISTS public."Sale_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."SaleItem_businessId_idx";
DROP INDEX IF EXISTS public."Role_businessId_name_key";
DROP INDEX IF EXISTS public."RestaurantTable_businessId_name_key";
DROP INDEX IF EXISTS public."RestaurantTable_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."Referral_status_idx";
DROP INDEX IF EXISTS public."Referral_referrerBusinessId_idx";
DROP INDEX IF EXISTS public."Referral_referredBusinessId_key";
DROP INDEX IF EXISTS public."ReferralCode_code_key";
DROP INDEX IF EXISTS public."ReferralCode_code_idx";
DROP INDEX IF EXISTS public."ReferralCode_businessId_key";
DROP INDEX IF EXISTS public."Quote_customerId_idx";
DROP INDEX IF EXISTS public."Quote_businessId_reference_key";
DROP INDEX IF EXISTS public."Quote_businessId_idx";
DROP INDEX IF EXISTS public."QuoteItem_quoteId_idx";
DROP INDEX IF EXISTS public."QuoteItem_productId_idx";
DROP INDEX IF EXISTS public."PushSubscription_endpoint_key";
DROP INDEX IF EXISTS public."PushSubscription_businessId_idx";
DROP INDEX IF EXISTS public."Purchase_businessId_idx";
DROP INDEX IF EXISTS public."Purchase_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."PurchaseItem_businessId_idx";
DROP INDEX IF EXISTS public."Promotion_businessId_status_idx";
DROP INDEX IF EXISTS public."Promotion_businessId_idx";
DROP INDEX IF EXISTS public."Product_isNetworkAvailable_idx";
DROP INDEX IF EXISTS public."Product_businessId_sku_idx";
DROP INDEX IF EXISTS public."Product_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."ProductUnit_productId_idx";
DROP INDEX IF EXISTS public."ProductBundle_businessId_idx";
DROP INDEX IF EXISTS public."Prescription_saleId_key";
DROP INDEX IF EXISTS public."Prescription_prescriptionNumber_key";
DROP INDEX IF EXISTS public."Prescription_patientId_idx";
DROP INDEX IF EXISTS public."Prescription_businessId_idx";
DROP INDEX IF EXISTS public."Permission_key_key";
DROP INDEX IF EXISTS public."Payroll_userId_idx";
DROP INDEX IF EXISTS public."Payroll_businessId_idx";
DROP INDEX IF EXISTS public."Payment_businessId_idx";
DROP INDEX IF EXISTS public."Payment_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."Patient_businessId_idx";
DROP INDEX IF EXISTS public."OrderStatusHistory_saleId_idx";
DROP INDEX IF EXISTS public."OrderStatusHistory_businessId_idx";
DROP INDEX IF EXISTS public."Notification_businessId_idx";
DROP INDEX IF EXISTS public."Location_businessId_idx";
DROP INDEX IF EXISTS public."LocationStock_productId_idx";
DROP INDEX IF EXISTS public."LocationStock_locationId_productId_key";
DROP INDEX IF EXISTS public."LocationStock_locationId_idx";
DROP INDEX IF EXISTS public."LicenseVoucher_tierId_idx";
DROP INDEX IF EXISTS public."LicenseVoucher_code_key";
DROP INDEX IF EXISTS public."LicenseVoucher_code_idx";
DROP INDEX IF EXISTS public."LabTest_saleId_key";
DROP INDEX IF EXISTS public."LabTest_patientId_idx";
DROP INDEX IF EXISTS public."LabTest_doctorId_idx";
DROP INDEX IF EXISTS public."LabTest_businessId_idx";
DROP INDEX IF EXISTS public."Invoice_invoiceNumber_key";
DROP INDEX IF EXISTS public."Invoice_customerId_idx";
DROP INDEX IF EXISTS public."Invoice_businessId_idx";
DROP INDEX IF EXISTS public."Invoice_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."InvoiceItem_productId_idx";
DROP INDEX IF EXISTS public."InvoiceItem_invoiceId_idx";
DROP INDEX IF EXISTS public."GiftCard_code_key";
DROP INDEX IF EXISTS public."GiftCard_code_idx";
DROP INDEX IF EXISTS public."GiftCard_businessId_idx";
DROP INDEX IF EXISTS public."GiftCardTransaction_giftCardId_idx";
DROP INDEX IF EXISTS public."Expense_businessId_idx";
DROP INDEX IF EXISTS public."Debt_saleId_key";
DROP INDEX IF EXISTS public."Debt_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."Debt_businessId_customerId_idx";
DROP INDEX IF EXISTS public."DebtPayment_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."Customer_businessId_idx";
DROP INDEX IF EXISTS public."Customer_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."Consultation_saleId_key";
DROP INDEX IF EXISTS public."Consultation_patientId_idx";
DROP INDEX IF EXISTS public."Consultation_doctorId_idx";
DROP INDEX IF EXISTS public."Consultation_businessId_idx";
DROP INDEX IF EXISTS public."Consultation_appointmentId_key";
DROP INDEX IF EXISTS public."Category_businessId_name_key";
DROP INDEX IF EXISTS public."Category_businessId_deletedAt_idx";
DROP INDEX IF EXISTS public."CashRegisterSession_userId_idx";
DROP INDEX IF EXISTS public."CashRegisterSession_businessId_idx";
DROP INDEX IF EXISTS public."Business_slug_key";
DROP INDEX IF EXISTS public."Business_slug_idx";
DROP INDEX IF EXISTS public."BundleItem_bundleId_productId_key";
DROP INDEX IF EXISTS public."BundleItem_bundleId_idx";
DROP INDEX IF EXISTS public."Batch_productId_batchNumber_key";
DROP INDEX IF EXISTS public."Batch_businessId_expiryDate_idx";
DROP INDEX IF EXISTS public."BankTransaction_businessId_idx";
DROP INDEX IF EXISTS public."AuditLog_businessId_idx";
DROP INDEX IF EXISTS public."Attendance_userId_idx";
DROP INDEX IF EXISTS public."Attendance_businessId_idx";
DROP INDEX IF EXISTS public."Appointment_patientId_idx";
DROP INDEX IF EXISTS public."Appointment_doctorId_idx";
DROP INDEX IF EXISTS public."Appointment_businessId_idx";
ALTER TABLE IF EXISTS ONLY public."_SaleToTransactionTag" DROP CONSTRAINT IF EXISTS "_SaleToTransactionTag_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_PurchaseToTransactionTag" DROP CONSTRAINT IF EXISTS "_PurchaseToTransactionTag_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_PermissionToRole" DROP CONSTRAINT IF EXISTS "_PermissionToRole_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_ExpenseToTransactionTag" DROP CONSTRAINT IF EXISTS "_ExpenseToTransactionTag_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."Wastage" DROP CONSTRAINT IF EXISTS "Wastage_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."TransactionTag" DROP CONSTRAINT IF EXISTS "TransactionTag_pkey";
ALTER TABLE IF EXISTS ONLY public."SystemSetting" DROP CONSTRAINT IF EXISTS "SystemSetting_pkey";
ALTER TABLE IF EXISTS ONLY public."Supplier" DROP CONSTRAINT IF EXISTS "Supplier_pkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPriceList" DROP CONSTRAINT IF EXISTS "SupplierPriceList_pkey";
ALTER TABLE IF EXISTS ONLY public."SupplierPayment" DROP CONSTRAINT IF EXISTS "SupplierPayment_pkey";
ALTER TABLE IF EXISTS ONLY public."Subscription" DROP CONSTRAINT IF EXISTS "Subscription_pkey";
ALTER TABLE IF EXISTS ONLY public."StockTransfer" DROP CONSTRAINT IF EXISTS "StockTransfer_pkey";
ALTER TABLE IF EXISTS ONLY public."StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolTerm" DROP CONSTRAINT IF EXISTS "SchoolTerm_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolStudent" DROP CONSTRAINT IF EXISTS "SchoolStudent_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolStaff" DROP CONSTRAINT IF EXISTS "SchoolStaff_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayslip" DROP CONSTRAINT IF EXISTS "SchoolPayslip_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolPayment" DROP CONSTRAINT IF EXISTS "SchoolPayment_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolLibraryBook" DROP CONSTRAINT IF EXISTS "SchoolLibraryBook_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolLeaveRequest" DROP CONSTRAINT IF EXISTS "SchoolLeaveRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolInvoice" DROP CONSTRAINT IF EXISTS "SchoolInvoice_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostel" DROP CONSTRAINT IF EXISTS "SchoolHostel_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolHostelAllocation" DROP CONSTRAINT IF EXISTS "SchoolHostelAllocation_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolGrade" DROP CONSTRAINT IF EXISTS "SchoolGrade_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolEnrollment" DROP CONSTRAINT IF EXISTS "SchoolEnrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolCourse" DROP CONSTRAINT IF EXISTS "SchoolCourse_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBroadcast" DROP CONSTRAINT IF EXISTS "SchoolBroadcast_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBroadcastRecipient" DROP CONSTRAINT IF EXISTS "SchoolBroadcastRecipient_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolBookCheckout" DROP CONSTRAINT IF EXISTS "SchoolBookCheckout_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolAttendance" DROP CONSTRAINT IF EXISTS "SchoolAttendance_pkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_pkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderStatusHistory" DROP CONSTRAINT IF EXISTS "SalesOrderStatusHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."SalesOrderItem" DROP CONSTRAINT IF EXISTS "SalesOrderItem_pkey";
ALTER TABLE IF EXISTS ONLY public."SalesDraft" DROP CONSTRAINT IF EXISTS "SalesDraft_pkey";
ALTER TABLE IF EXISTS ONLY public."Sale" DROP CONSTRAINT IF EXISTS "Sale_pkey";
ALTER TABLE IF EXISTS ONLY public."SaleItem" DROP CONSTRAINT IF EXISTS "SaleItem_pkey";
ALTER TABLE IF EXISTS ONLY public."Role" DROP CONSTRAINT IF EXISTS "Role_pkey";
ALTER TABLE IF EXISTS ONLY public."RestaurantTable" DROP CONSTRAINT IF EXISTS "RestaurantTable_pkey";
ALTER TABLE IF EXISTS ONLY public."Referral" DROP CONSTRAINT IF EXISTS "Referral_pkey";
ALTER TABLE IF EXISTS ONLY public."ReferralCode" DROP CONSTRAINT IF EXISTS "ReferralCode_pkey";
ALTER TABLE IF EXISTS ONLY public."Quote" DROP CONSTRAINT IF EXISTS "Quote_pkey";
ALTER TABLE IF EXISTS ONLY public."QuoteItem" DROP CONSTRAINT IF EXISTS "QuoteItem_pkey";
ALTER TABLE IF EXISTS ONLY public."PushSubscription" DROP CONSTRAINT IF EXISTS "PushSubscription_pkey";
ALTER TABLE IF EXISTS ONLY public."Purchase" DROP CONSTRAINT IF EXISTS "Purchase_pkey";
ALTER TABLE IF EXISTS ONLY public."PurchaseItem" DROP CONSTRAINT IF EXISTS "PurchaseItem_pkey";
ALTER TABLE IF EXISTS ONLY public."Promotion" DROP CONSTRAINT IF EXISTS "Promotion_pkey";
ALTER TABLE IF EXISTS ONLY public."Product" DROP CONSTRAINT IF EXISTS "Product_pkey";
ALTER TABLE IF EXISTS ONLY public."ProductUnit" DROP CONSTRAINT IF EXISTS "ProductUnit_pkey";
ALTER TABLE IF EXISTS ONLY public."ProductBundle" DROP CONSTRAINT IF EXISTS "ProductBundle_pkey";
ALTER TABLE IF EXISTS ONLY public."Prescription" DROP CONSTRAINT IF EXISTS "Prescription_pkey";
ALTER TABLE IF EXISTS ONLY public."Permission" DROP CONSTRAINT IF EXISTS "Permission_pkey";
ALTER TABLE IF EXISTS ONLY public."Payroll" DROP CONSTRAINT IF EXISTS "Payroll_pkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_pkey";
ALTER TABLE IF EXISTS ONLY public."Patient" DROP CONSTRAINT IF EXISTS "Patient_pkey";
ALTER TABLE IF EXISTS ONLY public."OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."LoyaltyTier" DROP CONSTRAINT IF EXISTS "LoyaltyTier_pkey";
ALTER TABLE IF EXISTS ONLY public."LoyaltyCampaign" DROP CONSTRAINT IF EXISTS "LoyaltyCampaign_pkey";
ALTER TABLE IF EXISTS ONLY public."Location" DROP CONSTRAINT IF EXISTS "Location_pkey";
ALTER TABLE IF EXISTS ONLY public."LocationStock" DROP CONSTRAINT IF EXISTS "LocationStock_pkey";
ALTER TABLE IF EXISTS ONLY public."LicenseVoucher" DROP CONSTRAINT IF EXISTS "LicenseVoucher_pkey";
ALTER TABLE IF EXISTS ONLY public."LabTest" DROP CONSTRAINT IF EXISTS "LabTest_pkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_pkey";
ALTER TABLE IF EXISTS ONLY public."InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_pkey";
ALTER TABLE IF EXISTS ONLY public."GiftCard" DROP CONSTRAINT IF EXISTS "GiftCard_pkey";
ALTER TABLE IF EXISTS ONLY public."GiftCardTransaction" DROP CONSTRAINT IF EXISTS "GiftCardTransaction_pkey";
ALTER TABLE IF EXISTS ONLY public."Expense" DROP CONSTRAINT IF EXISTS "Expense_pkey";
ALTER TABLE IF EXISTS ONLY public."Debt" DROP CONSTRAINT IF EXISTS "Debt_pkey";
ALTER TABLE IF EXISTS ONLY public."DebtPayment" DROP CONSTRAINT IF EXISTS "DebtPayment_pkey";
ALTER TABLE IF EXISTS ONLY public."Customer" DROP CONSTRAINT IF EXISTS "Customer_pkey";
ALTER TABLE IF EXISTS ONLY public."Consultation" DROP CONSTRAINT IF EXISTS "Consultation_pkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_pkey";
ALTER TABLE IF EXISTS ONLY public."CashRegisterSession" DROP CONSTRAINT IF EXISTS "CashRegisterSession_pkey";
ALTER TABLE IF EXISTS ONLY public."Business" DROP CONSTRAINT IF EXISTS "Business_pkey";
ALTER TABLE IF EXISTS ONLY public."BundleItem" DROP CONSTRAINT IF EXISTS "BundleItem_pkey";
ALTER TABLE IF EXISTS ONLY public."Batch" DROP CONSTRAINT IF EXISTS "Batch_pkey";
ALTER TABLE IF EXISTS ONLY public."BankTransaction" DROP CONSTRAINT IF EXISTS "BankTransaction_pkey";
ALTER TABLE IF EXISTS ONLY public."AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";
ALTER TABLE IF EXISTS ONLY public."Attendance" DROP CONSTRAINT IF EXISTS "Attendance_pkey";
ALTER TABLE IF EXISTS ONLY public."Appointment" DROP CONSTRAINT IF EXISTS "Appointment_pkey";
ALTER TABLE IF EXISTS ONLY public."ActivationTier" DROP CONSTRAINT IF EXISTS "ActivationTier_pkey";
DROP TABLE IF EXISTS public."_SaleToTransactionTag";
DROP TABLE IF EXISTS public."_PurchaseToTransactionTag";
DROP TABLE IF EXISTS public."_PermissionToRole";
DROP TABLE IF EXISTS public."_ExpenseToTransactionTag";
DROP TABLE IF EXISTS public."Wastage";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."TransactionTag";
DROP TABLE IF EXISTS public."SystemSetting";
DROP TABLE IF EXISTS public."SupplierPriceList";
DROP TABLE IF EXISTS public."SupplierPayment";
DROP TABLE IF EXISTS public."Supplier";
DROP TABLE IF EXISTS public."Subscription";
DROP TABLE IF EXISTS public."StockTransfer";
DROP TABLE IF EXISTS public."StockMovement";
DROP TABLE IF EXISTS public."SchoolTerm";
DROP TABLE IF EXISTS public."SchoolStudent";
DROP TABLE IF EXISTS public."SchoolStaff";
DROP TABLE IF EXISTS public."SchoolPayslip";
DROP TABLE IF EXISTS public."SchoolPayment";
DROP TABLE IF EXISTS public."SchoolLibraryBook";
DROP TABLE IF EXISTS public."SchoolLeaveRequest";
DROP TABLE IF EXISTS public."SchoolInvoice";
DROP TABLE IF EXISTS public."SchoolHostelAllocation";
DROP TABLE IF EXISTS public."SchoolHostel";
DROP TABLE IF EXISTS public."SchoolGrade";
DROP TABLE IF EXISTS public."SchoolEnrollment";
DROP TABLE IF EXISTS public."SchoolCourse";
DROP TABLE IF EXISTS public."SchoolBroadcastRecipient";
DROP TABLE IF EXISTS public."SchoolBroadcast";
DROP TABLE IF EXISTS public."SchoolBookCheckout";
DROP TABLE IF EXISTS public."SchoolAttendance";
DROP TABLE IF EXISTS public."SalesOrderStatusHistory";
DROP TABLE IF EXISTS public."SalesOrderItem";
DROP TABLE IF EXISTS public."SalesOrder";
DROP TABLE IF EXISTS public."SalesDraft";
DROP TABLE IF EXISTS public."SaleItem";
DROP TABLE IF EXISTS public."Sale";
DROP TABLE IF EXISTS public."Role";
DROP TABLE IF EXISTS public."RestaurantTable";
DROP TABLE IF EXISTS public."ReferralCode";
DROP TABLE IF EXISTS public."Referral";
DROP TABLE IF EXISTS public."QuoteItem";
DROP TABLE IF EXISTS public."Quote";
DROP TABLE IF EXISTS public."PushSubscription";
DROP TABLE IF EXISTS public."PurchaseItem";
DROP TABLE IF EXISTS public."Purchase";
DROP TABLE IF EXISTS public."Promotion";
DROP TABLE IF EXISTS public."ProductUnit";
DROP TABLE IF EXISTS public."ProductBundle";
DROP TABLE IF EXISTS public."Product";
DROP TABLE IF EXISTS public."Prescription";
DROP TABLE IF EXISTS public."Permission";
DROP TABLE IF EXISTS public."Payroll";
DROP TABLE IF EXISTS public."Payment";
DROP TABLE IF EXISTS public."Patient";
DROP TABLE IF EXISTS public."OrderStatusHistory";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."LoyaltyTier";
DROP TABLE IF EXISTS public."LoyaltyCampaign";
DROP TABLE IF EXISTS public."LocationStock";
DROP TABLE IF EXISTS public."Location";
DROP TABLE IF EXISTS public."LicenseVoucher";
DROP TABLE IF EXISTS public."LabTest";
DROP TABLE IF EXISTS public."InvoiceItem";
DROP TABLE IF EXISTS public."Invoice";
DROP TABLE IF EXISTS public."GiftCardTransaction";
DROP TABLE IF EXISTS public."GiftCard";
DROP TABLE IF EXISTS public."Expense";
DROP TABLE IF EXISTS public."DebtPayment";
DROP TABLE IF EXISTS public."Debt";
DROP TABLE IF EXISTS public."Customer";
DROP TABLE IF EXISTS public."Consultation";
DROP TABLE IF EXISTS public."Category";
DROP TABLE IF EXISTS public."CashRegisterSession";
DROP TABLE IF EXISTS public."Business";
DROP TABLE IF EXISTS public."BundleItem";
DROP TABLE IF EXISTS public."Batch";
DROP TABLE IF EXISTS public."BankTransaction";
DROP TABLE IF EXISTS public."AuditLog";
DROP TABLE IF EXISTS public."Attendance";
DROP TABLE IF EXISTS public."Appointment";
DROP TABLE IF EXISTS public."ActivationTier";
DROP TYPE IF EXISTS public."SubscriptionPlan";
DROP TYPE IF EXISTS public."StockMovementType";
DROP TYPE IF EXISTS public."QuoteStatus";
DROP TYPE IF EXISTS public."ProductType";
DROP TYPE IF EXISTS public."BusinessType";
--
-- Name: BusinessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BusinessType" AS ENUM (
    'SHOP',
    'RESTAURANT',
    'BAR',
    'PHARMACY',
    'SUPERMARKET',
    'CLINIC',
    'HOSPITAL',
    'OFFICE',
    'SCHOOL'
);


--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


--
-- Name: QuoteStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuoteStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'CONVERTED'
);


--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT',
    'RETURN'
);


--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'BASIC',
    'STANDARD',
    'BUSINESS',
    'ENTERPRISE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivationTier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ActivationTier" (
    id text NOT NULL,
    name text NOT NULL,
    "maxUsers" integer DEFAULT 5 NOT NULL,
    "maxProducts" integer DEFAULT 100 NOT NULL,
    price numeric(10,2) NOT NULL,
    features text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "appointmentDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    reason text,
    notes text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessId" text NOT NULL,
    "clockIn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "clockOut" timestamp(3) without time zone,
    status text DEFAULT 'PRESENT'::text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "userId" text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: BankTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankTransaction" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    reference text,
    "matchedWithId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Batch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Batch" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "batchNumber" text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "manufacturingDate" timestamp(3) without time zone,
    "expiryDate" timestamp(3) without time zone,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: BundleItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BundleItem" (
    id text NOT NULL,
    "bundleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


--
-- Name: Business; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Business" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    type public."BusinessType" DEFAULT 'SHOP'::public."BusinessType" NOT NULL,
    plan public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "trialStartDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "trialEndDate" timestamp(3) without time zone,
    "enabledModules" text[] DEFAULT ARRAY[]::text[],
    currency text DEFAULT 'SLL'::text NOT NULL,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "registrationReceipt" text,
    address text,
    email text,
    phone text,
    "flutterwaveRef" text,
    "subscriptionStatus" text DEFAULT 'INACTIVE'::text NOT NULL,
    "requestedBillingPeriod" text DEFAULT 'monthly'::text NOT NULL,
    "institutionType" text,
    "customReferralSource" text,
    "referralSource" text,
    "activationTierId" text
);


--
-- Name: CashRegisterSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CashRegisterSession" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "startingCash" numeric(10,2) NOT NULL,
    "actualEndingCash" numeric(10,2),
    "expectedEndingCash" numeric(10,2),
    status text DEFAULT 'OPEN'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Consultation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Consultation" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "appointmentId" text,
    vitals jsonb,
    "chiefComplaint" text,
    symptoms text,
    diagnosis text,
    "treatmentPlan" text,
    "doctorNotes" text,
    "businessId" text NOT NULL,
    "saleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Debt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Debt" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "saleId" text,
    "totalAmount" numeric(10,2) NOT NULL,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "dueDate" timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: DebtPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DebtPayment" (
    id text NOT NULL,
    "debtId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentMethod" text DEFAULT 'CASH'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    note text
);


--
-- Name: Expense; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Expense" (
    id text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMethod" text DEFAULT 'CASH'::text NOT NULL,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    attachments text[] DEFAULT ARRAY[]::text[]
);


--
-- Name: GiftCard; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GiftCard" (
    id text NOT NULL,
    code text NOT NULL,
    "originalAmount" numeric(10,2) NOT NULL,
    balance numeric(10,2) NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "issuedTo" text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: GiftCardTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GiftCardTransaction" (
    id text NOT NULL,
    "giftCardId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    "saleRef" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "balanceDue" numeric(10,2) DEFAULT 0 NOT NULL,
    "customerId" text,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "invoiceNumber" text NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "subTotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 0 NOT NULL,
    terms text,
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL
);


--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL
);


--
-- Name: LabTest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LabTest" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "consultationId" text,
    "testName" text NOT NULL,
    "testCategory" text,
    results text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "labTechnicianId" text,
    "businessId" text NOT NULL,
    "saleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LicenseVoucher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LicenseVoucher" (
    id text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    "tierId" text NOT NULL,
    "durationDays" integer NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "redeemedById" text,
    "redeemedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'STORE'::text NOT NULL,
    address text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LocationStock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LocationStock" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LoyaltyCampaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyCampaign" (
    id text NOT NULL,
    name text NOT NULL,
    "targetCluster" text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: LoyaltyTier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoyaltyTier" (
    id text NOT NULL,
    name text NOT NULL,
    multiplier double precision NOT NULL,
    discount double precision NOT NULL,
    "businessId" text NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    status text NOT NULL,
    note text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "businessId" text
);


--
-- Name: Patient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Patient" (
    id text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    gender text,
    phone text,
    email text,
    address text,
    allergies text,
    "medicalNotes" text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    conditions text,
    "currentMedications" text,
    "emergencyContact" text,
    immunizations text,
    nationality text,
    "pastProcedures" text
);


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "invoiceId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentMethod" text NOT NULL,
    "paymentRef" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Payroll; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payroll" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    key text NOT NULL
);


--
-- Name: Prescription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Prescription" (
    id text NOT NULL,
    "prescriptionNumber" text NOT NULL,
    "patientId" text NOT NULL,
    "doctorName" text NOT NULL,
    "dateIssued" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    notes text,
    instructions text,
    "businessId" text NOT NULL,
    "saleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    sku text,
    description text,
    barcode text,
    "unitPrice" numeric(10,2) NOT NULL,
    "costPrice" numeric(10,2),
    "stockQuantity" numeric(10,2) DEFAULT 0 NOT NULL,
    "minStockLevel" integer DEFAULT 10 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb,
    "businessId" text NOT NULL,
    "categoryId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isNetworkAvailable" boolean DEFAULT false NOT NULL,
    "requiresPrescription" boolean DEFAULT false NOT NULL,
    "genericAlternative" text,
    "isControlledSubstance" boolean DEFAULT false NOT NULL,
    "originalBusinessId" text,
    "originalProductId" text,
    type public."ProductType" DEFAULT 'PRODUCT'::public."ProductType" NOT NULL,
    "imageUrl" text,
    "baseUnit" text DEFAULT 'Unit'::text NOT NULL,
    "isFavorite" boolean DEFAULT false NOT NULL,
    "maxStockLevel" integer
);


--
-- Name: ProductBundle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductBundle" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "bundlePrice" numeric(10,2) NOT NULL,
    "imageUrl" text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductUnit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductUnit" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    ratio numeric(10,4) NOT NULL,
    "sellingPrice" numeric(10,2) NOT NULL,
    "costPrice" numeric(10,2),
    barcode text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Promotion" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    value numeric(10,2) NOT NULL,
    "minQty" integer,
    "freeQty" integer,
    "minAmount" numeric(10,2),
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "appliesTo" text DEFAULT 'ALL'::text NOT NULL,
    "categoryId" text,
    "productId" text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Purchase" (
    id text NOT NULL,
    "invoiceNumber" text,
    "totalAmount" numeric(10,2) NOT NULL,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    "supplierId" text,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    attachments text[] DEFAULT ARRAY[]::text[],
    "dueDate" timestamp(3) without time zone,
    "paidAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentStatus" text DEFAULT 'PAID'::text NOT NULL
);


--
-- Name: PurchaseItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PurchaseItem" (
    id text NOT NULL,
    "purchaseId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitCost" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "businessId" text,
    "unitId" text
);


--
-- Name: PushSubscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PushSubscription" (
    id text NOT NULL,
    endpoint text NOT NULL,
    "keysAuth" text NOT NULL,
    "keysP256dh" text NOT NULL,
    "businessId" text NOT NULL,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Quote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Quote" (
    id text NOT NULL,
    reference text NOT NULL,
    "customerId" text,
    status public."QuoteStatus" DEFAULT 'DRAFT'::public."QuoteStatus" NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    notes text,
    "validUntil" timestamp(3) without time zone,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: QuoteItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QuoteItem" (
    id text NOT NULL,
    "quoteId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL
);


--
-- Name: Referral; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Referral" (
    id text NOT NULL,
    "referrerBusinessId" text NOT NULL,
    "referredBusinessId" text NOT NULL,
    "codeUsed" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "rewardGranted" boolean DEFAULT false NOT NULL,
    "rewardDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ReferralCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReferralCode" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    code text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: RestaurantTable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RestaurantTable" (
    id text NOT NULL,
    name text NOT NULL,
    capacity integer DEFAULT 4 NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    "businessId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Sale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Sale" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentMethod" text DEFAULT 'CASH'::text NOT NULL,
    "paymentStatus" text DEFAULT 'PAID'::text NOT NULL,
    status text DEFAULT 'COMPLETED'::text NOT NULL,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "customerId" text,
    "patientId" text,
    "tableId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "staffId" text,
    "staffName" text,
    attachments text[] DEFAULT ARRAY[]::text[],
    "splitPayments" jsonb
);


--
-- Name: SaleItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SaleItem" (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "productId" text,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "externalCostPrice" numeric(10,2),
    "externalSourceName" text,
    "isExternalSourced" boolean DEFAULT false NOT NULL,
    "productName" text,
    "businessId" text
);


--
-- Name: SalesDraft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SalesDraft" (
    id text NOT NULL,
    "draftNumber" text NOT NULL,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "customerId" text,
    "customerName" text,
    "customerPhone" text,
    items jsonb NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


--
-- Name: SalesOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SalesOrder" (
    id text NOT NULL,
    "soNumber" text NOT NULL,
    "orderDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expectedDate" timestamp(3) without time zone,
    "customerName" text NOT NULL,
    "customerEmail" text,
    "customerPhone" text,
    "deliveryAddress" text,
    "billingAddress" text,
    "paymentTerms" text DEFAULT 'Due on Receipt'::text NOT NULL,
    "deliveryMethod" text,
    notes text,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "convertedSaleId" text,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "customerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: SalesOrderItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SalesOrderItem" (
    id text NOT NULL,
    "salesOrderId" text NOT NULL,
    "productId" text,
    "productName" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "businessId" text
);


--
-- Name: SalesOrderStatusHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SalesOrderStatusHistory" (
    id text NOT NULL,
    "salesOrderId" text NOT NULL,
    status text NOT NULL,
    note text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SchoolAttendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolAttendance" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'PRESENT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolBookCheckout; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolBookCheckout" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "bookId" text NOT NULL,
    "studentId" text NOT NULL,
    "checkoutDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "returnDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolBroadcast; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolBroadcast" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    channel text NOT NULL,
    audience text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolBroadcastRecipient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolBroadcastRecipient" (
    id text NOT NULL,
    "broadcastId" text NOT NULL,
    "studentId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "errorReason" text,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolCourse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolCourse" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "courseName" text NOT NULL,
    "courseCode" text NOT NULL,
    description text,
    duration text NOT NULL,
    fee numeric(10,2) NOT NULL,
    schedule text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolEnrollment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolEnrollment" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    "enrollmentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completionDate" timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolGrade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolGrade" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    "termId" text NOT NULL,
    score numeric(5,2) NOT NULL,
    grade text,
    remarks text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolHostel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolHostel" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "blockName" text NOT NULL,
    "roomNumber" text NOT NULL,
    capacity integer DEFAULT 1 NOT NULL,
    type text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolHostelAllocation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolHostelAllocation" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "hostelId" text NOT NULL,
    "studentId" text NOT NULL,
    "allocationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolInvoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolInvoice" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    title text NOT NULL,
    description text,
    "totalAmount" numeric(10,2) NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolLeaveRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolLeaveRequest" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "staffId" text NOT NULL,
    "leaveType" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    reason text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolLibraryBook; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolLibraryBook" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    title text NOT NULL,
    author text,
    isbn text,
    category text,
    "totalCopies" integer DEFAULT 1 NOT NULL,
    "availableCopies" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolPayment" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text,
    amount numeric(10,2) NOT NULL,
    "paymentDate" timestamp(3) without time zone NOT NULL,
    "paymentMethod" text,
    status text DEFAULT 'PAID'::text NOT NULL,
    "receiptNumber" text,
    "formType" text,
    "paymentReference" text,
    "guardianName" text,
    "guardianPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invoiceId" text
);


--
-- Name: SchoolPayslip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolPayslip" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "staffId" text NOT NULL,
    month text NOT NULL,
    "baseSalary" numeric(10,2) NOT NULL,
    deductions numeric(10,2) DEFAULT 0 NOT NULL,
    bonuses numeric(10,2) DEFAULT 0 NOT NULL,
    "netPay" numeric(10,2) NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolStaff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolStaff" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    role text NOT NULL,
    department text,
    salary numeric(10,2) NOT NULL,
    "hireDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SchoolStudent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolStudent" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    "studentId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    gender text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    address text,
    phone text,
    email text,
    "photoPath" text,
    "enrollmentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "applicationSource" text DEFAULT 'ONLINE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "guardianName" text,
    "guardianPhone" text,
    "guardianEmail" text,
    "guardianRelation" text,
    "bloodGroup" text,
    "medicalConditions" text,
    "currentLevel" text
);


--
-- Name: SchoolTerm; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SchoolTerm" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StockMovement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockMovement" (
    id text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    type public."StockMovementType" NOT NULL,
    reason text,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StockTransfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockTransfer" (
    id text NOT NULL,
    "fromLocationId" text NOT NULL,
    "toLocationId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "businessId" text NOT NULL,
    plan public."SubscriptionPlan" NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'SLL'::text NOT NULL,
    "paymentRef" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    contact text,
    email text,
    phone text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    address text,
    notes text,
    "paymentTerms" text DEFAULT 'Net 30'::text,
    "taxId" text
);


--
-- Name: SupplierPayment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierPayment" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "paymentMethod" text DEFAULT 'CASH'::text NOT NULL,
    "referenceNumber" text,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "businessId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SupplierPriceList; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierPriceList" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "productId" text NOT NULL,
    "unitCost" numeric(10,2) NOT NULL,
    "minOrderQty" integer DEFAULT 1 NOT NULL,
    "leadTimeDays" integer DEFAULT 1,
    notes text,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSetting" (
    id text DEFAULT 'singleton'::text NOT NULL,
    "registrationOpen" boolean DEFAULT true NOT NULL,
    "defaultTrialDays" integer DEFAULT 30 NOT NULL,
    "announcementBanner" text DEFAULT ''::text NOT NULL,
    "announcementBannerUpdatedAt" text DEFAULT ''::text NOT NULL,
    "emailAlertsEnabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TransactionTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransactionTag" (
    id text NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#4F46E5'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    username text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "businessId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "roleId" text NOT NULL,
    specialization text,
    "hourlyRate" numeric(10,2),
    salary numeric(10,2),
    "emailVerified" timestamp(3) without time zone,
    "verificationToken" text,
    department text,
    "imageUrl" text,
    "jobTitle" text,
    phone text,
    "failedLoginAttempts" integer DEFAULT 0 NOT NULL
);


--
-- Name: Wastage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wastage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit text DEFAULT 'Unit'::text NOT NULL,
    reason text NOT NULL,
    "costValue" numeric(10,2) NOT NULL,
    notes text,
    "businessId" text NOT NULL,
    "recordedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _ExpenseToTransactionTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_ExpenseToTransactionTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _PermissionToRole; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_PermissionToRole" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _PurchaseToTransactionTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_PurchaseToTransactionTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _SaleToTransactionTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_SaleToTransactionTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Data for Name: ActivationTier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ActivationTier" (id, name, "maxUsers", "maxProducts", price, features, "createdAt", "updatedAt") FROM stdin;
cmsc1q5n2000101s6k06eln0y	PRO	20	1000	0.00	{}	2026-08-02 17:00:09.614	2026-08-02 17:00:09.614
cmsc1qam4000301s6y6s9v10s	ENTERPRISE	100	10000	0.00	{}	2026-08-02 17:00:16.06	2026-08-02 17:00:16.06
\.


--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Appointment" (id, "patientId", "doctorId", "appointmentDate", status, reason, notes, "businessId", "createdAt", "updatedAt") FROM stdin;
cmshide0p000q01s6upuxju0s	cmshi5thw000j01s63ftb92nd	cmshe96pv000501s6c0w9pf09	2026-08-06 12:44:00	COMPLETED	Frequent Running stomach issues	\N	cmshcxlvv000001s682ba2jim	2026-08-06 12:44:58.297	2026-08-06 12:56:16.09
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Attendance" (id, "userId", "businessId", "clockIn", "clockOut", status, note, "createdAt", "updatedAt", "deletedAt") FROM stdin;
att_1784722996946_5af60bt	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:23:16.948	2026-07-22 12:23:31.675	ON_TIME	Morning 	2026-07-22 12:23:16.948	2026-07-22 12:23:31.675	\N
att_1785764762602_q9jjelj	cmsda4ufa000f01s6k3ak46m9	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:46:02.605	\N	ON_TIME	Morning 	2026-08-03 13:46:02.605	2026-08-03 13:46:02.605	\N
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, action, entity, "entityId", "oldData", "newData", "userId", "businessId", "createdAt", "deletedAt", "updatedAt") FROM stdin;
cmrjvqo64000801s6551s97cf	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-13 23:55:03.004	\N	2026-07-13 23:55:03.004
cmrjwh3f8000a01s6uy4rzbpj	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 00:15:35.828	\N	2026-07-14 00:15:35.828
cmrjwhkxd000b01s66qssn7y4	DELETED BUSINESS NODE: Clinic Demo	BUSINESS	cmrjvol8h000001s6ylwzi2pp	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 00:15:58.513	\N	2026-07-14 00:15:58.513
cmrkhekhd000001s6klbvpzw8	LOGGED IN (Google)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 10:01:29.905	\N	2026-07-14 10:01:29.905
cmrklnhxh000001s6vz9dz1rn	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 12:00:24.965	\N	2026-07-14 12:00:24.965
cmrkloldc000101s6f3d42x0z	UPDATED BUSINESS PLAN: PROTECH ASSIST (SL) LIMITED to ENTERPRISE	BUSINESS	cmrkhbmst000001s696ifoy9y	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 12:01:16.08	\N	2026-07-14 12:01:16.08
cmrklpwne000001s6vl2y4uip	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 12:02:17.354	\N	2026-07-14 12:02:17.354
cmrklv5fg000201s6926qbktx	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 12:06:22.012	\N	2026-07-14 12:06:22.012
cmrklwt38000301s6pj84p0iq	UPDATED BUSINESS PLAN: PROTECH ASSIST (SL) LIMITED to ENTERPRISE	BUSINESS	cmrkhbmst000001s696ifoy9y	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 12:07:39.332	\N	2026-07-14 12:07:39.332
cmrkr3v6u000t01s6btbec8gd	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:33:06.726	\N	2026-07-14 14:33:06.726
cmrkr65uf000u01s6kz5jzbej	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:34:53.847	\N	2026-07-14 14:34:53.847
cmrkr7bp2000v01s6849mixgu	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:35:48.086	\N	2026-07-14 14:35:48.086
cmrkrgkh5000w01s6qjcv4wqa	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:42:59.369	\N	2026-07-14 14:42:59.369
cmrkriery000x01s6tos9uyzi	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:44:25.295	\N	2026-07-14 14:44:25.295
cmrkrkipe000y01s6zpvebpti	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:46:03.699	\N	2026-07-14 14:46:03.699
cmrkrl09s000z01s6pzd9giqm	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:46:26.464	\N	2026-07-14 14:46:26.464
cmrkrl5xf001001s6jash8od7	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:46:33.795	\N	2026-07-14 14:46:33.795
cmrkrlbki001101s6buf9q6gt	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:46:41.106	\N	2026-07-14 14:46:41.106
cmrkrlll1001201s64ikw296s	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:46:54.085	\N	2026-07-14 14:46:54.085
cmrkrm6bd001301s62kn4z66a	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:47:20.953	\N	2026-07-14 14:47:20.953
cmrkrnd3n001401s654oguifu	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:48:16.403	\N	2026-07-14 14:48:16.403
cmrkrochd001501s6vv5ykdzu	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:49:02.257	\N	2026-07-14 14:49:02.257
cmrkrp1jh001601s6bkzrufp5	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:49:34.733	\N	2026-07-14 14:49:34.733
cmrkrsnuu001701s6a4rwsbx2	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:52:23.622	\N	2026-07-14 14:52:23.622
cmrkrv8nl001801s6r0bc5dfl	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:54:23.889	\N	2026-07-14 14:54:23.889
cmrks2cra001901s6gjgr0l25	SENT ECOSYSTEM PUSH BROADCAST: "System update" - "Already fix bug that was affecting the a"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:59:55.798	\N	2026-07-14 14:59:55.798
cmrks4ayo001b01s64o9bbv74	SENT ECOSYSTEM PUSH BROADCAST: "System Update" - "we have a issues were customer have been"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:01:26.784	\N	2026-07-14 15:01:26.784
cmrks6co5001c01s63jxrbhqj	BROADCASTED SYSTEM SOFTWARE UPDATE: "v1.5" - "Software update"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:03:02.309	\N	2026-07-14 15:03:02.309
cmrks9pk4001d01s6z8yneord	BROADCASTED SYSTEM SOFTWARE UPDATE: "V--1.0" - "Software Update"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:05:38.98	\N	2026-07-14 15:05:38.98
cmrksrfyl001e01s6qego1wpx	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:19:26.349	\N	2026-07-14 15:19:26.349
cmrkt5rdv001f01s6nn2pd3e5	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:30:34.339	\N	2026-07-14 15:30:34.339
cmrktdp34001g01s63sxf5hnz	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:36:44.609	\N	2026-07-14 15:36:44.609
cmrktdp45001h01s6t82rip2b	ISSUED GLOBAL BROADCAST: "<msg>"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:36:44.645	\N	2026-07-14 15:36:44.645
cmrktf2zn001i01s66y0n6o3x	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:37:49.283	\N	2026-07-14 15:37:49.283
cmrktf30n001j01s6zus92195	ISSUED GLOBAL BROADCAST: "<msg>"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:37:49.319	\N	2026-07-14 15:37:49.319
cmrktf43z001k01s6v8oadoh6	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:37:50.735	\N	2026-07-14 15:37:50.735
cmrktf44v001l01s64oowci9r	ISSUED GLOBAL BROADCAST: "messages"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:37:50.767	\N	2026-07-14 15:37:50.767
cmrkth1kg001m01s6esb6y57i	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:39:20.752	\N	2026-07-14 15:39:20.752
cmrkth1li001n01s6k93ec5v2	ISSUED GLOBAL BROADCAST: "<Single>"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:39:20.79	\N	2026-07-14 15:39:20.79
cmrktjso8001o01s6ihqobtvr	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:41:29.192	\N	2026-07-14 15:41:29.192
cmrktjsox001p01s62jbkr180	ISSUED GLOBAL BROADCAST: "< welcome to Protech inventory Os >"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:41:29.217	\N	2026-07-14 15:41:29.217
cmrktjyln001q01s67plh1ipl	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:41:36.875	\N	2026-07-14 15:41:36.875
cmrktjymp001r01s62xmczfqr	ISSUED GLOBAL BROADCAST: "<Welcome to the single family>"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:41:36.913	\N	2026-07-14 15:41:36.913
cmrktll9t001s01s66y3hx1ca	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:42:52.913	\N	2026-07-14 15:42:52.913
cmrktllaj001t01s67hmncepe	ISSUED GLOBAL BROADCAST: "< welcome to Protech inventory Os >  Suc..."	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:42:52.939	\N	2026-07-14 15:42:52.939
cmrktngd5001u01s63js1h6nr	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:44:19.865	\N	2026-07-14 15:44:19.865
cmrktngdy001v01s637s2f5zc	ISSUED GLOBAL BROADCAST: "< welcome to Protech inventory Os >"	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:44:19.894	\N	2026-07-14 15:44:19.894
cmrku3r6g001w01s67xriusq0	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:00.376	\N	2026-07-14 15:57:00.376
cmrku3rhl001x01s6grqze8j5	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:00.777	\N	2026-07-14 15:57:00.777
cmrku44pj001y01s6gl017i4t	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:17.911	\N	2026-07-14 15:57:17.911
cmrku46zz001z01s6sol0kmss	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:20.879	\N	2026-07-14 15:57:20.879
cmrku492p002001s6rz1000pj	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:23.569	\N	2026-07-14 15:57:23.569
cmrku4bjq002101s6d7y3ou32	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:26.774	\N	2026-07-14 15:57:26.774
cmrku4dk5002201s6t9epg6ji	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:29.381	\N	2026-07-14 15:57:29.381
cmrku4shh002301s61rykzxi6	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:57:48.725	\N	2026-07-14 15:57:48.725
cmrkuahjd002401s6vrht47gd	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-14 16:02:14.473	\N	2026-07-14 16:02:14.473
cmrm1oj7v000001s6jfe3zqud	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 12:16:53.323	\N	2026-07-15 12:16:53.323
cmrm28bho000101s6dxrfgwnp	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 12:32:16.428	\N	2026-07-15 12:32:16.428
cmrm6yfq8000i01s6959jvtxw	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 14:44:33.44	\N	2026-07-15 14:44:33.44
cmrm6ytjk000j01s6wcue5446	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 14:44:51.344	\N	2026-07-15 14:44:51.344
cmrm723pc000001s6z3gj2l48	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 14:47:24.48	\N	2026-07-15 14:47:24.48
cmrm9akdc000301s6ux6863wc	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 15:49:58.56	\N	2026-07-15 15:49:58.56
cmrm9aw3u000401s6kt37mvr6	DELETED BUSINESS NODE: PROTECH INTERNATIONAL DEMO	BUSINESS	cmrm8pv10000001s6sapr1p0t	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 15:50:13.77	\N	2026-07-15 15:50:13.77
cmrmdj5qj000001s6cu10laof	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 17:48:37.964	\N	2026-07-15 17:48:37.964
cmrmdluak000201s69f7zkxkp	CREATED NEW SUPER ADMIN: stevenstrange001@outlook.com	USER	cmrmdlu9f000101s6fu54q4y4	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-15 17:50:43.1	\N	2026-07-15 17:50:43.1
cmrmdmtqv000301s6g5y097pv	LOGGED IN (Credentials)	USER	cmrmdlu9f000101s6fu54q4y4	\N	\N	cmrmdlu9f000101s6fu54q4y4	cmrjt12jq0000lcln3os8anz5	2026-07-15 17:51:29.047	\N	2026-07-15 17:51:29.047
cmrmq6et0000a01s6nzp407zb	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:42:38.196	\N	2026-07-15 23:42:38.196
cmrmqe94l000c01s68bl16k3y	Created Category: CCTV & Security	CATEGORY	cmrmqe93w000b01s6m0zbxhqt	\N	{"id": "cmrmqe93w000b01s6m0zbxhqt", "name": "CCTV & Security", "createdAt": "2026-07-15T23:48:44.060Z", "deletedAt": null, "updatedAt": "2026-07-15T23:48:44.060Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "Full HD network camera with infrared night vision and motion detection."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:48:44.085	\N	2026-07-15 23:48:44.085
cmrmqk5ak000e01s6jimj9gqg	CREATE	PRODUCT	cmrmqk58o000d01s6fzatd6n0	\N	{"id": "cmrmqk58o000d01s6fzatd6n0", "sku": "", "name": "Hikvision 2MP IP Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159420/inventory/products/c4kivdc2a5idyd1lbhev.webp", "metadata": {"packagingUnits": []}, "costPrice": "2800", "createdAt": "2026-07-15T23:53:18.984Z", "deletedAt": null, "unitPrice": "3499", "updatedAt": "2026-07-15T23:53:18.984Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": null, "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:53:19.052	\N	2026-07-15 23:53:19.052
cmrmqknnh000f01s6oxdpi1ik	UPDATE	PRODUCT	cmrmqk58o000d01s6fzatd6n0	\N	{"id": "cmrmqk58o000d01s6fzatd6n0", "sku": "", "name": "Hikvision 2MP IP Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159420/inventory/products/c4kivdc2a5idyd1lbhev.webp", "metadata": {"packagingUnits": []}, "costPrice": "2800", "createdAt": "2026-07-15T23:53:18.984Z", "deletedAt": null, "unitPrice": "3500", "updatedAt": "2026-07-15T23:53:42.808Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": null, "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:53:42.845	\N	2026-07-15 23:53:42.845
cmrmqr1ae000h01s68jry0472	CREATE	PRODUCT	cmrmqr19a000g01s6aqtfxfk6	\N	{"id": "cmrmqr19a000g01s6aqtfxfk6", "sku": "", "name": "Hikvision 5MP Dome Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159853/inventory/products/asztosoyhrd38na38ehi.webp", "metadata": {"packagingUnits": []}, "costPrice": "3500", "createdAt": "2026-07-15T23:58:40.414Z", "deletedAt": null, "unitPrice": "4001", "updatedAt": "2026-07-15T23:58:40.414Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqe93w000b01s6m0zbxhqt", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:58:40.454	\N	2026-07-15 23:58:40.454
cmrmqrph9000i01s69bk8skit	UPDATE	PRODUCT	cmrmqr19a000g01s6aqtfxfk6	\N	{"id": "cmrmqr19a000g01s6aqtfxfk6", "sku": "", "name": "Hikvision 5MP Dome Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159853/inventory/products/asztosoyhrd38na38ehi.webp", "metadata": {"packagingUnits": []}, "costPrice": "3500", "createdAt": "2026-07-15T23:58:40.414Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-07-15T23:59:11.767Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqe93w000b01s6m0zbxhqt", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:59:11.805	\N	2026-07-15 23:59:11.805
cmrmqs063000j01s6zscm6i16	UPDATE	PRODUCT	cmrmqk58o000d01s6fzatd6n0	\N	{"id": "cmrmqk58o000d01s6fzatd6n0", "sku": "", "name": "Hikvision 2MP IP Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159420/inventory/products/c4kivdc2a5idyd1lbhev.webp", "metadata": {"packagingUnits": []}, "costPrice": "2800", "createdAt": "2026-07-15T23:53:18.984Z", "deletedAt": null, "unitPrice": "3500", "updatedAt": "2026-07-15T23:59:25.622Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqe93w000b01s6m0zbxhqt", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:59:25.659	\N	2026-07-15 23:59:25.659
cmrmqv86z000l01s6a1f6aoa5	CREATE	PRODUCT	cmrmqv85x000k01s6btj8rupy	\N	{"id": "cmrmqv85x000k01s6btj8rupy", "sku": "", "name": "Hikvision Bullet Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160073/inventory/products/kcz5ky0uluunlwfqwfnd.webp", "metadata": {"packagingUnits": []}, "costPrice": "2800", "createdAt": "2026-07-16T00:01:55.989Z", "deletedAt": null, "unitPrice": "3500", "updatedAt": "2026-07-16T00:01:55.989Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqe93w000b01s6m0zbxhqt", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:01:56.027	\N	2026-07-16 00:01:56.027
cmrmqwmnl000n01s6ifd3hkpg	Created Category: Smart Locks	CATEGORY	cmrmqwmmw000m01s6mx38lur8	\N	{"id": "cmrmqwmmw000m01s6mx38lur8", "name": "Smart Locks", "createdAt": "2026-07-16T00:03:01.400Z", "deletedAt": null, "updatedAt": "2026-07-16T00:03:01.400Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "Fingerprint, PIN, card, key, and mobile app access."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:03:01.426	\N	2026-07-16 00:03:01.426
cmrmqys1m000p01s68043aoae	CREATE	PRODUCT	cmrmqys0v000o01s6xmwvel9d	\N	{"id": "cmrmqys0v000o01s6xmwvel9d", "sku": "", "name": "Tuya Smart Door Lock", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "2000", "createdAt": "2026-07-16T00:04:41.695Z", "deletedAt": null, "unitPrice": "5000", "updatedAt": "2026-07-16T00:04:41.695Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqwmmw000m01s6mx38lur8", "description": "", "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:04:41.722	\N	2026-07-16 00:04:41.722
cmrmqz6am000q01s6kddz6h5s	UPDATE	PRODUCT	cmrmqys0v000o01s6xmwvel9d	\N	{"id": "cmrmqys0v000o01s6xmwvel9d", "sku": "", "name": "Tuya Smart Door Lock", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160296/inventory/products/i1biytorquzp9mdmghha.webp", "metadata": {"packagingUnits": []}, "costPrice": "2000", "createdAt": "2026-07-16T00:04:41.695Z", "deletedAt": null, "unitPrice": "5000", "updatedAt": "2026-07-16T00:05:00.150Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqwmmw000m01s6mx38lur8", "description": "", "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:05:00.19	\N	2026-07-16 00:05:00.19
cmrmr5vve000w01s6x325oa97	CREATE	PRODUCT	cmrmr5vue000v01s6rz47br6y	\N	{"id": "cmrmr5vue000v01s6rz47br6y", "sku": "", "name": "Smart Video Doorbell", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160556/inventory/products/yv03rtr4h9fwjrrbylmq.webp", "metadata": {"packagingUnits": []}, "costPrice": "3500", "createdAt": "2026-07-16T00:10:13.238Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-07-16T00:10:13.238Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:10:13.274	\N	2026-07-16 00:10:13.274
cmrmr84vq000y01s6ip4ubc09	CREATE	PRODUCT	cmrmr84ux000x01s65ogzv6cr	\N	{"id": "cmrmr84ux000x01s65ogzv6cr", "sku": "", "name": "Smart Door Sensor", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160692/inventory/products/wd1qnl2vyhviqm2zqgcu.webp", "metadata": {"packagingUnits": []}, "costPrice": "4500", "createdAt": "2026-07-16T00:11:58.233Z", "deletedAt": null, "unitPrice": "5999", "updatedAt": "2026-07-16T00:11:58.233Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:11:58.262	\N	2026-07-16 00:11:58.262
cmrmr9yfl001001s62otqxmna	CREATE	PRODUCT	cmrmr9yev000z01s6llw0xrfx	\N	{"id": "cmrmr9yev000z01s6llw0xrfx", "sku": "", "name": "Smart Motion Sensor", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160780/inventory/products/njc1kynghwii0oat1gdl.webp", "metadata": {"packagingUnits": []}, "costPrice": "3501", "createdAt": "2026-07-16T00:13:23.191Z", "deletedAt": null, "unitPrice": "3999", "updatedAt": "2026-07-16T00:13:23.191Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:13:23.217	\N	2026-07-16 00:13:23.217
cmrmraeuw001101s6f9q5n1vq	UPDATE	PRODUCT	cmrmr9yev000z01s6llw0xrfx	\N	{"id": "cmrmr9yev000z01s6llw0xrfx", "sku": "", "name": "Smart Motion Sensor", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160780/inventory/products/njc1kynghwii0oat1gdl.webp", "metadata": {"packagingUnits": []}, "costPrice": "3501", "createdAt": "2026-07-16T00:13:23.191Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-07-16T00:13:44.469Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:13:44.504	\N	2026-07-16 00:13:44.504
cmrmro8j0001d01s6j0owiypo	CREATE	PRODUCT	cmrmro8i5001c01s6mfnf0oa3	\N	{"id": "cmrmro8i5001c01s6mfnf0oa3", "sku": "", "name": "Redmi Note 14", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161440/inventory/products/j4pl9klhnw2duh01rycd.webp", "metadata": {"packagingUnits": []}, "costPrice": "3500", "createdAt": "2026-07-16T00:24:29.453Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-07-16T00:24:29.453Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrc1df001201s697u9ugf9", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:24:29.484	\N	2026-07-16 00:24:29.484
cmrmrpd0a001f01s646vs0h02	Created Category: Laptops	CATEGORY	cmrmrpczo001e01s6l6pnyec1	\N	{"id": "cmrmrpczo001e01s6l6pnyec1", "name": "Laptops", "createdAt": "2026-07-16T00:25:21.924Z", "deletedAt": null, "updatedAt": "2026-07-16T00:25:21.924Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "Business laptop with Intel Core i5 processor."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:25:21.946	\N	2026-07-16 00:25:21.946
cmrmr1g6u000s01s6djakd2qz	CREATE	PRODUCT	cmrmr1g5u000r01s6mogei2xn	\N	{"id": "cmrmr1g5u000r01s6mogei2xn", "sku": "", "name": "Fingerprint Door Lock", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160379/inventory/products/l9qao244zdv6wk8xp5dj.webp", "metadata": {"packagingUnits": []}, "costPrice": "1000", "createdAt": "2026-07-16T00:06:46.290Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-07-16T00:06:46.290Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqwmmw000m01s6mx38lur8", "description": "", "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:06:46.326	\N	2026-07-16 00:06:46.326
cmrmr3j45000u01s6re4akde9	Created Category: Smart Home	CATEGORY	cmrmr3j3h000t01s6iyr5gjk6	\N	{"id": "cmrmr3j3h000t01s6iyr5gjk6", "name": "Smart Home", "createdAt": "2026-07-16T00:08:23.405Z", "deletedAt": null, "updatedAt": "2026-07-16T00:08:23.405Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": ""}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:08:23.429	\N	2026-07-16 00:08:23.429
cmrmrc1e4001301s62lxarvsd	Created Category: Smartphones	CATEGORY	cmrmrc1df001201s697u9ugf9	\N	{"id": "cmrmrc1df001201s697u9ugf9", "name": "Smartphones", "createdAt": "2026-07-16T00:15:00.339Z", "deletedAt": null, "updatedAt": "2026-07-16T00:15:00.339Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "6.7\\" Android smartphone with 5G connectivity and long-lasting battery."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:15:00.364	\N	2026-07-16 00:15:00.364
cmrmre96h001501s6a9xyu2bg	CREATE	PRODUCT	cmrmre95k001401s662v8j8cf	\N	{"id": "cmrmre95k001401s662v8j8cf", "sku": "", "name": "Samsung Galaxy A56", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160942/inventory/products/aftrrpfvtisns7xrwhta.webp", "metadata": {"packagingUnits": []}, "costPrice": "3000", "createdAt": "2026-07-16T00:16:43.736Z", "deletedAt": null, "unitPrice": "4500", "updatedAt": "2026-07-16T00:16:43.736Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrc1df001201s697u9ugf9", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:16:43.769	\N	2026-07-16 00:16:43.769
cmrmri310001701s6my73mnd2	CREATE	PRODUCT	cmrmri2zt001601s6zqhoba8z	\N	{"id": "cmrmri2zt001601s6zqhoba8z", "sku": "", "name": "iPhone 15", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161095/inventory/products/pent0jpwcjbaqzuiaxum.webp", "metadata": {"packagingUnits": []}, "costPrice": "15000", "createdAt": "2026-07-16T00:19:42.377Z", "deletedAt": null, "unitPrice": "20000", "updatedAt": "2026-07-16T00:19:42.377Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrc1df001201s697u9ugf9", "description": "", "minStockLevel": 10, "stockQuantity": "51", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:19:42.42	\N	2026-07-16 00:19:42.42
cmrmrk9t6001901s6i4ib6d8u	CREATE	PRODUCT	cmrmrk9sg001801s6a24s9awm	\N	{"id": "cmrmrk9sg001801s6a24s9awm", "sku": "", "name": "Tecno Camon 40", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161246/inventory/products/z9nclm5cxa6blalwsbgu.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-07-16T00:21:24.496Z", "deletedAt": null, "unitPrice": "8000", "updatedAt": "2026-07-16T00:21:24.496Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrc1df001201s697u9ugf9", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:21:24.522	\N	2026-07-16 00:21:24.522
cmrmrmkph001b01s6lcuwkzy4	CREATE	PRODUCT	cmrmrmkog001a01s60ry9zqmk	\N	{"id": "cmrmrmkog001a01s60ry9zqmk", "sku": "", "name": "Infinix Note 50", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161361/inventory/products/vklxjop0457fpfhzlx3n.webp", "metadata": {"packagingUnits": []}, "costPrice": "4500", "createdAt": "2026-07-16T00:23:11.920Z", "deletedAt": null, "unitPrice": "5000", "updatedAt": "2026-07-16T00:23:11.920Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrc1df001201s697u9ugf9", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:23:11.957	\N	2026-07-16 00:23:11.957
cmrmrr1um001h01s6w6ix5ov7	CREATE	PRODUCT	cmrmrr1tt001g01s6jwz4x6j2	\N	{"id": "cmrmrr1tt001g01s6jwz4x6j2", "sku": "", "name": "HP ProBook 450", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161568/inventory/products/nm96zwtdjkztggzrwieh.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-07-16T00:26:40.769Z", "deletedAt": null, "unitPrice": "7500", "updatedAt": "2026-07-16T00:26:40.769Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "description": "", "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:26:40.798	\N	2026-07-16 00:26:40.798
cmrmrte29001j01s6k9kzaiur	CREATE	PRODUCT	cmrmrte1b001i01s64lsy6zwo	\N	{"id": "cmrmrte1b001i01s64lsy6zwo", "sku": "", "name": "Dell Latitude 5440", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784161670/inventory/products/phbx4oxnd2jxtthhgdl9.webp", "metadata": {"packagingUnits": []}, "costPrice": "12000", "createdAt": "2026-07-16T00:28:29.903Z", "deletedAt": null, "unitPrice": "15000", "updatedAt": "2026-07-16T00:28:29.903Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "description": "", "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:28:29.938	\N	2026-07-16 00:28:29.938
cmrmt23er001n01s6jo7d3r9e	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 01:03:15.651	\N	2026-07-16 01:03:15.651
cmrnbu7mo000001s67pj56h7n	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 09:49:00.576	\N	2026-07-16 09:49:00.576
cmrnc587t000201s6hyduxmi8	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 09:57:34.553	\N	2026-07-16 09:57:34.553
cmrncyxal000501s6q8x53ji5	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 10:20:40.077	\N	2026-07-16 10:20:40.077
cmrncz8v6000601s6sunjqrg5	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 10:20:55.074	\N	2026-07-16 10:20:55.074
cmrndbmpw000801s6kx4jqd86	Created Supplier: CTC	SUPPLIER	cmrndbmox000701s60mewvkbs	\N	{"id": "cmrndbmox000701s60mewvkbs", "name": "CTC", "email": "", "phone": "034955581", "contact": "Mr. Moseray ", "createdAt": "2026-07-16T10:30:32.865Z", "deletedAt": null, "updatedAt": "2026-07-16T10:30:32.865Z", "businessId": "cmrmq5v0e000301s68rl1kxrs"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 10:30:32.9	\N	2026-07-16 10:30:32.9
cmrnfmrqx000901s677bepsu7	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 11:35:11.866	\N	2026-07-16 11:35:11.866
cmrnh08bi000c01s6kjig2ioq	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 12:13:39.486	\N	2026-07-16 12:13:39.486
cmrnhm3gj000h01s6cvz55nlm	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 12:30:39.619	\N	2026-07-16 12:30:39.619
cmrnhtgpb000i01s6tq0td69i	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:36:23.375	\N	2026-07-16 12:36:23.375
cmrnhts76000j01s641z8lj5q	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:36:38.274	\N	2026-07-16 12:36:38.274
cmrnhul8u000k01s6rt7mdeik	LOGGED IN (Credentials)	USER	cmrmdlu9f000101s6fu54q4y4	\N	\N	cmrmdlu9f000101s6fu54q4y4	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:37:15.918	\N	2026-07-16 12:37:15.918
cmrnhwf4v000l01s6yvvxhkii	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:38:41.311	\N	2026-07-16 12:38:41.311
cmrnhyngh000n01s6xye6rirk	CREATED NEW SUPER ADMIN: rahimtech007@gmail.com	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:40:25.409	\N	2026-07-16 12:40:25.409
cmrnhyrqm000p01s6kzi3tgfw	CREATED NEW SUPER ADMIN: juel.love@gmailcom	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:40:30.958	\N	2026-07-16 12:40:30.958
cmrni09kx000q01s6k0h4x7qo	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:41:40.737	\N	2026-07-16 12:41:40.737
cmrni0gta000r01s6v8rzo6uf	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:41:50.11	\N	2026-07-16 12:41:50.11
cmrnjeezn000001s6xda15v17	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:20:40.548	\N	2026-07-16 13:20:40.548
cmrnjtiyo000201s6kjuityis	Created Customer: king julian	CUSTOMER	cmrnjtixj000101s6ccu7re0t	\N	{"id": "cmrnjtixj000101s6ccu7re0t", "name": "king julian", "email": "", "phone": "031389794", "address": "", "createdAt": "2026-07-16T13:32:25.495Z", "deletedAt": null, "updatedAt": "2026-07-16T13:32:25.495Z", "businessId": "cmrmq5v0e000301s68rl1kxrs"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:32:25.536	\N	2026-07-16 13:32:25.536
cmrnjuoqw000801s6plyn9n47	Created Sale: INV-1784208799565-566 (Le 10,000)	SALE	cmrnjuooa000301s6p2rwrpz0	\N	{"totalAmount": 10000, "invoiceNumber": "INV-1784208799565-566"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:33:19.688	\N	2026-07-16 13:33:19.688
cmrnk2ljh000d01s6k3s4tkjx	Created Sale: INV-1784209168518-44 (Le 28,500)	SALE	cmrnk2lcp000201s6eozlh8u2	\N	{"totalAmount": 28500, "invoiceNumber": "INV-1784209168518-44"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:39:28.781	\N	2026-07-16 13:39:28.781
cmrnkm35o000h01s6tnhuv8d7	CREATE	PRODUCT	cmrnkm34d000f01s66kijfnfa	\N	{"id": "cmrnkm34d000f01s66kijfnfa", "sku": "", "name": "smart light", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "250", "sellingPrice": "25", "sellingUnitName": "Unit", "unitsPerPackage": "12", "purchaseUnitName": "Carton"}]}, "costPrice": "20.83", "createdAt": "2026-07-16T13:54:38.029Z", "deletedAt": null, "unitPrice": "25", "updatedAt": "2026-07-16T13:54:38.029Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "7", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:54:38.076	\N	2026-07-16 13:54:38.076
cmrnkncy0000j01s68pnnk3gc	UPDATE	PRODUCT	cmrnkm34d000f01s66kijfnfa	\N	{"id": "cmrnkm34d000f01s66kijfnfa", "sku": "", "name": "smart light", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "250", "sellingPrice": "25", "sellingUnitName": "Unit", "unitsPerPackage": "12", "purchaseUnitName": "Carton"}]}, "costPrice": "20.83", "createdAt": "2026-07-16T13:54:38.029Z", "deletedAt": null, "unitPrice": "25", "updatedAt": "2026-07-16T13:55:37.383Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "description": "", "minStockLevel": 10, "stockQuantity": "700", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:55:37.416	\N	2026-07-16 13:55:37.416
cmrnlokps000401s6vbqu11xd	Created Sale: INV-1784211873498-196 (Le 5,000)	SALE	cmrnlokj5000001s6d7o14fzy	\N	{"totalAmount": 5000, "invoiceNumber": "INV-1784211873498-196"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 14:24:33.76	\N	2026-07-16 14:24:33.76
cmrnlporw000901s6fzmr6z6m	Created Sale: INV-1784211925613-658 (Le 3,500)	SALE	cmrnlpoq9000501s60am7rqhe	\N	{"totalAmount": 3500, "invoiceNumber": "INV-1784211925613-658"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 14:25:25.676	\N	2026-07-16 14:25:25.676
cmrnnq3az000101s6pxqbb70u	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 15:21:43.74	\N	2026-07-16 15:21:43.74
cmrnsp79k000001s61q68ae4z	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 17:41:00.296	\N	2026-07-16 17:41:00.296
cmrnuf4t6000001s6975l2ztg	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 18:29:09.786	\N	2026-07-16 18:29:09.786
cmrnuh3pi000501s6857kpjpp	Created Sale: INV-1784226641564-996 (Le 8,000)	SALE	cmrnuh3n6000101s65iq15izv	\N	{"totalAmount": 8000, "invoiceNumber": "INV-1784226641564-996"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 18:30:41.67	\N	2026-07-16 18:30:41.67
cmrnukmx5000b01s6fqwb5o55	Created Sale: INV-1784226806454-523 (Le 5,000)	SALE	cmrnukmux000601s6ji6tkjht	\N	{"totalAmount": 5000, "invoiceNumber": "INV-1784226806454-523"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-16 18:33:26.537	\N	2026-07-16 18:33:26.537
cmroyzye5000001s6o5znw21o	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-17 13:25:05.885	\N	2026-07-17 13:25:05.885
cmroz5fxe000101s6wwbpuqsw	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-17 13:29:21.89	\N	2026-07-17 13:29:21.89
cmrozbwcs000a01s6jgl7xv01	Created Sale: INV-1784295262939-612 (Le 12,500)	SALE	cmrozbw8n000201s6mytg8fbu	\N	{"totalAmount": 12500, "invoiceNumber": "INV-1784295262939-612"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-17 13:34:23.116	\N	2026-07-17 13:34:23.116
cmrp3va1p000001s6mv2uhjdd	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-17 15:41:25.789	\N	2026-07-17 15:41:25.789
cmrp41c7x000801s62lh1jwg5	Created Sale: INV-1784303168412-982 (Le 37,500)	SALE	cmrp41c56000201s6t1ikwsjb	\N	{"totalAmount": 37500, "invoiceNumber": "INV-1784303168412-982"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-17 15:46:08.541	\N	2026-07-17 15:46:08.541
cmrt1u9x4000001s69nlqfg5n	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 09:55:44.44	\N	2026-07-20 09:55:44.44
cmrt4x48d000101s6dal5y2av	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 11:21:55.885	\N	2026-07-20 11:21:55.885
cmrt5jwlv000a01s69v4bmjl3	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 11:39:39.091	\N	2026-07-20 11:39:39.091
cmrt5ouvy000b01s6naugr2mj	UPDATE	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"name": "Admin", "email": "shop@gmail.com", "phone": null, "roleId": "cmrmq5v1p000401s6y72lcc3w", "salary": null, "imageUrl": "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=e2e8f0", "jobTitle": null, "department": null, "hourlyRate": null, "specialization": null}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 11:43:30.142	\N	2026-07-20 11:43:30.142
cmrta4s5p000001s6p0gsw3rt	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 13:47:51.565	\N	2026-07-20 13:47:51.565
cmrtabf5t000101s6hnh3mnjn	UPDATE	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"name": "Admin", "email": "shop@gmail.com", "phone": null, "roleId": "cmrmq5v1p000401s6y72lcc3w", "salary": null, "imageUrl": "https://api.dicebear.com/7.x/notionists/svg?seed=Jocelyn&backgroundColor=e2e8f0", "jobTitle": null, "department": null, "hourlyRate": null, "specialization": null}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 13:53:01.313	\N	2026-07-20 13:53:01.313
cmrtah31s000601s67c2tcx1w	Created Sale: INV-1784555845246-200 (Le 157,500)	SALE	cmrtah2u1000201s6ajasmzyt	\N	{"totalAmount": 157500, "invoiceNumber": "INV-1784555845246-200"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 13:57:25.552	\N	2026-07-20 13:57:25.552
cmrtaltxr000a01s6l7d431oq	Created Purchase: PO-2026-4940 (Le 2,800)	PURCHASE	cmrtaltvp000701s6ubddsgvv	\N	{"totalAmount": 2800, "invoiceNumber": "PO-2026-4940"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 14:01:07.023	\N	2026-07-20 14:01:07.023
cmrtbmivp000w01s6nzob0n15	Created Sale: INV-1784557778871-756 (Le 133,000)	SALE	cmrtbmit5000s01s6yxxln2ld	\N	{"totalAmount": 133000, "invoiceNumber": "INV-1784557778871-756"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 14:29:38.965	\N	2026-07-20 14:29:38.965
cmrtbu0xb001001s6ilmk2oc0	Created Purchase: PO-2026-4622 (Le 2,800)	PURCHASE	cmrtbu0vs000x01s6rb4qysgn	\N	{"totalAmount": 2800, "invoiceNumber": "PO-2026-4622"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 14:35:28.943	\N	2026-07-20 14:35:28.943
cmrtc3bf7001201s6q831orzg	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:42:42.451	\N	2026-07-20 14:42:42.451
cmrtc7hg9001301s64b0s1f32	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:45:56.889	\N	2026-07-20 14:45:56.889
cmrtc7wbx001401s61q9t2t0j	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:46:16.173	\N	2026-07-20 14:46:16.173
cmrtc7z0r001501s6mvn6ome4	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:46:19.659	\N	2026-07-20 14:46:19.659
cmrtc80qf001601s6zq1ynpi3	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:46:21.879	\N	2026-07-20 14:46:21.879
cmrtc820v001701s6kt5mo58y	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-07-20 14:46:23.551	\N	2026-07-20 14:46:23.551
cmrtdd1tg001801s611i6y581	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-20 15:18:16.18	\N	2026-07-20 15:18:16.18
cmrtddor7001901s6rdzrw5sp	APPROVED BUSINESS NODE: Electronics Shop Demo (Plan: ENTERPRISE) (Expires: 2026-08-20T19:19:01.717Z)	BUSINESS	cmrmq5v0e000301s68rl1kxrs	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-20 15:18:45.907	\N	2026-07-20 15:18:45.907
cmrtdekis001a01s6e7yjuvn7	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 15:19:27.076	\N	2026-07-20 15:19:27.076
cmrte2gjf001f01s6b0r1r3ud	Created Sale: INV-1784561881541-126 (Le 5,000)	SALE	cmrte2gg7001b01s6h19o9mmq	\N	{"totalAmount": 5000, "invoiceNumber": "INV-1784561881541-126"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-20 15:38:01.659	\N	2026-07-20 15:38:01.659
cmrukdeew000001s64msko86n	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:22:15.992	\N	2026-07-21 11:22:15.992
cmrukgnov000801s65bi2juwa	Created Sale: INV-1784633087855-906 (Le 18,998)	SALE	cmrukgnlz000101s6ztsst37m	\N	{"totalAmount": 18998, "invoiceNumber": "INV-1784633087855-906"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:24:47.983	\N	2026-07-21 11:24:47.983
cmrukhta9000e01s6y8e21il3	Created Sale: INV-1784633141836-310 (Le 29,995)	SALE	cmrukht8w000a01s6ydm208e0	\N	{"totalAmount": 29995, "invoiceNumber": "INV-1784633141836-310"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:25:41.889	\N	2026-07-21 11:25:41.889
cmrukk026000j01s68aboympx	Created Sale: INV-1784633243878-676 (Le 150,500)	SALE	cmrukjzzd000f01s6lucm1fh5	\N	{"totalAmount": 150500, "invoiceNumber": "INV-1784633243878-676"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:27:23.982	\N	2026-07-21 11:27:23.982
cmrutrcd5000001s60tma5fpu	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 15:45:03.065	\N	2026-07-21 15:45:03.065
cmruu1xcd000001s6u9mfeibz	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-21 15:53:16.813	\N	2026-07-21 15:53:16.813
cmrvyz2bc000001s62kd4y1td	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 10:58:47.544	\N	2026-07-22 10:58:47.544
cmrw153wz000001s6nvx2dvsy	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 11:59:28.787	\N	2026-07-22 11:59:28.787
cmrw19y6v000301s68w36opgo	CREATE_USER	USER	cmrw19y5t000201s6tl660ld1	\N	{"name": "Ishmael Steven Moseray ", "email": "steven@gmail.com"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:03:14.647	\N	2026-07-22 12:03:14.647
cmrw1b4t1000401s61yusrvpg	LOGGED IN (Credentials)	USER	cmrw19y5t000201s6tl660ld1	\N	\N	cmrw19y5t000201s6tl660ld1	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:04:09.877	\N	2026-07-22 12:04:09.877
cmrw1cz39000501s6t0dypzv0	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:05:35.781	\N	2026-07-22 12:05:35.781
cmrw1zpx1000601s68etd1dv5	CLOCKED IN (Morning )	ATTENDANCE	att_1784722996946_5af60bt	\N	{"note": "Morning ", "userId": "cmrmq5v3k000901s6lnumwy2c"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:23:16.981	\N	2026-07-22 12:23:16.981
cmrw2019u000701s6dcg2fgay	CLOCKED OUT	ATTENDANCE	att_1784722996946_5af60bt	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:23:31.698	\N	2026-07-22 12:23:31.698
cmrwhxgyd000001s6sh9aw2or	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 19:49:25.909	\N	2026-07-22 19:49:25.909
cmrwi382j000008lnax67spo7	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 19:53:54.331	\N	2026-07-22 19:53:54.331
cmrwiauvz000101s6hyh5cc19	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 19:59:50.495	\N	2026-07-22 19:59:50.495
cmrwibnj70000cglnrrh568xb	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 20:00:27.619	\N	2026-07-22 20:00:27.619
cmrwinfr4000201s6twx5qqr4	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 20:09:37.408	\N	2026-07-22 20:09:37.408
cmrwkizzz0001cglnqkwe4wbp	UPDATE	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"name": "Admin", "email": "shop@gmail.com", "phone": null, "roleId": "cmrmq5v1p000401s6y72lcc3w", "salary": null, "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784754057/inventory/avatars/bmd71tplnyjx2fuy3pap.webp", "jobTitle": null, "department": null, "hourlyRate": null, "specialization": null}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 21:02:09.599	\N	2026-07-22 21:02:09.599
cmrwle64j000301s66pk7n6uq	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 21:26:23.89	\N	2026-07-22 21:26:23.89
cmrwn4gh50002cgln8ks2a8vv	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 22:14:49.961	\N	2026-07-22 22:14:49.961
cmrwnfh12000001s6c6qwl2u9	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:23:23.894	\N	2026-07-22 22:23:23.894
cmrwnhxo0000101s6b2eay05c	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:25:18.768	\N	2026-07-22 22:25:18.768
cmrwnhxp4000201s6zjjv6pjq	ISSUED GLOBAL BROADCAST: "🚀 SYSTEM UPGRADE COMPLETE: Experience t..."	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:25:18.808	\N	2026-07-22 22:25:18.808
cmrwnuhsg000301s6x1655ehs	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:35:04.72	\N	2026-07-22 22:35:04.72
cmrwnuht6000401s667clqhg7	ISSUED GLOBAL BROADCAST: "Real-time inventory is currently engaged..."	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:35:04.746	\N	2026-07-22 22:35:04.746
cmrwnuj3z000501s6l23q7e4b	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:35:06.431	\N	2026-07-22 22:35:06.431
cmrwnuj4o000601s6xoe4m910	ISSUED GLOBAL BROADCAST: "Real-time inventory is currently engaged..."	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-22 22:35:06.456	\N	2026-07-22 22:35:06.456
cmrwojro60003cglnhlijgjyr	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 22:54:43.926	\N	2026-07-22 22:54:43.926
cmrwp6fd50004cglnu3myzopi	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 23:12:21.065	\N	2026-07-22 23:12:21.065
cmrwqb28u000468ln2sx8n2fa	Created Sale: INV-1784763834570-140 (Le 3,500)	SALE	cmrwqb0fa000068ln9uuoomtn	\N	{"totalAmount": 3500, "invoiceNumber": "INV-1784763834570-140"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 23:43:56.958	\N	2026-07-22 23:43:56.958
cmrwqoupb000001s610303pyw	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 23:54:40.388	\N	2026-07-22 23:54:40.388
cmrwqce11000968lnvbfnjadd	Created Sale: INV-1784763896517-224 (Le 3,500)	SALE	cmrwqcc7e000568lnqna1umh5	\N	{"totalAmount": 3500, "invoiceNumber": "INV-1784763896517-224"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-22 23:44:58.885	\N	2026-07-22 23:44:58.885
cmrwrn85200012wlndstzxraz	Created Supplier: Protech	SUPPLIER	cmrwrn7yb00002wln0qr31tlu	\N	{"id": "cmrwrn7yb00002wln0qr31tlu", "name": "Protech", "email": "strangesteven001@gmail.com", "notes": "Tech", "phone": "+23230798318", "taxId": "", "address": "25C old railway line Tengbeh Town", "contact": "Ishmael Steven Moseray", "createdAt": "2026-07-23T00:21:23.843Z", "deletedAt": null, "updatedAt": "2026-07-23T00:21:23.843Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "paymentTerms": "Net 30"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 00:21:24.086	\N	2026-07-23 00:21:24.086
cmrwt5kwz000101s620qja3kv	CREATE	PRODUCT	cmrwt5kvz000001s6oupurq0n	\N	{"id": "cmrwt5kvz000001s6oupurq0n", "sku": "", "name": "hp laptop 15-dy2xxx", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784768497/inventory/products/qpy4hq2gjvgtgxdwtmlg.webp", "metadata": {"packagingUnits": []}, "costPrice": "10000", "createdAt": "2026-07-23T01:03:40.031Z", "deletedAt": null, "unitPrice": "18000", "updatedAt": "2026-07-23T01:03:40.031Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": true, "description": "", "maxStockLevel": 150, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:03:40.067	\N	2026-07-23 01:03:40.067
cmrwtjy09000201s64bnfo3sv	UPDATE_AVATAR	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784769287/inventory/avatars/b4rzpkjgyogj6rmrekqs.webp"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:14:50.217	\N	2026-07-23 01:14:50.217
cmrwtq8na000401s6iq6qc5li	Created Category: AC	CATEGORY	cmrwtq8mt000301s65eumz4em	\N	{"id": "cmrwtq8mt000301s65eumz4em", "name": "AC", "createdAt": "2026-07-23T01:19:43.925Z", "deletedAt": null, "updatedAt": "2026-07-23T01:19:43.925Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": ""}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:19:43.942	\N	2026-07-23 01:19:43.942
cmrwtqiy2000501s6afguqxts	Deleted Category: AC	CATEGORY	cmrwtq8mt000301s65eumz4em	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:19:57.29	\N	2026-07-23 01:19:57.29
cmrwtuhcf000701s6tapxlr3i	Created Category: Desktop Computer	CATEGORY	cmrwtuhc5000601s6e93t39qe	\N	{"id": "cmrwtuhc5000601s6e93t39qe", "name": "Desktop Computer", "createdAt": "2026-07-23T01:23:01.829Z", "deletedAt": null, "updatedAt": "2026-07-23T01:23:01.829Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "High-performance desktop PC for office and home use."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:23:01.839	\N	2026-07-23 01:23:01.839
cmrwtw5vb000901s6hk9h4buj	CREATE	PRODUCT	cmrwtw5us000801s6q1dlfweq	\N	{"id": "cmrwtw5us000801s6q1dlfweq", "sku": "", "name": "Desktop Computer", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784769794/inventory/products/xxweyhrtmd3a7e1etemp.webp", "metadata": {"packagingUnits": []}, "costPrice": "15000", "createdAt": "2026-07-23T01:24:20.260Z", "deletedAt": null, "unitPrice": "20000", "updatedAt": "2026-07-23T01:24:20.260Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrwtuhc5000601s6e93t39qe", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "150", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:24:20.279	\N	2026-07-23 01:24:20.279
cmrx9jrk8000001s6jteg76t5	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 08:42:35.72	\N	2026-07-23 08:42:35.72
cmrxdgcui000001s6xd2djcsq	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 10:31:55.146	\N	2026-07-23 10:31:55.146
cmrxdxln7000301s68b0vsa0t	Created Customer: Foday Sesay	CUSTOMER	cmrxdxlmp000201s6szuafcej	\N	{"id": "cmrxdxlmp000201s6szuafcej", "name": "Foday Sesay", "email": "", "phone": "", "address": "25C old railway line Tengbeh Town", "createdAt": "2026-07-23T10:45:19.681Z", "deletedAt": null, "updatedAt": "2026-07-23T10:45:19.681Z", "businessId": "cmrmq5v0e000301s68rl1kxrs"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 10:45:19.699	\N	2026-07-23 10:45:19.699
cmrxe2thc000c01s6jrm2zmqf	Created Sale: INV-1784803762966-862 (Le 24,500)	SALE	cmrxe2tdb000401s6tr1slkog	\N	{"totalAmount": 24500, "invoiceNumber": "INV-1784803762966-862"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 10:49:23.136	\N	2026-07-23 10:49:23.136
cmrxxhdcp0001t8lnfrt5jxb4	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 19:52:34.777	\N	2026-07-23 19:52:34.777
cmrxxjtb50002t8lnl58t2byf	DELETED BUSINESS NODE: Protech Hospital Demo	BUSINESS	cmrkr19lo000l01s6f43wjiup	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 19:54:28.769	\N	2026-07-23 19:54:28.769
cmrxydl6r0003t8lndkgjmvno	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 20:17:37.923	\N	2026-07-23 20:17:37.923
cmrxywagf0004t8lnoy5srx98	DELETED BUSINESS NODE: Supermarket Demo 	BUSINESS	cmrl2ek7c000001s6q6fiwxkh	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 20:32:10.479	\N	2026-07-23 20:32:10.479
cmrxz3i330005t8lno6ox8j95	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 20:37:46.959	\N	2026-07-23 20:37:46.959
cmry0d5oq000001s6mc25fysy	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-23 21:13:17.066	\N	2026-07-23 21:13:17.066
cmry0gmyb000101s6ppaj8ds6	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 21:15:59.411	\N	2026-07-23 21:15:59.411
cmry0i5c3000201s68dh378qt	DELETED BUSINESS NODE: ProTech Test Enterprise	BUSINESS	cmry0bt3q0000n0lnxuo32270	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-23 21:17:09.891	\N	2026-07-23 21:17:09.891
cmryqjrxm000001s6uzsm0t6l	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 09:26:15.85	\N	2026-07-24 09:26:15.85
cmryqlya2000501s6zqmbo7gx	Created Sale: INV-1784885277017-564 (Le 4,000)	SALE	cmryqly2c000101s6r4z5ct4q	\N	{"totalAmount": 4000, "invoiceNumber": "INV-1784885277017-564"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 09:27:57.386	\N	2026-07-24 09:27:57.386
cmryqob29000a01s6oqkup7sq	Created Sale: INV-1784885387195-143 (Le 25,000)	SALE	cmryqob0f000601s6ntduyz51	\N	{"totalAmount": 25000, "invoiceNumber": "INV-1784885387195-143"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 09:29:47.265	\N	2026-07-24 09:29:47.265
cmryr62o0000b01s61cpvsved	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 09:43:36.192	\N	2026-07-24 09:43:36.192
cmryu4nuu0000zklnx4ltdo8q	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 11:06:29.19	\N	2026-07-24 11:06:29.19
cmryw8qhw000001s67127tv4m	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:05:38.468	\N	2026-07-24 12:05:38.468
cmrywmyqy000601s65dlsrtyh	Created Sale: INV-1784895402123-743 (Le 9,999)	SALE	cmrywmylo000001s6eu82kppv	\N	{"totalAmount": 9999, "invoiceNumber": "INV-1784895402123-743"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:16:42.346	\N	2026-07-24 12:16:42.346
cmrywq1ur000701s6bw9r7hxu	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:19:06.339	\N	2026-07-24 12:19:06.339
cmryxp1nw000801s6ku9ihmpc	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:46:19.052	\N	2026-07-24 12:46:19.052
cmryxuvhe000a01s6tw5rtjqs	UPDATE	PRODUCT	cmrmqk58o000d01s6fzatd6n0	\N	{"id": "cmrmqk58o000d01s6fzatd6n0", "sku": "", "name": "Hikvision 2MP IP Camera", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784159420/inventory/products/c4kivdc2a5idyd1lbhev.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "", "sellingPrice": "", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "2800", "createdAt": "2026-07-15T23:53:18.984Z", "deletedAt": null, "unitPrice": "3500", "updatedAt": "2026-07-24T12:50:50.947Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmqe93w000b01s6m0zbxhqt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "60", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:50:50.978	\N	2026-07-24 12:50:50.978
cmryy054h000b01s6xyiwiz4c	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:54:56.753	\N	2026-07-24 12:54:56.753
cmryy53ql000c01s6dz7nzz7q	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 12:58:48.237	\N	2026-07-24 12:58:48.237
cmryyo3nx000d01s6j0cbdvl5	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-07-24 13:13:34.605	\N	2026-07-24 13:13:34.605
cmrz3djwr000001s6d3gk8t4n	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 15:25:20.523	\N	2026-07-24 15:25:20.523
cmrz4b4x3000101s6vz84aj07	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 15:51:27.399	\N	2026-07-24 15:51:27.399
cmrz6rjun000001s6gwev6sjo	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 17:00:12.479	\N	2026-07-24 17:00:12.479
cmrz6y7ak000101s6gkau0fnb	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 17:05:22.796	\N	2026-07-24 17:05:22.796
cmrz8st3s000001s61t0noylq	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 17:57:10.36	\N	2026-07-24 17:57:10.36
cmrz8ynau000501s6n8cfuswa	Created Sale: INV-1784916102621-356 (Le 7,000)	SALE	cmrz8yn7b000101s694zyul6h	\N	{"totalAmount": 7000, "invoiceNumber": "INV-1784916102621-356"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 18:01:42.774	\N	2026-07-24 18:01:42.774
cmrz950ye000601s6c5doeoyf	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:06:40.406	\N	2026-07-24 18:06:40.406
cmrz955fb000701s68awnh80d	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:06:46.199	\N	2026-07-24 18:06:46.199
cmrz990iq000801s6ne4p9bxu	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 18:09:46.466	\N	2026-07-24 18:09:46.466
cmrz99qfw000901s6vzj7zpwm	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:10:20.06	\N	2026-07-24 18:10:20.06
cmrz9vkwz000b01s65xbpx7lv	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-24 18:27:19.331	\N	2026-07-24 18:27:19.331
cmrz9y19g000c01s6dpyithyx	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:29:13.828	\N	2026-07-24 18:29:13.828
cmrza5sug000e01s6441wowix	CREATED NEW SUPER ADMIN: abdulbineh@gmail.com	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:35:16.168	\N	2026-07-24 18:35:16.168
cmrzaeukm000f01s6k2mrv32i	LOGGED IN (Credentials)	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrza5stq000d01s6mtfyhx70	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:42:18.31	\N	2026-07-24 18:42:18.31
cmrzmhgmi000001s6ud6cbsfy	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-25 00:20:15.594	\N	2026-07-25 00:20:15.594
cmrzmimod000101s6efidtcqz	UPDATED SYSTEM VARIABLES: announcementBanner, announcementBannerUpdatedAt	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-25 00:21:10.093	\N	2026-07-25 00:21:10.093
cmrzmimpx000201s6j2xra4qu	ISSUED GLOBAL BROADCAST: "🎁 Refer a Business, Get 1 Month FREE! I..."	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-25 00:21:10.149	\N	2026-07-25 00:21:10.149
cmrzmjul2000301s6caxerxln	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 00:22:06.999	\N	2026-07-25 00:22:06.999
cmrzmr9bd000801s6ewsd24pi	Created Sale: INV-1784939272542-517 (Le 199,500)	SALE	cmrzmr987000401s6z17x93xd	\N	{"totalAmount": 199500, "invoiceNumber": "INV-1784939272542-517"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 00:27:52.681	\N	2026-07-25 00:27:52.681
cmrzmshxg000d01s6vopw97qx	Created Sale: INV-1784939330425-598 (Le 3,500)	SALE	cmrzmshvh000901s6ln1u6jmg	\N	{"totalAmount": 3500, "invoiceNumber": "INV-1784939330425-598"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 00:28:50.5	\N	2026-07-25 00:28:50.5
cms06r65o000044lnlbwblw0f	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 09:47:40.908	\N	2026-07-25 09:47:40.908
cms07q9zl000001s6d4rl51hb	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:14:58.833	\N	2026-07-25 10:14:58.833
cms0844yg000001s60ysctye5	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:25:45.496	\N	2026-07-25 10:25:45.496
cms08ajl3000101s6pu4k1o7s	Updated Category: Electronics	CATEGORY	cmrmrpczo001e01s6l6pnyec1	\N	{"id": "cmrmrpczo001e01s6l6pnyec1", "name": "Electronics", "createdAt": "2026-07-16T00:25:21.924Z", "deletedAt": null, "updatedAt": "2026-07-25T10:30:44.361Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "description": "Electronic devices, accessories, and gadgets used by consumers and businesses."}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:30:44.391	\N	2026-07-25 10:30:44.391
cms08cpex000201s6ptrsh4gg	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:32:25.257	\N	2026-07-25 10:32:25.257
cms08hjjz000401s6ain8dtgw	CREATE	PRODUCT	cms08hjg7000301s6n8j1gozw	\N	{"id": "cms08hjg7000301s6n8j1gozw", "sku": "", "name": "Lenovo Tablet", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784975646/inventory/products/idjwepwv4ugi1gk6xm6l.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-07-25T10:36:10.807Z", "deletedAt": null, "unitPrice": "6998", "updatedAt": "2026-07-25T10:36:10.807Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:36:10.943	\N	2026-07-25 10:36:10.943
cms08l2py000601s6l1846zbi	CREATE	PRODUCT	cms08l2p8000501s6rf6bk7gk	\N	{"id": "cms08l2p8000501s6rf6bk7gk", "sku": "", "name": "Galaxy Tab S11", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784975868/inventory/products/nu4xyzoksmnnk2v8o6wx.webp", "metadata": {"packagingUnits": []}, "costPrice": "7000", "createdAt": "2026-07-25T10:38:55.725Z", "deletedAt": null, "unitPrice": "10000", "updatedAt": "2026-07-25T10:38:55.725Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:38:55.75	\N	2026-07-25 10:38:55.75
cms08n36o000801s6dabgxzh5	CREATE	PRODUCT	cms08n360000701s6mqjp312s	\N	{"id": "cms08n360000701s6mqjp312s", "sku": "", "name": "Tablet TCL", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784975976/inventory/products/zb38ypufxvk6ek8ieice.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-07-25T10:40:29.640Z", "deletedAt": null, "unitPrice": "7499", "updatedAt": "2026-07-25T10:40:29.640Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:40:29.664	\N	2026-07-25 10:40:29.664
cms08sh5l000a01s6x6aww4nv	CREATE	PRODUCT	cms08sh4u000901s6z990hr8r	\N	{"id": "cms08sh4u000901s6z990hr8r", "sku": "", "name": "Samsung 43-inch FHD Smart TV", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784976191/inventory/products/whq4hn0oorx4pcid76ag.webp", "metadata": {"packagingUnits": []}, "costPrice": "6000", "createdAt": "2026-07-25T10:44:41.022Z", "deletedAt": null, "unitPrice": "10000", "updatedAt": "2026-07-25T10:44:41.022Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": null, "isFavorite": false, "description": "", "maxStockLevel": 98, "minStockLevel": 10, "stockQuantity": "30", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:44:41.049	\N	2026-07-25 10:44:41.049
cms08vv5c000c01s6v0skedel	CREATE	PRODUCT	cms08vv4n000b01s601d5tzua	\N	{"id": "cms08vv4n000b01s601d5tzua", "sku": "", "name": "Smart Watches", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784976399/inventory/products/v4nocvnqo09iwc98ksfb.webp", "metadata": {"packagingUnits": []}, "costPrice": "500", "createdAt": "2026-07-25T10:47:19.127Z", "deletedAt": null, "unitPrice": "998", "updatedAt": "2026-07-25T10:47:19.127Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:47:19.152	\N	2026-07-25 10:47:19.152
cms08xyng000e01s62xil5cvt	CREATE	PRODUCT	cms08xymo000d01s6lcchaqfp	\N	{"id": "cms08xymo000d01s6lcchaqfp", "sku": "", "name": "Power Banks", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784976500/inventory/products/qe3dmuqdgwt2ctlrxbb7.webp", "metadata": {"packagingUnits": []}, "costPrice": "500", "createdAt": "2026-07-25T10:48:56.976Z", "deletedAt": null, "unitPrice": "798", "updatedAt": "2026-07-25T10:48:56.976Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:48:57.004	\N	2026-07-25 10:48:57.004
cms08ylu7000f01s6rvufj64j	UPDATE	PRODUCT	cms08xymo000d01s6lcchaqfp	\N	{"id": "cms08xymo000d01s6lcchaqfp", "sku": "", "name": "Power Banks", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784976500/inventory/products/qe3dmuqdgwt2ctlrxbb7.webp", "metadata": {"packagingUnits": []}, "costPrice": "500", "createdAt": "2026-07-25T10:48:56.976Z", "deletedAt": null, "unitPrice": "800", "updatedAt": "2026-07-25T10:49:27.027Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:49:27.055	\N	2026-07-25 10:49:27.055
cms9aa3l2000901s6mff9vulf	CREATE_USER	USER	cms9aa3k9000801s6phw014ay	\N	{"name": "Dr Moseray ", "email": "moseray@gmail.com"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:36:18.47	\N	2026-07-31 18:36:18.47
cms9aayi7000a01s6x6nrhda4	LOGGED IN (Credentials)	USER	cms9aa3k9000801s6phw014ay	\N	\N	cms9aa3k9000801s6phw014ay	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:36:58.543	\N	2026-07-31 18:36:58.543
cms9au0sx0000tcln7633qyi7	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:51:47.985	\N	2026-07-31 18:51:47.985
cms9b0bfp000001s6pdtpr2xn	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:56:41.701	\N	2026-07-31 18:56:41.701
cms08z4ci000g01s6768egpn0	UPDATE	PRODUCT	cms08hjg7000301s6n8j1gozw	\N	{"id": "cms08hjg7000301s6n8j1gozw", "sku": "", "name": "Lenovo Tablet", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784975646/inventory/products/idjwepwv4ugi1gk6xm6l.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-07-25T10:36:10.807Z", "deletedAt": null, "unitPrice": "7000", "updatedAt": "2026-07-25T10:49:51.016Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:49:51.042	\N	2026-07-25 10:49:51.042
cms08zzc9000h01s6a407r0ie	UPDATE	PRODUCT	cmrmr84ux000x01s65ogzv6cr	\N	{"id": "cmrmr84ux000x01s65ogzv6cr", "sku": "", "name": "Smart Door Sensor", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784160692/inventory/products/wd1qnl2vyhviqm2zqgcu.webp", "metadata": {"packagingUnits": []}, "costPrice": "4500", "createdAt": "2026-07-16T00:11:58.233Z", "deletedAt": null, "unitPrice": "6000", "updatedAt": "2026-07-25T10:50:31.184Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmr3j3h000t01s6iyr5gjk6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "42", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:50:31.209	\N	2026-07-25 10:50:31.209
cms090k90000i01s6tgt36yy9	UPDATE	PRODUCT	cms08vv4n000b01s601d5tzua	\N	{"id": "cms08vv4n000b01s601d5tzua", "sku": "", "name": "Smart Watches", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1784976399/inventory/products/v4nocvnqo09iwc98ksfb.webp", "metadata": {"packagingUnits": []}, "costPrice": "500", "createdAt": "2026-07-25T10:47:19.127Z", "deletedAt": null, "unitPrice": "1000", "updatedAt": "2026-07-25T10:50:58.282Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:50:58.308	\N	2026-07-25 10:50:58.308
cms09496p000j01s6br9w6aqg	UPDATE_AVATAR	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"imageUrl": "https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=e2e8f0"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:53:50.593	\N	2026-07-25 10:53:50.593
cms094quf000k01s6wflmzrxi	UPDATE_AVATAR	USER	cmrmq5v3k000901s6lnumwy2c	\N	{"imageUrl": "https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=e2e8f0"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 10:54:13.479	\N	2026-07-25 10:54:13.479
cms09i1ky000t01s6d5wvrie2	Created Sale: INV-1784977473735-184 (Le 9,800)	SALE	cms09i1fz000l01s6og0906j1	\N	{"totalAmount": 9800, "invoiceNumber": "INV-1784977473735-184"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 11:04:33.922	\N	2026-07-25 11:04:33.922
cms0bxup5000001s6gawdulb1	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 12:12:50.729	\N	2026-07-25 12:12:50.729
cms0co4wp000701s6q74gn4pe	Created Sale: INV-1784982796815-826 (Le 10,800)	SALE	cms0co4s1000101s6a79j72q4	\N	{"totalAmount": 10800, "invoiceNumber": "INV-1784982796815-826"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 12:33:17.017	\N	2026-07-25 12:33:17.017
cms0jfwzn000001s623o0jiyk	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:42:50.819	\N	2026-07-25 15:42:50.819
cms0jqurl000101s6xpvaaztu	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:51:21.153	\N	2026-07-25 15:51:21.153
cms0k2e36000601s6vra5gs8k	Created Sale: INV-1784995219276-23 (Le 17,500)	SALE	cms0k2e0a000201s6l307v52h	\N	{"totalAmount": 17500, "invoiceNumber": "INV-1784995219276-23"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:00:19.41	\N	2026-07-25 16:00:19.41
cms0o36iw000k01s6z1zvta50	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 17:52:54.728	\N	2026-07-25 17:52:54.728
cms0oaf7c000o01s6gj0ovmp5	Created Purchase: PO-2026-7289 (Le 5,000)	PURCHASE	cms0oaf5j000l01s6frcb82v3	\N	{"totalAmount": 5000, "invoiceNumber": "PO-2026-7289"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 17:58:32.568	\N	2026-07-25 17:58:32.568
cms0od2ig000x01s6tpx5kajo	Created Sale: INV-1785002435982-288 (Le 21,000)	SALE	cms0od2fo000q01s66n22o2g1	\N	{"totalAmount": 21000, "invoiceNumber": "INV-1785002435982-288"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 18:00:36.088	\N	2026-07-25 18:00:36.088
cms0ycfyr000001s6c4zvlem5	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 22:40:03.027	\N	2026-07-25 22:40:03.027
cms0ynhqd000401s6i7lttu29	Created Purchase: PO-2026-715 (Le 2,800)	PURCHASE	cms0ynhoc000101s69eyvfa61	\N	{"totalAmount": 2800, "invoiceNumber": "PO-2026-715"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-25 22:48:38.533	\N	2026-07-25 22:48:38.533
cms10h1d0000001s61fuzmkaz	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-25 23:39:36.612	\N	2026-07-25 23:39:36.612
cms10kzzp000101s657js64ni	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-25 23:42:41.462	\N	2026-07-25 23:42:41.462
cms9ae720000k01s6tu2zqxjo	Created Sale: INV-1785523169447-851 (Le 13,000)	SALE	cms9ae6y7000c01s6dzcrauo0	\N	{"totalAmount": 13000, "invoiceNumber": "INV-1785523169447-851"}	cms9aa3k9000801s6phw014ay	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:39:29.593	\N	2026-07-31 18:39:29.593
cms9c6e06000a01s6szablyp0	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 19:29:24.582	\N	2026-07-31 19:29:24.582
cms9j12q700003clnuunoei38	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 22:41:14	\N	2026-07-31 22:41:14
cms53nwuv000001s69zbnyc8i	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-28 20:20:00.919	\N	2026-07-28 20:20:00.919
cms540c5m000101s6nz643fga	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-28 20:29:40.618	\N	2026-07-28 20:29:40.618
cms54a6e7000601s60ii6ax93	Created Sale: INV-1785271039612-717 (Le 800)	SALE	cms54a6c3000201s6zk4ttarx	\N	{"totalAmount": 800, "invoiceNumber": "INV-1785271039612-717"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-28 20:37:19.711	\N	2026-07-28 20:37:19.711
cms54a885000b01s6bml0juzg	Created Sale: INV-1785271041823-973 (Le 1,000)	SALE	cms54a80z000701s6zxwaa5az	\N	{"totalAmount": 1000, "invoiceNumber": "INV-1785271041823-973"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-28 20:37:22.085	\N	2026-07-28 20:37:22.085
cms580mhb000001s6fxqtsrn3	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-28 22:21:52.463	\N	2026-07-28 22:21:52.463
cms67l9ai000001s6e0ndwor0	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-29 14:57:41.706	\N	2026-07-29 14:57:41.706
cms67p5cn000501s675n7ff6m	Created Sale: INV-1785337243113-418 (Le 12,000)	SALE	cms67p5a8000101s6k4343x42	\N	{"totalAmount": 12000, "invoiceNumber": "INV-1785337243113-418"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-29 15:00:43.223	\N	2026-07-29 15:00:43.223
cms8uu7560000fslnpwyeh6fn	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 11:24:02.346	\N	2026-07-31 11:24:02.346
cms8v6z5u000001s6yiuj1vqh	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 11:33:58.53	\N	2026-07-31 11:33:58.53
cms8va41d000201s6mfmaoeig	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 11:36:24.817	\N	2026-07-31 11:36:24.817
cms8vio2s000001s6vkhlgun9	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 11:43:04.055	\N	2026-07-31 11:43:04.055
cms91f9i0000001s6tkxfsdwi	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 14:28:22.872	\N	2026-07-31 14:28:22.872
cms99kr9q000001s65ko13nvt	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-31 18:16:36.11	\N	2026-07-31 18:16:36.11
cms99nqf3000101s64vn5kupx	RESET PASSWORD FOR USER: steven@gmail.com	USER	cmrw19y5t000201s6tl660ld1	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-31 18:18:54.975	\N	2026-07-31 18:18:54.975
cms99olyf000201s6ddw8cf4h	LOGGED IN (Credentials)	USER	cmrw19y5t000201s6tl660ld1	\N	\N	cmrw19y5t000201s6tl660ld1	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:19:35.847	\N	2026-07-31 18:19:35.847
cms99pu8p000301s6dzorhxof	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:20:33.241	\N	2026-07-31 18:20:33.241
cms99ye4k000401s6my9e3j9s	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-31 18:27:12.26	\N	2026-07-31 18:27:12.26
cms99zmr1000501s6ptj5djro	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-07-31 18:28:10.093	\N	2026-07-31 18:28:10.093
cms9a2h7r000601s68usoh6cj	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:30:22.887	\N	2026-07-31 18:30:22.887
cms9l5v6b000001s6d2qq9uv2	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-07-31 23:40:56.723	\N	2026-07-31 23:40:56.723
cms9mboik000001s6193sai6t	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 00:13:27.644	\N	2026-08-01 00:13:27.644
cms9mista000101s6e2d3cika	DELETE	USER	cmrw19y5t000201s6tl660ld1	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 00:18:59.806	\N	2026-08-01 00:18:59.806
cms9moknl000301s68nw1uhn8	Created Expense: Rent (Le 10,000) - Rent	EXPENSE	cms9mokn4000201s6hehstpt8	\N	{"amount": 10000, "category": "Rent", "description": "Rent"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 00:23:29.169	\N	2026-08-01 00:23:29.169
cms9mrrx1000a01s6hvxvjh5k	Created Sale: INV-1785543958409-590 (Le 25,000)	SALE	cms9mrrtu000401s68qye0m3n	\N	{"totalAmount": 25000, "invoiceNumber": "INV-1785543958409-590"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 00:25:58.549	\N	2026-08-01 00:25:58.549
cms9mxywa000b01s69ennjwog	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 00:30:47.53	\N	2026-08-01 00:30:47.53
cmsaahife000001s6u630lc92	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-01 11:29:50.474	\N	2026-08-01 11:29:50.474
cmsbrcwdj000001s68fjeh4f3	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 12:09:54.919	\N	2026-08-02 12:09:54.919
cmsbrdknc000101s6ckss4gbq	DELETED BUSINESS NODE: Nancy Ent	BUSINESS	cms9bu63k000001s6zrcybon8	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 12:10:26.376	\N	2026-08-02 12:10:26.376
cmsbreesd000201s6f4etzaka	DELETED BUSINESS NODE: Supermarket 	BUSINESS	cmry0mrdk000301s6mgxh39aa	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 12:11:05.437	\N	2026-08-02 12:11:05.437
cmsbz9538000001s6epzxw7ua	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:50:56.516	\N	2026-08-02 15:50:56.516
cmsbz9s8u000101s6ndiu8oz0	DELETED BUSINESS NODE: Boutique Demo 	BUSINESS	cmrt5id0p000201s6u4ux3ex1	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:51:26.526	\N	2026-08-02 15:51:26.526
cmsbzaf4n000201s6zt7nrkmn	DELETED BUSINESS NODE: PROTECH INTERNATIONAL DEMO	BUSINESS	cmrm9ch4d000501s6hex8btg0	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:51:56.184	\N	2026-08-02 15:51:56.184
cmsbzapkb000301s68v9xrqa9	DELETED BUSINESS NODE: PROTECH SHOP DEMO	BUSINESS	cmrm4vb17000901s6xrcdoliy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:52:09.707	\N	2026-08-02 15:52:09.707
cmsbzbbgl000401s62u27od4h	DELETED BUSINESS NODE: PROTECH ASSIST (SL) LIMITED	BUSINESS	cmrkhbmst000001s696ifoy9y	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:52:38.085	\N	2026-08-02 15:52:38.085
cmsbzfto7000501s65qqwf8v2	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 15:56:08.311	\N	2026-08-02 15:56:08.311
cmsbzu8z5000f01s6c4qe4iid	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-02 16:07:21.329	\N	2026-08-02 16:07:21.329
cmsc0zoik000001s66t8xuf73	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-02 16:39:34.365	\N	2026-08-02 16:39:34.365
cmsc1omcj000001s6ixfpncwv	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 16:58:57.956	\N	2026-08-02 16:58:57.956
cmsc1riyk000501s6hb7hmlac	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-02 17:01:13.532	\N	2026-08-02 17:01:13.532
cmsc1x0nv000201s6jfx3gjnn	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 17:05:29.755	\N	2026-08-02 17:05:29.755
cmsc1yx8x000301s6zsli4k6y	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-02 17:06:58.641	\N	2026-08-02 17:06:58.641
cmsd4nm9u000001s62h2upuj6	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:09:56.226	\N	2026-08-03 11:09:56.226
cmsd4yf6j000101s6vmpvpl6t	UPDATED SYSTEM VARIABLES: announcementBanner	SYSTEM	\N	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:18:20.251	\N	2026-08-03 11:18:20.251
cmsd50atu000201s61b9a0500	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 11:19:47.922	\N	2026-08-03 11:19:47.922
cmsd55kqh000301s65osftvsp	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:23:54.041	\N	2026-08-03 11:23:54.041
cmsd5fh2q000501s67w48lh46	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:35.858	\N	2026-08-03 11:31:35.858
cmsd5fi3y000601s6aksjx0br	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:37.198	\N	2026-08-03 11:31:37.198
cmsd5fj1n000701s6qd6t3ln6	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:38.412	\N	2026-08-03 11:31:38.412
cmsd5fjmk000801s66kmyf1gf	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:39.165	\N	2026-08-03 11:31:39.165
cmsd5fksy000901s65elleal5	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:40.69	\N	2026-08-03 11:31:40.69
cmsd5flby000a01s62ob103mv	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:41.374	\N	2026-08-03 11:31:41.374
cmsd5fmd5000b01s6q2eto8dd	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:42.713	\N	2026-08-03 11:31:42.713
cmsd5fnmw000c01s6byxlrj2w	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:44.36	\N	2026-08-03 11:31:44.36
cmsd5fp3j000d01s6hln3fh1q	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:46.255	\N	2026-08-03 11:31:46.255
cmsd5fpho000e01s68lzyrvvy	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:46.765	\N	2026-08-03 11:31:46.765
cmsd5fpv9000f01s6kqbs6cjp	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:47.253	\N	2026-08-03 11:31:47.253
cmsd5fq9i000g01s6n9yylnbn	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:47.766	\N	2026-08-03 11:31:47.766
cmsd5fqn9000h01s6jl0nq4br	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:48.261	\N	2026-08-03 11:31:48.261
cmsd5fr3b000i01s64z7c59p0	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:48.839	\N	2026-08-03 11:31:48.839
cmsd5g2e4000k01s67tr3tdte	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:03.484	\N	2026-08-03 11:32:03.484
cmsd5g30s000l01s6ciqljw13	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:04.3	\N	2026-08-03 11:32:04.3
cmsd5g6hc000r01s6n9pq7kyp	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:08.784	\N	2026-08-03 11:32:08.784
cmsd5gcxp000y01s6km53i9ge	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:17.149	\N	2026-08-03 11:32:17.149
cmsd5gd8u000z01s6sslyw1wg	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:17.55	\N	2026-08-03 11:32:17.55
cmsd5gdn3001001s6vdh6rdkk	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:18.063	\N	2026-08-03 11:32:18.063
cmsd5gdxz001101s6gqx2h1lq	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:18.455	\N	2026-08-03 11:32:18.455
cmsd5ge9j001201s6tlh9l130	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:18.871	\N	2026-08-03 11:32:18.871
cmsd5gel9001301s6xgcrqqa8	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:19.293	\N	2026-08-03 11:32:19.293
cmsd5k2yo001401s6wehv6hv9	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 11:35:10.848	\N	2026-08-03 11:35:10.848
cmsd5k6zu001501s6ld600cut	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 11:35:16.074	\N	2026-08-03 11:35:16.074
cmsd5fri0000j01s6y7w5crr2	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:31:49.368	\N	2026-08-03 11:31:49.368
cmsd5g3uh000m01s61lq5n62q	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:05.369	\N	2026-08-03 11:32:05.369
cmsd5g53t000n01s6fqp2ujq7	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:07.001	\N	2026-08-03 11:32:07.001
cmsd5g5er000o01s64nyzud2g	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:07.395	\N	2026-08-03 11:32:07.395
cmsd5g5r9000p01s6n3f08ucz	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:07.845	\N	2026-08-03 11:32:07.845
cmsd5g64l000q01s62gc2rs0n	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:08.325	\N	2026-08-03 11:32:08.325
cmsd5g6un000s01s69pnpvmnd	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:09.263	\N	2026-08-03 11:32:09.263
cmsd5g79g000t01s6ec44priz	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:09.796	\N	2026-08-03 11:32:09.796
cmsd5g7nm000u01s6n5j9e4d6	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:10.306	\N	2026-08-03 11:32:10.306
cmsd5gauv000v01s6hpjy93o6	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:14.455	\N	2026-08-03 11:32:14.455
cmsd5gcau000w01s62th1383e	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:16.326	\N	2026-08-03 11:32:16.326
cmsd5gcl3000x01s6zxvif5eq	UPDATED SYSTEM VARIABLES: defaultTrialDays	SYSTEM	\N	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-03 11:32:16.695	\N	2026-08-03 11:32:16.695
cmsd9bctf000001s6rrwad6nv	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-03 13:20:22.179	\N	2026-08-03 13:20:22.179
cmsd9iezx000901s656r5d3e1	LOGGED IN (Credentials)	USER	cmsd9hiri000701s6dc8942e0	\N	\N	cmsd9hiri000701s6dc8942e0	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:51.597	\N	2026-08-03 13:25:51.597
cmsd9tsvw000a01s6lujxo1q5	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-03 13:34:42.812	\N	2026-08-03 13:34:42.812
cmsd9zucs000c01s6x9dvzjyq	APPROVED BUSINESS NODE: Protech Assist SL (Plan: ENTERPRISE) (Expires: 2027-08-03T13:39:23.978Z)	BUSINESS	cmsd9himw000101s6z1fvs8fl	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-03 13:39:24.652	\N	2026-08-03 13:39:24.652
cmsda0z53000d01s66huyjivd	LOGGED IN (Credentials)	USER	cmsd9hiri000701s6dc8942e0	\N	\N	cmsd9hiri000701s6dc8942e0	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:40:17.511	\N	2026-08-03 13:40:17.511
cmsda4ufq000g01s6lq29vwaf	CREATE_USER	USER	cmsda4ufa000f01s6k3ak46m9	\N	{"name": "Ishmael S. Moseray", "email": "strangesteven01@gmail.com"}	cmsd9hiri000701s6dc8942e0	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:43:18.038	\N	2026-08-03 13:43:18.038
cmsda7b0v000h01s6c3w1j5ol	LOGGED IN (Credentials)	USER	cmsda4ufa000f01s6k3ak46m9	\N	\N	cmsda4ufa000f01s6k3ak46m9	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:45:12.847	\N	2026-08-03 13:45:12.847
cmsda8dfj000i01s6tsuoep0y	CLOCKED IN (Morning )	ATTENDANCE	att_1785764762602_q9jjelj	\N	{"note": "Morning ", "userId": "cmsda4ufa000f01s6k3ak46m9"}	cmsda4ufa000f01s6k3ak46m9	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:46:02.623	\N	2026-08-03 13:46:02.623
cmsdajq8f000l01s69jt8bq1f	CREATE_USER	USER	cmsdajq7x000k01s6wf9x5e1s	\N	{"name": "Julian Edwin Felix smith", "email": "juel.love1@gmailcom"}	cmsd9hiri000701s6dc8942e0	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:54:52.431	\N	2026-08-03 13:54:52.431
cmsdatzcp000n01s653bq53i8	CREATE_USER	USER	cmsdatzcb000m01s67uoi7tic	\N	{"name": "Abdul bineh kalokoh", "email": "abdulbinehkalokoh@gmail.com"}	cmsd9hiri000701s6dc8942e0	cmsd9himw000101s6z1fvs8fl	2026-08-03 14:02:50.809	\N	2026-08-03 14:02:50.809
cmsdqdi55000001s6xzjl7j3q	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 21:17:55.866	\N	2026-08-03 21:17:55.866
cmsdsvec1000001s68rn3rpv8	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 22:27:49.969	\N	2026-08-03 22:27:49.969
cmsdt7sgl0000j4lnmx7jzskb	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-03 22:37:28.15	\N	2026-08-03 22:37:28.15
cmsehygcm0000f0lnc8wngsj0	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 10:10:02.95	\N	2026-08-04 10:10:02.95
cmsej2q2f000001s6x25gphs4	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 10:41:21.783	\N	2026-08-04 10:41:21.783
cmselnyoc000001s6fcopn4ig	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 11:53:51.948	\N	2026-08-04 11:53:51.948
cmsem2xqj0000h8lnd8qctrqi	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 12:05:30.578	\N	2026-08-04 12:05:30.578
cmsemo8f7000401s6v3es4o8m	Created Sale: INV-1785846124029-364 (Le 1,000)	SALE	cmsemo8bd000001s60c26vp53	\N	{"totalAmount": 1000, "invoiceNumber": "INV-1785846124029-364"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 12:22:04.195	\N	2026-08-04 12:22:04.195
cmsew4yv0000001s6zlft11jc	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 16:47:01.5	\N	2026-08-04 16:47:01.5
cmsewf1ig000101s6ifufauq2	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 16:54:51.496	\N	2026-08-04 16:54:51.496
cmsewl1vr000601s63a7xuoo7	Created Sale: INV-1785862771763-544 (Le 4,000)	SALE	cmsewl1sc000201s6964cokus	\N	{"totalAmount": 4000, "invoiceNumber": "INV-1785862771763-544"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-04 16:59:31.911	\N	2026-08-04 16:59:31.911
cmsg19nz1000001s678sq6kaa	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 11:58:24.925	\N	2026-08-05 11:58:24.925
cmsg1dh3f000101s62y7k8fs4	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 12:01:22.635	\N	2026-08-05 12:01:22.635
cmsg1hemh000201s6dasmbpcd	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:04:26.057	\N	2026-08-05 12:04:26.057
cmsg1l6ds000301s6t60pp5lr	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:07:22	\N	2026-08-05 12:07:22
cmsg20m64000401s6mrpkqe5a	RESET PASSWORD FOR USER: abdulbinehkalokoh@gmail.com	USER	cmsdatzcb000m01s67uoi7tic	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:19:22.3	\N	2026-08-05 12:19:22.3
cmsg216pz000501s6ndxt7uao	LOGGED IN (Credentials)	USER	cmsdatzcb000m01s67uoi7tic	\N	\N	cmsdatzcb000m01s67uoi7tic	cmsd9himw000101s6z1fvs8fl	2026-08-05 12:19:48.935	\N	2026-08-05 12:19:48.935
cmsg25f8a000601s6nqo8m2xl	LOGGED IN (Credentials)	USER	cmsdatzcb000m01s67uoi7tic	\N	\N	cmsdatzcb000m01s67uoi7tic	cmsd9himw000101s6z1fvs8fl	2026-08-05 12:23:06.586	\N	2026-08-05 12:23:06.586
cmsg25kjk000701s6j6chj9fl	TOGGLED STATUS FOR USER: juel.love1@gmailcom TO INACTIVE	USER	cmsdajq7x000k01s6wf9x5e1s	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:23:13.472	\N	2026-08-05 12:23:13.472
cmsg25pn2000801s6rdu2arsj	TOGGLED STATUS FOR USER: juel.love1@gmailcom TO ACTIVE	USER	cmsdajq7x000k01s6wf9x5e1s	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:23:20.078	\N	2026-08-05 12:23:20.078
cmsg25sfc000901s62ycvkhy7	TOGGLED STATUS FOR USER: juel.love1@gmailcom TO INACTIVE	USER	cmsdajq7x000k01s6wf9x5e1s	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:23:23.688	\N	2026-08-05 12:23:23.688
cmsg2ftgw000a01s6ha4dabz4	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:31:11.6	\N	2026-08-05 12:31:11.6
cmsg2hnsf000c01s6vrvjr8yd	CREATED NEW SUPER ADMIN: baha80305@gmail.com	USER	cmsg2hnri000b01s6wu161h2l	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:32:37.551	\N	2026-08-05 12:32:37.551
cmsg2i8yy000d01s6st8nu5ur	LOGGED IN (Credentials)	USER	cmsg2hnri000b01s6wu161h2l	\N	\N	cmsg2hnri000b01s6wu161h2l	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:33:05.003	\N	2026-08-05 12:33:05.003
cmsg2k7b0000e01s69fxtf9p0	RESET PASSWORD FOR USER: abdulbineh@gmail.com	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:34:36.156	\N	2026-08-05 12:34:36.156
cmsg2klsc000f01s6kiwmgpf3	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:34:54.924	\N	2026-08-05 12:34:54.924
cmsg2lghs000g01s67ojfswn6	RESET PASSWORD FOR USER: abdulbineh@gmail.com	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:35:34.72	\N	2026-08-05 12:35:34.72
cmsg2md5v000h01s6odudyrqo	LOGGED IN (Credentials)	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrza5stq000d01s6mtfyhx70	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:36:17.059	\N	2026-08-05 12:36:17.059
cmsg2n86w000i01s6ovwrraxa	DELETED BUSINESS NODE: Mini Mart	BUSINESS	cmsbzr7hg000601s66i41z70g	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:36:57.272	\N	2026-08-05 12:36:57.272
cmsg2nebv000j01s6mel4ectk	DELETED BUSINESS NODE: Bar Demo 	BUSINESS	cms111gtu000301s6ra7phyzg	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:37:05.227	\N	2026-08-05 12:37:05.227
cmsg2nlao000k01s6u4p8r6eu	DELETED BUSINESS NODE: PROTECH MEDICINES CARE	BUSINESS	cms0msokq000001s6kwrsu6h2	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:37:14.256	\N	2026-08-05 12:37:14.256
cmsg2o0d9000l01s6wyw2dc01	DELETED BUSINESS NODE: Clinic Demo	BUSINESS	cmrjwjl57000c01s610yl5l5r	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:37:33.789	\N	2026-08-05 12:37:33.789
cmsg2o5lq000m01s6353txioi	DELETED BUSINESS NODE: BIBSON SPICES	BUSINESS	cmrt3mebl000001s6i6xqilxf	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:37:40.574	\N	2026-08-05 12:37:40.574
cmsg39v8z000v01s6mpyu4z3g	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 12:54:33.587	\N	2026-08-05 12:54:33.587
cmsg39wt6000w01s6iz966p6a	LOGGED IN (Credentials)	USER	cmsg38eqr000t01s66jjvivaf	\N	\N	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 12:54:35.61	\N	2026-08-05 12:54:35.61
cmsg3bmdq001501s6ldih8lxh	LOGGED IN (Credentials)	USER	cmsg3ampe001301s6hyhcq613	\N	\N	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:55.406	\N	2026-08-05 12:55:55.406
cmsg3fw6v001601s6r3ixjdz5	LOGGED IN (Credentials)	USER	cmsg3ampe001301s6hyhcq613	\N	\N	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 12:59:14.743	\N	2026-08-05 12:59:14.743
cmsg3gcqd001701s63hrv39bp	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:59:36.181	\N	2026-08-05 12:59:36.181
cmsg3is44001g01s649l29y4q	LOGGED IN (Credentials)	USER	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:01:29.428	\N	2026-08-05 13:01:29.428
cmsg3olnv001p01s62xc6eama	LOGGED IN (Credentials)	USER	cmsg3mpqm001n01s6uacw6clo	\N	\N	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:06:01.003	\N	2026-08-05 13:06:01.003
cmsg3rtpu001s01s66p42n3r5	Created Category: wine	CATEGORY	cmsg3rtpf001r01s6dkv01peg	\N	{"id": "cmsg3rtpf001r01s6dkv01peg", "name": "wine", "createdAt": "2026-08-05T13:08:31.395Z", "deletedAt": null, "updatedAt": "2026-08-05T13:08:31.395Z", "businessId": "cmsg38ejb000n01s66874af28", "description": "all types"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:08:31.41	\N	2026-08-05 13:08:31.41
cmsg3tg3v001u01s6y0hmp70b	Created Category: Clothing store 	CATEGORY	cmsg3tg3i001t01s6a3zdumi8	\N	{"id": "cmsg3tg3i001t01s6a3zdumi8", "name": "Clothing store ", "createdAt": "2026-08-05T13:09:47.070Z", "deletedAt": null, "updatedAt": "2026-08-05T13:09:47.070Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Rahim Boutique is a modern fashion shop offering stylish clothing, shoes, handbags, accessories, perfumes, and fashion items for men, women, and children. We provide quality products at affordable prices, helping our customers look fashionable for every occasion. Our goal is to deliver excellent customer service and the latest fashion trends in one place."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:09:47.083	\N	2026-08-05 13:09:47.083
cmsg3tlw8001v01s6v16k5sxo	Updated Category: Clothing store 	CATEGORY	cmsg3tg3i001t01s6a3zdumi8	\N	{"id": "cmsg3tg3i001t01s6a3zdumi8", "name": "Clothing store ", "createdAt": "2026-08-05T13:09:47.070Z", "deletedAt": null, "updatedAt": "2026-08-05T13:09:54.574Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Rahim Boutique is a modern fashion shop offering stylish clothing, shoes, handbags, accessories, perfumes, and fashion items for men, women, and children. We provide quality products at affordable prices, helping our customers look fashionable for every occasion. Our goal is to deliver excellent customer service and the latest fashion trends in one place."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:09:54.585	\N	2026-08-05 13:09:54.585
cmsg3tpwr001x01s6usqh1ecm	Created Category: Mobile phones	CATEGORY	cmsg3tpwg001w01s6wkwsw8l2	\N	{"id": "cmsg3tpwg001w01s6wkwsw8l2", "name": "Mobile phones", "createdAt": "2026-08-05T13:09:59.776Z", "deletedAt": null, "updatedAt": "2026-08-05T13:09:59.776Z", "businessId": "cmsg3amla000x01s698usq8fn", "description": ""}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:09:59.787	\N	2026-08-05 13:09:59.787
cmsg3v1fl001y01s6gflb8wqh	Updated Category: Clothing store 	CATEGORY	cmsg3tg3i001t01s6a3zdumi8	\N	{"id": "cmsg3tg3i001t01s6a3zdumi8", "name": "Clothing store ", "createdAt": "2026-08-05T13:09:47.070Z", "deletedAt": null, "updatedAt": "2026-08-05T13:11:01.365Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Rahim Boutique is a modern fashion shop offering stylish clothing, shoes, handbags, accessories, perfumes, and fashion items for men, women, and children."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:11:01.377	\N	2026-08-05 13:11:01.377
cmsg3vko3002001s6q1kllbvv	Created Category: Herbal Medicines	CATEGORY	cmsg3vknt001z01s6hb6lyfxt	\N	{"id": "cmsg3vknt001z01s6hb6lyfxt", "name": "Herbal Medicines", "createdAt": "2026-08-05T13:11:26.297Z", "deletedAt": null, "updatedAt": "2026-08-05T13:11:26.297Z", "businessId": "cmsg3i0h4001801s67p002bbz", "description": "Made from natural plants and herbs. "}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:11:26.307	\N	2026-08-05 13:11:26.307
cmsgdshlt000068lnnk1ven6s	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 17:48:58.53	\N	2026-08-05 17:48:58.53
cmsg3x11p002201s6gfqmkstq	Created Category: Tablets and Capsules 	CATEGORY	cmsg3x11f002101s6i0lld6x6	\N	{"id": "cmsg3x11f002101s6i0lld6x6", "name": "Tablets and Capsules ", "createdAt": "2026-08-05T13:12:34.179Z", "deletedAt": null, "updatedAt": "2026-08-05T13:12:34.179Z", "businessId": "cmsg3i0h4001801s67p002bbz", "description": "Solid Medicines taken by mouth"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:12:34.189	\N	2026-08-05 13:12:34.189
cmsg40e94002501s6a2ukq7ut	CREATE	PRODUCT	cmsg40e83002301s6r8dz9yjf	\N	{"id": "cmsg40e83002301s6r8dz9yjf", "sku": "", "name": "red wine", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935492/inventory/products/vj822ykfgfazzqwkvkui.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "104.17", "createdAt": "2026-08-05T13:15:11.235Z", "deletedAt": null, "unitPrice": "110", "updatedAt": "2026-08-05T13:15:11.235Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:15:11.272	\N	2026-08-05 13:15:11.272
cmsg40ypx002701s6xtct55fo	Created Category: Syrups and liquids Medicines 	CATEGORY	cmsg40ypn002601s6ssptt538	\N	{"id": "cmsg40ypn002601s6ssptt538", "name": "Syrups and liquids Medicines ", "createdAt": "2026-08-05T13:15:37.787Z", "deletedAt": null, "updatedAt": "2026-08-05T13:15:37.787Z", "businessId": "cmsg3i0h4001801s67p002bbz", "description": "Liquids Medicines Often used for children and Adults who have difficult swallowing problems "}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:15:37.797	\N	2026-08-05 13:15:37.797
cmsg425qy002901s68ark3x3p	Created Category: Injectables Medicines 	CATEGORY	cmsg425qo002801s67otdtxm1	\N	{"id": "cmsg425qo002801s67otdtxm1", "name": "Injectables Medicines ", "createdAt": "2026-08-05T13:16:33.552Z", "deletedAt": null, "updatedAt": "2026-08-05T13:16:33.552Z", "businessId": "cmsg3i0h4001801s67p002bbz", "description": "Medicines given by injections"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:16:33.562	\N	2026-08-05 13:16:33.562
cmsg451tw002d01s6veoiled2	CREATE	PRODUCT	cmsg451qn002c01s6y1vkdjq3	\N	{"id": "cmsg451qn002c01s6y1vkdjq3", "sku": "", "name": "IPHONE 17 PRO", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935841/inventory/products/vhmefqgzhkkozisbx7fa.webp", "metadata": {"packagingUnits": []}, "costPrice": "45000", "createdAt": "2026-08-05T13:18:48.335Z", "deletedAt": null, "unitPrice": "60000", "updatedAt": "2026-08-05T13:18:48.335Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:18:48.452	\N	2026-08-05 13:18:48.452
cmsg458r8002g01s6tryy010k	CREATE	PRODUCT	cmsg458q8002e01s6478pm5l6	\N	{"id": "cmsg458q8002e01s6478pm5l6", "sku": "", "name": "white wine", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935803/inventory/products/qy85l9abteta2owh9pks.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "115", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "104.17", "createdAt": "2026-08-05T13:18:57.392Z", "deletedAt": null, "unitPrice": "115", "updatedAt": "2026-08-05T13:18:57.392Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": true, "description": "", "maxStockLevel": 100, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:18:57.428	\N	2026-08-05 13:18:57.428
cmsg46az8002h01s600dloqk8	DELETE	PRODUCT	cmsg44wxx002a01s6b60beluk	\N	\N	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:19:46.964	\N	2026-08-05 13:19:46.964
cmsg44wyj002b01s6hhnvvupk	CREATE	PRODUCT	cmsg44wxx002a01s6b60beluk	\N	{"id": "cmsg44wxx002a01s6b60beluk", "sku": "", "name": "IPHONE 17 PRO", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935841/inventory/products/vhmefqgzhkkozisbx7fa.webp", "metadata": {"packagingUnits": []}, "costPrice": "45000", "createdAt": "2026-08-05T13:18:42.117Z", "deletedAt": null, "unitPrice": "60000", "updatedAt": "2026-08-05T13:18:42.117Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:18:42.139	\N	2026-08-05 13:18:42.139
cmsg49jev002k01s6aw3dpj6a	CREATE	PRODUCT	cmsg49je5002i01s6cvarwut0	\N	{"id": "cmsg49je5002i01s6cvarwut0", "sku": "", "name": "Gucci", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935878/inventory/products/lor1qknzazxv6ohuwdlt.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "200", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T13:22:17.837Z", "deletedAt": null, "unitPrice": "200", "updatedAt": "2026-08-05T13:22:17.837Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:22:17.863	\N	2026-08-05 13:22:17.863
cmsg49mqn002m01s6ch9hwgfk	CREATE	PRODUCT	cmsg49mq4002l01s6vhym2ei1	\N	{"id": "cmsg49mq4002l01s6vhym2ei1", "sku": "", "name": "IPHONE 18", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936103/inventory/products/fkf1mrfpi0gepqrof95c.webp", "metadata": {"packagingUnits": []}, "costPrice": "55000", "createdAt": "2026-08-05T13:22:22.156Z", "deletedAt": null, "unitPrice": "75000", "updatedAt": "2026-08-05T13:22:22.156Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:22:22.175	\N	2026-08-05 13:22:22.175
cmsg4agb7002p01s6mt71q91p	CREATE	PRODUCT	cmsg4agai002n01s6o1e6auva	\N	{"id": "cmsg4agai002n01s6o1e6auva", "sku": "", "name": "rose wine", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936051/inventory/products/laqrdragm5hhjr3tbnuk.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "125", "createdAt": "2026-08-05T13:23:00.474Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T13:23:00.474Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "48", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:23:00.499	\N	2026-08-05 13:23:00.499
cmsg4aul2002r01s6te2onk3o	CREATE	PRODUCT	cmsg4aukj002q01s6hz6jqye9	\N	{"id": "cmsg4aukj002q01s6hz6jqye9", "sku": "", "name": "TECNO PHANTOM V FOLD", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936161/inventory/products/ubinhi48jsicyvw3gyqo.webp", "metadata": {"packagingUnits": []}, "costPrice": "23000", "createdAt": "2026-08-05T13:23:18.979Z", "deletedAt": null, "unitPrice": "30000", "updatedAt": "2026-08-05T13:23:18.979Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:23:18.998	\N	2026-08-05 13:23:18.998
cmsg4c5en002t01s6wjtw27s5	Created Category: Watch store	CATEGORY	cmsg4c5ec002s01s6m4tjxtmo	\N	{"id": "cmsg4c5ec002s01s6m4tjxtmo", "name": "Watch store", "createdAt": "2026-08-05T13:24:19.668Z", "deletedAt": null, "updatedAt": "2026-08-05T13:24:19.668Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Discover stylish, high-quality watches designed for everyday wear and special occasions. Our collection features elegant, durable, and comfortable timepieces for both men and women. Whether you prefer a classic, luxury, or modern design, our watches combine fashion with reliable performance at affordable prices."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:24:19.679	\N	2026-08-05 13:24:19.679
cmsg4c6vf002v01s6qd8qmvz9	CREATE	PRODUCT	cmsg4c6uv002u01s6lm83ukkn	\N	{"id": "cmsg4c6uv002u01s6lm83ukkn", "sku": "", "name": "ONE PLUS 15", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936227/inventory/products/sovjmue7b2h75ha0dvxi.webp", "metadata": {"packagingUnits": []}, "costPrice": "18000", "createdAt": "2026-08-05T13:24:21.559Z", "deletedAt": null, "unitPrice": "25000", "updatedAt": "2026-08-05T13:24:21.559Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:24:21.579	\N	2026-08-05 13:24:21.579
cmsg4dhsz002x01s6le51yxr8	CREATE	PRODUCT	cmsg4dhsf002w01s6gvmdvh5x	\N	{"id": "cmsg4dhsf002w01s6gvmdvh5x", "sku": "", "name": "GALAXY S25 ULTRA", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936273/inventory/products/ojpdvj1ekimzobendulz.webp", "metadata": {"packagingUnits": []}, "costPrice": "35000", "createdAt": "2026-08-05T13:25:22.383Z", "deletedAt": null, "unitPrice": "47000", "updatedAt": "2026-08-05T13:25:22.383Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg3tpwg001w01s6wkwsw8l2", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:25:22.403	\N	2026-08-05 13:25:22.403
cmsg4ecju002z01s6o9kgvhdg	Created Category: LAPTOPS	CATEGORY	cmsg4ecj9002y01s6qa8w3byt	\N	{"id": "cmsg4ecj9002y01s6qa8w3byt", "name": "LAPTOPS", "createdAt": "2026-08-05T13:26:02.229Z", "deletedAt": null, "updatedAt": "2026-08-05T13:26:02.229Z", "businessId": "cmsg3amla000x01s698usq8fn", "description": ""}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:26:02.251	\N	2026-08-05 13:26:02.251
cmsg4g35d003201s6o198b6hb	CREATE	PRODUCT	cmsg4g34p003001s6z5h1cjxu	\N	{"id": "cmsg4g34p003001s6z5h1cjxu", "sku": "", "name": "Paracetamol ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936164/inventory/products/nb65p38u2wweu9wwyzll.webp", "metadata": {"expiryDate": "2027-03-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T13:27:23.353Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T13:27:23.353Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "60", "originalProductId": null, "genericAlternative": "Paracetamol 500mg", "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:27:23.377	\N	2026-08-05 13:27:23.377
cmsg4j10t003801s6kuvfc25w	CREATE	PRODUCT	cmsg4j105003601s61tbanl2z	\N	{"id": "cmsg4j105003601s61tbanl2z", "sku": "", "name": "dessert wine", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936445/inventory/products/xbgkf52s5vtdtd6ulk17.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "5000", "sellingPrice": "215", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "208.33", "createdAt": "2026-08-05T13:29:40.565Z", "deletedAt": null, "unitPrice": "215", "updatedAt": "2026-08-05T13:29:40.565Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "72", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:29:40.589	\N	2026-08-05 13:29:40.589
cmsg4pmhz003b01s6w1zdz35l	CREATE	PRODUCT	cmsg4pmhd003901s6vm7bcwcu	\N	{"id": "cmsg4pmhd003901s6vm7bcwcu", "sku": "", "name": "fortified", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936797/inventory/products/yhaqplor9l4vwtcxsxmy.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1000", "sellingPrice": "50", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "41.67", "createdAt": "2026-08-05T13:34:48.337Z", "deletedAt": null, "unitPrice": "50", "updatedAt": "2026-08-05T13:34:48.337Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "48", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:34:48.359	\N	2026-08-05 13:34:48.359
cmsg4v5p3003e01s6o74mgi2k	CREATE	PRODUCT	cmsg4v5od003c01s6mss6m6vm	\N	{"id": "cmsg4v5od003c01s6mss6m6vm", "sku": "", "name": "Amoxicillin ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936953/inventory/products/mod8j9kducgfitmnhhpq.webp", "metadata": {"expiryDate": "2027-03-10", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T13:39:06.493Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T13:39:06.493Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:39:06.519	\N	2026-08-05 13:39:06.519
cmsg53xli003p01s6zqb52qch	Created Category: soft drinks and beverages	CATEGORY	cmsg53xl9003o01s6u8mhewey	\N	{"id": "cmsg53xl9003o01s6u8mhewey", "name": "soft drinks and beverages", "createdAt": "2026-08-05T13:45:55.917Z", "deletedAt": null, "updatedAt": "2026-08-05T13:45:55.917Z", "businessId": "cmsg38ejb000n01s66874af28", "description": ""}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:45:55.926	\N	2026-08-05 13:45:55.926
cmsg54cc8003s01s6dp4cfici	CREATE	PRODUCT	cmsg54cbf003q01s6kd00gec0	\N	{"id": "cmsg54cbf003q01s6kd00gec0", "sku": "", "name": "Vitamin C", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937450/inventory/products/ivah66bgxrbuod3oydwg.webp", "metadata": {"expiryDate": "2027-09-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "12", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "6.67", "createdAt": "2026-08-05T13:46:15.003Z", "deletedAt": null, "unitPrice": "12", "updatedAt": "2026-08-05T13:46:15.003Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:46:15.032	\N	2026-08-05 13:46:15.032
cmsg54q39003u01s6t02vvxc0	Created Category: beer and cider	CATEGORY	cmsg54q2y003t01s6blo4zqhe	\N	{"id": "cmsg54q2y003t01s6blo4zqhe", "name": "beer and cider", "createdAt": "2026-08-05T13:46:32.842Z", "deletedAt": null, "updatedAt": "2026-08-05T13:46:32.842Z", "businessId": "cmsg38ejb000n01s66874af28", "description": ""}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:46:32.853	\N	2026-08-05 13:46:32.853
cmsg557c6003w01s6z8ra661g	Created Category: whisky	CATEGORY	cmsg557bw003v01s6y9upzyqh	\N	{"id": "cmsg557bw003v01s6y9upzyqh", "name": "whisky", "createdAt": "2026-08-05T13:46:55.196Z", "deletedAt": null, "updatedAt": "2026-08-05T13:46:55.196Z", "businessId": "cmsg38ejb000n01s66874af28", "description": ""}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:46:55.206	\N	2026-08-05 13:46:55.206
cmsg9fxgx00hy01s6n8exa38u	Created Sale: INV-1785944833965-380 (Le 16,000)	SALE	cmsg9fxdc00hn01s6yzal8dei	\N	{"totalAmount": 16000, "invoiceNumber": "INV-1785944833965-380"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:47:14.097	\N	2026-08-05 15:47:14.097
cmsgfb9kp000001s65dq6ngg6	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 18:31:34.201	\N	2026-08-05 18:31:34.201
cmsg4gzr4003501s6wicv9zn5	CREATE	PRODUCT	cmsg4gzq9003301s6e5dc9uxa	\N	{"id": "cmsg4gzq9003301s6e5dc9uxa", "sku": "", "name": "Patex Philippe", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936306/inventory/products/jljxaeixwuocgsr6ngwb.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "100000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "300", "purchaseUnitName": "Pallet"}]}, "costPrice": "333.33", "createdAt": "2026-08-05T13:28:05.601Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T13:28:05.601Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg4c5ec002s01s6m4tjxtmo", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "300", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:28:05.632	\N	2026-08-05 13:28:05.632
cmsg4xhtt003g01s6wuvyo393	CREATE	PRODUCT	cmsg4xht2003f01s6iopaw2wz	\N	{"id": "cmsg4xht2003f01s6iopaw2wz", "sku": "", "name": "LG GRAM PRO", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937220/inventory/products/sezsqxycj1dqtppkxykv.webp", "metadata": {"packagingUnits": []}, "costPrice": "9000", "createdAt": "2026-08-05T13:40:55.526Z", "deletedAt": null, "unitPrice": "14000", "updatedAt": "2026-08-05T13:40:55.526Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg4ecj9002y01s6qa8w3byt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:40:55.553	\N	2026-08-05 13:40:55.553
cmsg4znft003i01s6xo5o5i7l	CREATE	PRODUCT	cmsg4znev003h01s6qudymizw	\N	{"id": "cmsg4znev003h01s6qudymizw", "sku": "", "name": "SAMSUNG GALAXY BOOK", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937304/inventory/products/lqeajgowk3dgfv5wyler.webp", "metadata": {"packagingUnits": []}, "costPrice": "17000", "createdAt": "2026-08-05T13:42:36.103Z", "deletedAt": null, "unitPrice": "24000", "updatedAt": "2026-08-05T13:42:36.103Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg4ecj9002y01s6qa8w3byt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:42:36.137	\N	2026-08-05 13:42:36.137
cmsg5042x003l01s6hbetnel4	CREATE	PRODUCT	cmsg50425003j01s6jrz4yj4e	\N	{"id": "cmsg50425003j01s6jrz4yj4e", "sku": "", "name": "Congestyl", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937184/inventory/products/qma8pcnmyex6jd4pra7s.webp", "metadata": {"expiryDate": "2027-04-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T13:42:57.677Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T13:42:57.677Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:42:57.705	\N	2026-08-05 13:42:57.705
cmsg52qzr003n01s69bwpyyc1	CREATE	PRODUCT	cmsg52qyn003m01s606jf9qsl	\N	{"id": "cmsg52qyn003m01s606jf9qsl", "sku": "", "name": "LENOVO THINKPAD X1", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937436/inventory/products/etddms7ftu0wnld6ngri.webp", "metadata": {"packagingUnits": []}, "costPrice": "9000", "createdAt": "2026-08-05T13:45:00.671Z", "deletedAt": null, "unitPrice": "12000", "updatedAt": "2026-08-05T13:45:00.671Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg4ecj9002y01s6qa8w3byt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:45:00.711	\N	2026-08-05 13:45:00.711
cmsg5708r004301s60iwjn6aw	CREATE	PRODUCT	cmsg57083004201s6m0lzae0k	\N	{"id": "cmsg57083004201s6m0lzae0k", "sku": "", "name": "APPLE MACBOOK AIR", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937668/inventory/products/swgbzpejyk9d8bpaoshd.webp", "metadata": {"packagingUnits": []}, "costPrice": "23000", "createdAt": "2026-08-05T13:48:19.299Z", "deletedAt": null, "unitPrice": "30000", "updatedAt": "2026-08-05T13:48:19.299Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg4ecj9002y01s6qa8w3byt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:48:19.323	\N	2026-08-05 13:48:19.323
cmsg5cbok004j01s6ne2o7bkr	CREATE	PRODUCT	cmsg5cbma004h01s6uj70ztjx	\N	{"id": "cmsg5cbma004h01s6uj70ztjx", "sku": "", "name": "coca cola", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937827/inventory/products/uisutlhzbcmvgjhbghyu.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "700", "sellingPrice": "35", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "29.17", "createdAt": "2026-08-05T13:52:27.346Z", "deletedAt": null, "unitPrice": "35", "updatedAt": "2026-08-05T13:52:27.346Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "72", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:52:27.428	\N	2026-08-05 13:52:27.428
cmsg56570004101s6eg54lr7i	CREATE	PRODUCT	cmsg5656e004001s6k4if24v3	\N	{"id": "cmsg5656e004001s6k4if24v3", "sku": "", "name": "HP SPECTRE x360", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937585/inventory/products/elj7oubbb4rjaqnfzjaz.webp", "metadata": {"packagingUnits": []}, "costPrice": "12000", "createdAt": "2026-08-05T13:47:39.062Z", "deletedAt": null, "unitPrice": "20000", "updatedAt": "2026-08-05T13:47:39.062Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg4ecj9002y01s6qa8w3byt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:47:39.084	\N	2026-08-05 13:47:39.084
cmsg58ocq004701s61aph3jip	CREATE	PRODUCT	cmsg58obu004401s60j7l9qsu	\N	{"id": "cmsg58obu004401s60j7l9qsu", "sku": "", "name": "Nike ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937662/inventory/products/ltqodobast4xiosdmrvz.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "300", "purchaseUnitName": "Barrel"}, {"barcode": "", "purchaseCost": "", "sellingPrice": "", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Barrel"}]}, "costPrice": "166.67", "createdAt": "2026-08-05T13:49:37.194Z", "deletedAt": null, "unitPrice": "250", "updatedAt": "2026-08-05T13:49:37.194Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "300", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:49:37.226	\N	2026-08-05 13:49:37.226
cmsg599jk004a01s6pqa7q2c4	CREATE	PRODUCT	cmsg599is004801s6r0mgmpnc	\N	{"id": "cmsg599is004801s6r0mgmpnc", "sku": "", "name": "Multivitamins ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937614/inventory/products/rjrlwgpzlqkt5twrjo3r.webp", "metadata": {"expiryDate": "2028-05-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "70", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "5.83", "createdAt": "2026-08-05T13:50:04.660Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T13:50:04.660Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "70", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:50:04.688	\N	2026-08-05 13:50:04.688
cmsg5c8t3004c01s635cr344g	Created Category: Glasses 	CATEGORY	cmsg5c8st004b01s6c0z5m6s4	\N	{"id": "cmsg5c8st004b01s6c0z5m6s4", "name": "Glasses ", "createdAt": "2026-08-05T13:52:23.693Z", "deletedAt": null, "updatedAt": "2026-08-05T13:52:23.693Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Upgrade your style with these fashionable eyeglasses, designed for both comfort and elegance. The lightweight frame provides a comfortable fit for everyday wear, while the modern design complements casual, business, and formal outfits."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:52:23.703	\N	2026-08-05 13:52:23.703
cmsg5cbek004g01s6wcoyh0tb	CREATE	PRODUCT	cmsg5cbd3004d01s65xg4s2x1	\N	{"id": "cmsg5cbd3004d01s65xg4s2x1", "sku": "", "name": "Benadryl ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937828/inventory/products/xkn8vfa7wjn17yjjmd3z.webp", "metadata": {"expiryDate": "", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "20", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}, {"barcode": "", "purchaseCost": "100", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8", "createdAt": "2026-08-05T13:52:27.015Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T13:52:27.015Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 13:52:27.068	\N	2026-08-05 13:52:27.068
cmsg5gfmi004k01s6c3oafvk0	LOGGED IN (Credentials)	USER	cmsg38eqr000t01s66jjvivaf	\N	\N	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:55:39.162	\N	2026-08-05 13:55:39.162
cmsg5hpgj004n01s61sq7xa15	CREATE	PRODUCT	cmsg5hpfr004l01s6l77hutho	\N	{"id": "cmsg5hpfr004l01s6l77hutho", "sku": "", "name": "Anti blue light glass ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785937974/inventory/products/lxyvgyl8sgxznwtncbka.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "20000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Carton"}]}, "costPrice": "200", "createdAt": "2026-08-05T13:56:38.535Z", "deletedAt": null, "unitPrice": "250", "updatedAt": "2026-08-05T13:56:38.535Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5c8st004b01s6c0z5m6s4", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:56:38.563	\N	2026-08-05 13:56:38.563
cmsg5k17a004p01s6jsuq0oer	Created Category: Gaming	CATEGORY	cmsg5k170004o01s6a0fva9xw	\N	{"id": "cmsg5k170004o01s6a0fva9xw", "name": "Gaming", "createdAt": "2026-08-05T13:58:27.084Z", "deletedAt": null, "updatedAt": "2026-08-05T13:58:27.084Z", "businessId": "cmsg3amla000x01s698usq8fn", "description": ""}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 13:58:27.094	\N	2026-08-05 13:58:27.094
cmsg62rkh006401s682w9c3qx	CREATE	PRODUCT	cmsg62rjy006301s6bp0a9dkn	\N	{"id": "cmsg62rjy006301s6bp0a9dkn", "sku": "", "name": "BLENDER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "80", "createdAt": "2026-08-05T14:13:01.054Z", "deletedAt": null, "unitPrice": "100", "updatedAt": "2026-08-05T14:13:01.054Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:13:01.073	\N	2026-08-05 14:13:01.073
cmsg5kcpr004s01s6zqbwppfb	CREATE	PRODUCT	cmsg5kcnb004q01s6tnosoctn	\N	{"id": "cmsg5kcnb004q01s6tnosoctn", "sku": "", "name": "pepsi", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938252/inventory/products/ecyqtqf4yrtrivkiiiuf.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "37.5", "createdAt": "2026-08-05T13:58:41.927Z", "deletedAt": null, "unitPrice": "40", "updatedAt": "2026-08-05T13:58:41.927Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 13:58:42.015	\N	2026-08-05 13:58:42.015
cmsg5ma3a004u01s60arrc6lt	CREATE	PRODUCT	cmsg5ma2p004t01s6z1mechsf	\N	{"id": "cmsg5ma2p004t01s6z1mechsf", "sku": "", "name": "STEAM DECK", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938367/inventory/products/daamgmgt8oaaxncz51rp.webp", "metadata": {"packagingUnits": []}, "costPrice": "2000", "createdAt": "2026-08-05T14:00:11.905Z", "deletedAt": null, "unitPrice": "4000", "updatedAt": "2026-08-05T14:00:11.905Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5k170004o01s6a0fva9xw", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:00:11.926	\N	2026-08-05 14:00:11.926
cmsg5olyi004w01s6v1enb4p1	CREATE	PRODUCT	cmsg5olxy004v01s65v5o0f7c	\N	{"id": "cmsg5olxy004v01s65v5o0f7c", "sku": "", "name": "NINTENDO SWITCH", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938473/inventory/products/jnfza9wbqek67mdgknrw.webp", "metadata": {"packagingUnits": []}, "costPrice": "1000", "createdAt": "2026-08-05T14:02:00.598Z", "deletedAt": null, "unitPrice": "1500", "updatedAt": "2026-08-05T14:02:00.598Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5k170004o01s6a0fva9xw", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:02:00.618	\N	2026-08-05 14:02:00.618
cmsg5rd64005001s6kyy8jd37	Created Category: Shoes store	CATEGORY	cmsg5rd5u004z01s6ov2oxpci	\N	{"id": "cmsg5rd5u004z01s6ov2oxpci", "name": "Shoes store", "createdAt": "2026-08-05T14:04:09.186Z", "deletedAt": null, "updatedAt": "2026-08-05T14:04:09.186Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Step into comfort and style with these premium shoes, designed for everyday wear. Made from high-quality materials, they provide a comfortable fit, breathable design, and durable sole for long-lasting performance."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:04:09.196	\N	2026-08-05 14:04:09.196
cmsg5ri4u005201s6d6v89vzd	CREATE	PRODUCT	cmsg5ri4a005101s60he6v9bu	\N	{"id": "cmsg5ri4a005101s60he6v9bu", "sku": "", "name": "XBOX SERIES X", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938618/inventory/products/uh7caj6jlcm7pmzvgzhu.webp", "metadata": {"packagingUnits": []}, "costPrice": "12000", "createdAt": "2026-08-05T14:04:15.610Z", "deletedAt": null, "unitPrice": "17000", "updatedAt": "2026-08-05T14:04:15.610Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5k170004o01s6a0fva9xw", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:04:15.63	\N	2026-08-05 14:04:15.63
cmsg5s0vq005501s6xeof0a75	CREATE	PRODUCT	cmsg5s0v2005301s6y43tsovn	\N	{"id": "cmsg5s0v2005301s6y43tsovn", "sku": "", "name": "fanta", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938433/inventory/products/dwkf441oyi7ooz5dl4cz.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "500", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "20.83", "createdAt": "2026-08-05T14:04:39.902Z", "deletedAt": null, "unitPrice": "30", "updatedAt": "2026-08-05T14:04:39.902Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:04:39.926	\N	2026-08-05 14:04:39.926
cmsg5ti54005701s6apw5x2u0	CREATE	PRODUCT	cmsg5ti4h005601s6zqcdlnyl	\N	{"id": "cmsg5ti4h005601s6zqcdlnyl", "sku": "", "name": "PLAYSTATION 5", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938695/inventory/products/ggdc7xcywlmiti05k9h5.webp", "metadata": {"packagingUnits": []}, "costPrice": "7000", "createdAt": "2026-08-05T14:05:48.929Z", "deletedAt": null, "unitPrice": "14000", "updatedAt": "2026-08-05T14:05:48.929Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5k170004o01s6a0fva9xw", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:05:48.952	\N	2026-08-05 14:05:48.952
cmsg5u2t0005a01s6rr52kzhe	CREATE	PRODUCT	cmsg5u2sc005801s6dmwvo4di	\N	{"id": "cmsg5u2sc005801s6dmwvo4di", "sku": "", "name": "Moccasin ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938686/inventory/products/aubll4smwuxgjh2drsew.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "300", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Pack"}]}, "costPrice": "250", "createdAt": "2026-08-05T14:06:15.708Z", "deletedAt": null, "unitPrice": "300", "updatedAt": "2026-08-05T14:06:15.708Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:06:15.732	\N	2026-08-05 14:06:15.732
cmsg5qdov004y01s62mlq3ws3	CREATE	PRODUCT	cmsg5qdoa004x01s6t331pqxu	\N	{"id": "cmsg5qdoa004x01s6t331pqxu", "sku": "", "name": "META QUEST 3", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938566/inventory/products/blrdshopc7hvbcvubnaa.webp", "metadata": {"packagingUnits": []}, "costPrice": "32000", "createdAt": "2026-08-05T14:03:23.194Z", "deletedAt": null, "unitPrice": "45000", "updatedAt": "2026-08-05T14:03:23.194Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5k170004o01s6a0fva9xw", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:03:23.215	\N	2026-08-05 14:03:23.215
cmsg5wo29005d01s6oxwh2ccn	CREATE	PRODUCT	cmsg5wo1j005b01s63lzjllf8	\N	{"id": "cmsg5wo1j005b01s63lzjllf8", "sku": "", "name": "maltina", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938818/inventory/products/wnrmdwr1vgxxzszu6mf7.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "37.5", "createdAt": "2026-08-05T14:08:16.567Z", "deletedAt": null, "unitPrice": "40", "updatedAt": "2026-08-05T14:08:16.567Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:08:16.593	\N	2026-08-05 14:08:16.593
cmsg5wouf005f01s6jgf5fl0v	Created Category: HOME APPLIANCE 	CATEGORY	cmsg5wou2005e01s62eugzi8p	\N	{"id": "cmsg5wou2005e01s62eugzi8p", "name": "HOME APPLIANCE ", "createdAt": "2026-08-05T14:08:17.594Z", "deletedAt": null, "updatedAt": "2026-08-05T14:08:17.594Z", "businessId": "cmsg3amla000x01s698usq8fn", "description": ""}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:08:17.607	\N	2026-08-05 14:08:17.607
cmsg5xpk7005h01s6ji1u5syr	CREATE	PRODUCT	cmsg5xpji005g01s6kq39cs7p	\N	{"id": "cmsg5xpji005g01s6kq39cs7p", "sku": "", "name": "MICROWAVE OVEN", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "230", "createdAt": "2026-08-05T14:09:05.166Z", "deletedAt": null, "unitPrice": "400", "updatedAt": "2026-08-05T14:09:05.166Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:09:05.191	\N	2026-08-05 14:09:05.191
cmsg5yaly005i01s6idkgsirb	LOGGED IN (Credentials)	USER	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:09:32.47	\N	2026-08-05 14:09:32.47
cmsg5yk19005k01s6her39fm7	CREATE	PRODUCT	cmsg5yk0i005j01s628t8ksj8	\N	{"id": "cmsg5yk0i005j01s628t8ksj8", "sku": "", "name": "RICE COOKER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "450", "createdAt": "2026-08-05T14:09:44.658Z", "deletedAt": null, "unitPrice": "600", "updatedAt": "2026-08-05T14:09:44.658Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:09:44.685	\N	2026-08-05 14:09:44.685
cmsg5yxk8005m01s69pngs5ma	Created Category: Heel store 	CATEGORY	cmsg5yxjv005l01s651exwli4	\N	{"id": "cmsg5yxjv005l01s651exwli4", "name": "Heel store ", "createdAt": "2026-08-05T14:10:02.203Z", "deletedAt": null, "updatedAt": "2026-08-05T14:10:02.203Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Add elegance to your wardrobe with these stylish high heels, designed to enhance your look for every occasion. Crafted from high-quality materials, they feature a comfortable fit, durable sole, and a sleek, fashionable design."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:10:02.216	\N	2026-08-05 14:10:02.216
cmsg5znwh005p01s6tvkbgcce	CREATE	PRODUCT	cmsg5znvw005o01s6td0ltg7q	\N	{"id": "cmsg5znvw005o01s6td0ltg7q", "sku": "", "name": "VACUUM CLEANER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "150", "createdAt": "2026-08-05T14:10:36.332Z", "deletedAt": null, "unitPrice": "200", "updatedAt": "2026-08-05T14:10:36.332Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:10:36.353	\N	2026-08-05 14:10:36.353
cmsg60sum005r01s64h27w70h	CREATE	PRODUCT	cmsg60su0005q01s6vw9pd1n7	\N	{"id": "cmsg60su0005q01s6vw9pd1n7", "sku": "", "name": "AIR CONDITIONER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "600", "createdAt": "2026-08-05T14:11:29.400Z", "deletedAt": null, "unitPrice": "800", "updatedAt": "2026-08-05T14:11:29.400Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:11:29.422	\N	2026-08-05 14:11:29.422
cmsg619nt005u01s6877crbbs	CREATE	PRODUCT	cmsg619n5005s01s6znryjlbz	\N	{"id": "cmsg619n5005s01s6znryjlbz", "sku": "", "name": "water", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785938991/inventory/products/odd1csynep2rkonyfz6o.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "85", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Bundle"}]}, "costPrice": "7.08", "createdAt": "2026-08-05T14:11:51.185Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:11:51.185Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "60", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:11:51.209	\N	2026-08-05 14:11:51.209
cmsg61eph005x01s68osqeghd	CREATE	PRODUCT	cmsg61eos005v01s6rekxul60	\N	{"id": "cmsg61eos005v01s6rekxul60", "sku": "", "name": "Kitten Heel", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939041/inventory/products/di2enhwfxfv3irdg8ypx.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "9500", "sellingPrice": "100", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Bundle"}]}, "costPrice": "95", "createdAt": "2026-08-05T14:11:57.724Z", "deletedAt": null, "unitPrice": "100", "updatedAt": "2026-08-05T14:11:57.724Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5yxjv005l01s651exwli4", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:11:57.749	\N	2026-08-05 14:11:57.749
cmsg61sak006001s647f33o6t	CREATE	PRODUCT	cmsg61s9u005y01s63b6yk2ke	\N	{"id": "cmsg61s9u005y01s63b6yk2ke", "sku": "", "name": "Dry lil buds", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939048/inventory/products/kpzupp4r3d3r4dyqdbmn.webp", "metadata": {"expiryDate": "2027-04-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}, "costPrice": "6.67", "createdAt": "2026-08-05T14:12:15.330Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:12:15.330Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:12:15.356	\N	2026-08-05 14:12:15.356
cmsg623va006201s6tvsbvel0	CREATE	PRODUCT	cmsg623uq006101s60wpgwghr	\N	{"id": "cmsg623uq006101s60wpgwghr", "sku": "", "name": "Refrigerator ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "1500", "createdAt": "2026-08-05T14:12:30.338Z", "deletedAt": null, "unitPrice": "3000", "updatedAt": "2026-08-05T14:12:30.338Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:12:30.358	\N	2026-08-05 14:12:30.358
cmsg63duu006701s6if3d3mey	CREATE	PRODUCT	cmsg63du2006501s6vw8fgqbl	\N	{"id": "cmsg63du2006501s6vw8fgqbl", "sku": "", "name": "Star anise", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939155/inventory/products/dzusgnnkk1j5vof5gdz6.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}, "costPrice": "6.67", "createdAt": "2026-08-05T14:13:29.930Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:13:29.930Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "60", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:13:29.958	\N	2026-08-05 14:13:29.958
cmsg63e95006901s6gwjlux6e	CREATE	PRODUCT	cmsg63e8j006801s6wjclc1gk	\N	{"id": "cmsg63e8j006801s6wjclc1gk", "sku": "", "name": "TOASTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "120", "createdAt": "2026-08-05T14:13:30.451Z", "deletedAt": null, "unitPrice": "150", "updatedAt": "2026-08-05T14:13:30.451Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:13:30.473	\N	2026-08-05 14:13:30.473
cmsg649os006b01s6tcxadlee	CREATE	PRODUCT	cmsg649o3006a01s6g8h3i5be	\N	{"id": "cmsg649o3006a01s6g8h3i5be", "sku": "", "name": "ELECTRIC IRON", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "250", "createdAt": "2026-08-05T14:14:11.187Z", "deletedAt": null, "unitPrice": "315", "updatedAt": "2026-08-05T14:14:11.187Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:14:11.212	\N	2026-08-05 14:14:11.212
cmsg64ejb006d01s6333blaj0	CREATE	PRODUCT	cmsg64eio006c01s68eziyseq	\N	{"id": "cmsg64eio006c01s68eziyseq", "sku": "", "name": "ELECTRIC IRON", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "250", "createdAt": "2026-08-05T14:14:17.472Z", "deletedAt": null, "unitPrice": "315", "updatedAt": "2026-08-05T14:14:17.472Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:14:17.495	\N	2026-08-05 14:14:17.495
cmsg64vzd006e01s6fq8lpce2	DELETE	PRODUCT	cmsg649o3006a01s6g8h3i5be	\N	\N	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:14:40.105	\N	2026-08-05 14:14:40.105
cmsg97ah900gg01s63ulmxnoz	Created Sale: INV-1785944430995-414 (Le 110)	SALE	cmsg97afp00gc01s6kte5xaox	\N	{"totalAmount": 110, "invoiceNumber": "INV-1785944430995-414"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:40:31.053	\N	2026-08-05 15:40:31.053
cmsg9ptm200i401s6p9c9q0xx	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:54:55.658	\N	2026-08-05 15:54:55.658
cmsgff8ua000101s6ljv7pnkw	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 18:34:39.874	\N	2026-08-05 18:34:39.874
cmsgghyqa000101s61rzw1wrt	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-05 19:04:46.354	\N	2026-08-05 19:04:46.354
cmsg65l3r006h01s6l5w7c9nv	CREATE	PRODUCT	cmsg65l31006f01s69kobogp2	\N	{"id": "cmsg65l31006f01s69kobogp2", "sku": "", "name": "Chinese pearl barley", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939233/inventory/products/pxwg5nlvg3zbdoaslsiw.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}, "costPrice": "6.67", "createdAt": "2026-08-05T14:15:12.637Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:15:12.637Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:15:12.663	\N	2026-08-05 14:15:12.663
cmsg66166006j01s6pz1pe02l	CREATE	PRODUCT	cmsg6615l006i01s6d0dsx0g3	\N	{"id": "cmsg6615l006i01s6d0dsx0g3", "sku": "", "name": "COFFEE MAKER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "60", "createdAt": "2026-08-05T14:15:33.465Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T14:15:33.465Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:15:33.486	\N	2026-08-05 14:15:33.486
cmsg66qpq006l01s667njzcb3	CREATE	PRODUCT	cmsg66qp5006k01s6umuf7ioi	\N	{"id": "cmsg66qp5006k01s6umuf7ioi", "sku": "", "name": "JUICER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "55", "createdAt": "2026-08-05T14:16:06.569Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T14:16:06.569Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:16:06.59	\N	2026-08-05 14:16:06.59
cmsg67saz006r01s6ws687tt6	CREATE	PRODUCT	cmsg67sab006p01s6qxmujupw	\N	{"id": "cmsg67sab006p01s6qxmujupw", "sku": "", "name": "Air Max", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939265/inventory/products/z6wg8src5ifvmye5ba9x.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Box"}]}, "costPrice": "300", "createdAt": "2026-08-05T14:16:55.283Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:16:55.283Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:16:55.308	\N	2026-08-05 14:16:55.308
cmsg67z1e006s01s6gtw0cw2n	DELETE	PRODUCT	cmsg67sab006p01s6qxmujupw	\N	\N	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:17:04.034	\N	2026-08-05 14:17:04.034
cmsg6878l006v01s6871w74hn	CREATE	PRODUCT	cmsg6877k006t01s6krlyutz1	\N	{"id": "cmsg6877k006t01s6krlyutz1", "sku": "Dried Jujube fruits ", "name": "Dried Jujube fruits ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939332/inventory/products/tlxleke6rvgppk00zik7.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "60", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}, "costPrice": "5", "createdAt": "2026-08-05T14:17:14.624Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:17:14.624Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "70", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:17:14.661	\N	2026-08-05 14:17:14.661
cmsg6axth006y01s62d0ar8pb	CREATE	PRODUCT	cmsg6axsc006w01s62opiwy42	\N	{"id": "cmsg6axsc006w01s62opiwy42", "sku": "", "name": "Pumpkin seeds ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939456/inventory/products/whmx0dbvgyiotfaypneo.webp", "metadata": {"expiryDate": "2028-05-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "10", "sellingUnitName": "Cup", "unitsPerPackage": "12", "purchaseUnitName": "Drum"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T14:19:22.380Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:19:22.380Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:19:22.421	\N	2026-08-05 14:19:22.421
cmsg6ay7b007101s6psj3dzcr	CREATE	PRODUCT	cmsg6ay6k006z01s6xi9ms0ww	\N	{"id": "cmsg6ay6k006z01s6xi9ms0ww", "sku": "", "name": "Pumpkin seeds ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939456/inventory/products/whmx0dbvgyiotfaypneo.webp", "metadata": {"expiryDate": "2028-05-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "10", "sellingUnitName": "Cup", "unitsPerPackage": "12", "purchaseUnitName": "Drum"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T14:19:22.893Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:19:22.893Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3vknt001z01s6hb6lyfxt", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:19:22.919	\N	2026-08-05 14:19:22.919
cmsg6bbty007201s6kvx6onwf	DELETE	PRODUCT	cmsg6axsc006w01s62opiwy42	\N	\N	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:19:40.582	\N	2026-08-05 14:19:40.582
cmsg67o1u006o01s61n031mb5	CREATE	PRODUCT	cmsg67o14006m01s67s6yaji6	\N	{"id": "cmsg67o14006m01s67s6yaji6", "sku": "", "name": "Air Max", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939265/inventory/products/z6wg8src5ifvmye5ba9x.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Box"}]}, "costPrice": "300", "createdAt": "2026-08-05T14:16:49.768Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:16:49.768Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:16:49.794	\N	2026-08-05 14:16:49.794
cmsg6bexz007501s64u1v0j9y	CREATE	PRODUCT	cmsg6bex8007301s6gcc11zp5	\N	{"id": "cmsg6bex8007301s6gcc11zp5", "sku": "", "name": "Air Forces ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939515/inventory/products/emm2axwkml7iy2ucyypx.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Barrel"}]}, "costPrice": "250", "createdAt": "2026-08-05T14:19:44.588Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:19:44.588Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "12", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:19:44.615	\N	2026-08-05 14:19:44.615
cmsg6dbx7007801s6kuxpfqjq	CREATE	PRODUCT	cmsg6dbwi007601s60jtmez5n	\N	{"id": "cmsg6dbwi007601s60jtmez5n", "sku": "", "name": "heineken", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939577/inventory/products/hfn4ai9mqg14ffy1onwi.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "125", "createdAt": "2026-08-05T14:21:13.986Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T14:21:13.986Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:21:14.011	\N	2026-08-05 14:21:14.011
cmsg6dicy007901s6ve479gck	UPDATE	PRODUCT	cmsg60su0005q01s6vw9pd1n7	\N	{"id": "cmsg60su0005q01s6vw9pd1n7", "sku": "", "name": "AIR CONDITIONER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939679/inventory/products/tqnf9p7x3ztgutakcpma.webp", "metadata": {"packagingUnits": []}, "costPrice": "600", "createdAt": "2026-08-05T14:11:29.400Z", "deletedAt": null, "unitPrice": "800", "updatedAt": "2026-08-05T14:21:22.331Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:21:22.354	\N	2026-08-05 14:21:22.354
cmsg6dtn5007a01s62ewh3pof	UPDATE	PRODUCT	cmsg62rjy006301s6bp0a9dkn	\N	{"id": "cmsg62rjy006301s6bp0a9dkn", "sku": "", "name": "BLENDER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939695/inventory/products/orni3iliisojzfxlgs0j.webp", "metadata": {"packagingUnits": []}, "costPrice": "80", "createdAt": "2026-08-05T14:13:01.054Z", "deletedAt": null, "unitPrice": "100", "updatedAt": "2026-08-05T14:21:36.954Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:21:36.977	\N	2026-08-05 14:21:36.977
cmsg6e5u8007c01s6g3v1e12n	Created Category: Trousers store 	CATEGORY	cmsg6e5ty007b01s6x28v684h	\N	{"id": "cmsg6e5ty007b01s6x28v684h", "name": "Trousers store ", "createdAt": "2026-08-05T14:21:52.774Z", "deletedAt": null, "updatedAt": "2026-08-05T14:21:52.774Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Trousers are comfortable and stylish lower-body garments designed for everyday wear, work, formal occasions, or casual outings. Made from high-quality materials such as cotton, denim, polyester, or linen, they provide a great fit, durability, and all-day comfort"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:21:52.784	\N	2026-08-05 14:21:52.784
cmsg6eatd007d01s6yfzx8oz8	UPDATE	PRODUCT	cmsg64eio006c01s68eziyseq	\N	{"id": "cmsg64eio006c01s68eziyseq", "sku": "", "name": "ELECTRIC IRON", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939716/inventory/products/swcoioxexoqysmwhrn11.webp", "metadata": {"packagingUnits": []}, "costPrice": "250", "createdAt": "2026-08-05T14:14:17.472Z", "deletedAt": null, "unitPrice": "315", "updatedAt": "2026-08-05T14:21:59.209Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:21:59.233	\N	2026-08-05 14:21:59.233
cmsg6enum007e01s6ls4hot82	UPDATE	PRODUCT	cmsg66qp5006k01s6umuf7ioi	\N	{"id": "cmsg66qp5006k01s6umuf7ioi", "sku": "", "name": "JUICER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939731/inventory/products/uidk0gpkuapyvj9pnoct.webp", "metadata": {"packagingUnits": []}, "costPrice": "55", "createdAt": "2026-08-05T14:16:06.569Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T14:22:16.100Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:22:16.126	\N	2026-08-05 14:22:16.126
cmsg6f1m9007f01s695goi0j7	UPDATE	PRODUCT	cmsg623uq006101s60wpgwghr	\N	{"id": "cmsg623uq006101s60wpgwghr", "sku": "", "name": "Refrigerator ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939752/inventory/products/dlefhvdqnli9ba1kfxn2.webp", "metadata": {"packagingUnits": []}, "costPrice": "1500", "createdAt": "2026-08-05T14:12:30.338Z", "deletedAt": null, "unitPrice": "3000", "updatedAt": "2026-08-05T14:22:33.947Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:22:33.97	\N	2026-08-05 14:22:33.97
cmsg6fmh5007j01s6q1ivr4rp	CREATE	PRODUCT	cmsg6fmgd007h01s69qe71sop	\N	{"id": "cmsg6fmgd007h01s69qe71sop", "sku": "", "name": "Essential ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939726/inventory/products/rbhgfrnsbrt0vjhqmbrb.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:23:00.973Z", "deletedAt": null, "unitPrice": "250", "updatedAt": "2026-08-05T14:23:00.973Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg6e5ty007b01s6x28v684h", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:23:01.001	\N	2026-08-05 14:23:01.001
cmsg6fnap007k01s6rurhds3y	UPDATE	PRODUCT	cmsg6615l006i01s6d0dsx0g3	\N	{"id": "cmsg6615l006i01s6d0dsx0g3", "sku": "", "name": "COFFEE MAKER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939778/inventory/products/wqmbidw46h6ipzsstfax.webp", "metadata": {"packagingUnits": []}, "costPrice": "60", "createdAt": "2026-08-05T14:15:33.465Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T14:23:02.041Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:23:02.065	\N	2026-08-05 14:23:02.065
cmsg6g40c007l01s6hh9ik31l	UPDATE	PRODUCT	cmsg5yk0i005j01s628t8ksj8	\N	{"id": "cmsg5yk0i005j01s628t8ksj8", "sku": "", "name": "RICE COOKER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939799/inventory/products/twjcopkeae1eyfwmseyo.webp", "metadata": {"packagingUnits": []}, "costPrice": "450", "createdAt": "2026-08-05T14:09:44.658Z", "deletedAt": null, "unitPrice": "600", "updatedAt": "2026-08-05T14:23:23.699Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:23:23.724	\N	2026-08-05 14:23:23.724
cmsg6g5ff007n01s6cwo9smil	CREATE	PRODUCT	cmsg6g5eu007m01s6e1itvcsn	\N	{"id": "cmsg6g5eu007m01s6e1itvcsn", "sku": "", "name": "Wire Keyboard", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939707/inventory/products/ztc179baj80xq0et1fm6.webp", "metadata": {"packagingUnits": []}, "costPrice": "100", "createdAt": "2026-08-05T14:23:25.542Z", "deletedAt": null, "unitPrice": "150", "updatedAt": "2026-08-05T14:23:25.542Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrwtuhc5000601s6e93t39qe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 14:23:25.563	\N	2026-08-05 14:23:25.563
cmsg6iaj4007u01s60qi03g9w	Created Category: NETWORKING EQUIPMENT 	CATEGORY	cmsg6iais007t01s6vyp6rl4v	\N	{"id": "cmsg6iais007t01s6vyp6rl4v", "name": "NETWORKING EQUIPMENT ", "createdAt": "2026-08-05T14:25:05.476Z", "deletedAt": null, "updatedAt": "2026-08-05T14:25:05.476Z", "businessId": "cmsg3amla000x01s698usq8fn", "description": ""}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:25:05.488	\N	2026-08-05 14:25:05.488
cmsg6k0b7007w01s6f8hvx078	CREATE	PRODUCT	cmsg6k0ak007v01s693xkb00v	\N	{"id": "cmsg6k0ak007v01s693xkb00v", "sku": "Wireless Keyboard", "name": "Usb wireless Keyboard", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939836/inventory/products/wirgfunhtp0aoni0hvre.webp", "metadata": {"packagingUnits": []}, "costPrice": "350", "createdAt": "2026-08-05T14:26:25.532Z", "deletedAt": null, "unitPrice": "500", "updatedAt": "2026-08-05T14:26:25.532Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrwtuhc5000601s6e93t39qe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 14:26:25.555	\N	2026-08-05 14:26:25.555
cmsg6k9ot007z01s67oww2dhh	CREATE	PRODUCT	cmsg6k9o2007x01s6dlcbs83v	\N	{"id": "cmsg6k9o2007x01s6dlcbs83v", "sku": "", "name": "star beer", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939923/inventory/products/tgwsko8thskxrihpdd9q.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "600", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "25", "createdAt": "2026-08-05T14:26:37.682Z", "deletedAt": null, "unitPrice": "30", "updatedAt": "2026-08-05T14:26:37.682Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:26:37.709	\N	2026-08-05 14:26:37.709
cmsg982zg00gh01s6c0s7fzoe	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:41:07.996	\N	2026-08-05 15:41:07.996
cmsg9qj9900i501s6qo9mf9rb	LOGGED IN (Credentials)	USER	cmrnhyrpy000o01s66ob8mtyw	\N	\N	cmrnhyrpy000o01s66ob8mtyw	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:55:28.893	\N	2026-08-05 15:55:28.893
cmsg6fcfc007g01s6pepk357q	UPDATE	PRODUCT	cmsg5xpji005g01s6kq39cs7p	\N	{"id": "cmsg5xpji005g01s6kq39cs7p", "sku": "", "name": "MICROWAVE OVEN", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939766/inventory/products/ndwu2qdjgye23ajncalw.webp", "metadata": {"packagingUnits": []}, "costPrice": "230", "createdAt": "2026-08-05T14:09:05.166Z", "deletedAt": null, "unitPrice": "400", "updatedAt": "2026-08-05T14:22:47.952Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:22:47.976	\N	2026-08-05 14:22:47.976
cmsg6gjfm007o01s6u9j3d65p	UPDATE	PRODUCT	cmsg63e8j006801s6wjclc1gk	\N	{"id": "cmsg63e8j006801s6wjclc1gk", "sku": "", "name": "TOASTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939820/inventory/products/zkgwuleanbvffqzhyr3a.webp", "metadata": {"packagingUnits": []}, "costPrice": "120", "createdAt": "2026-08-05T14:13:30.451Z", "deletedAt": null, "unitPrice": "150", "updatedAt": "2026-08-05T14:23:43.684Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:23:43.714	\N	2026-08-05 14:23:43.714
cmsg6gujn007r01s6x45gw2yd	CREATE	PRODUCT	cmsg6guiv007p01s6e8ql6fij	\N	{"id": "cmsg6guiv007p01s6e8ql6fij", "sku": "", "name": "guinness", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939788/inventory/products/bylpsq2etpxw4l0tj7fq.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "125", "createdAt": "2026-08-05T14:23:58.087Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T14:23:58.087Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:23:58.115	\N	2026-08-05 14:23:58.115
cmsg6gwr2007s01s6gx8drpdb	UPDATE	PRODUCT	cmsg5znvw005o01s6td0ltg7q	\N	{"id": "cmsg5znvw005o01s6td0ltg7q", "sku": "", "name": "VACUUM CLEANER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939837/inventory/products/atqbkthal9n1wmelq7zm.webp", "metadata": {"packagingUnits": []}, "costPrice": "150", "createdAt": "2026-08-05T14:10:36.332Z", "deletedAt": null, "unitPrice": "200", "updatedAt": "2026-08-05T14:24:00.953Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg5wou2005e01s62eugzi8p", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:24:00.974	\N	2026-08-05 14:24:00.974
cmsg6l50i008601s6ob8eqj0h	CREATE	PRODUCT	cmsg6l4zv008501s62ztrajgj	\N	{"id": "cmsg6l4zv008501s62ztrajgj", "sku": "", "name": "ETHERNET CABLE", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "700", "createdAt": "2026-08-05T14:27:18.283Z", "deletedAt": null, "unitPrice": "1000", "updatedAt": "2026-08-05T14:27:18.283Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:27:18.307	\N	2026-08-05 14:27:18.307
cmsg6m8qn008b01s61g7e6biu	CREATE	PRODUCT	cmsg6m8pv008901s698emlh89	\N	{"id": "cmsg6m8pv008901s698emlh89", "sku": "", "name": "Insulin Injection ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939979/inventory/products/fzxdqeswasfuy8edq9u6.webp", "metadata": {"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "25", "purchaseUnitName": "Box"}]}, "costPrice": "6", "createdAt": "2026-08-05T14:28:09.763Z", "deletedAt": null, "unitPrice": "10", "updatedAt": "2026-08-05T14:28:09.763Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg425qo002801s67otdtxm1", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:28:09.791	\N	2026-08-05 14:28:09.791
cmsg6ma91008e01s6iob3h5jd	CREATE	PRODUCT	cmsg6ma8a008c01s62j86g36g	\N	{"id": "cmsg6ma8a008c01s62j86g36g", "sku": "", "name": "Nike Portal Pink ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940057/inventory/products/fahaovlfddgakbmrir5y.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:28:11.722Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:28:11.722Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:28:11.749	\N	2026-08-05 14:28:11.749
cmsg983gx00gm01s63086brg1	Created Sale: INV-1785944468580-106 (Le 75)	SALE	cmsg983fq00gi01s61vhj4bsi	\N	{"totalAmount": 75, "invoiceNumber": "INV-1785944468580-106"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:41:08.625	\N	2026-08-05 15:41:08.625
cmsg9t7zv00i901s6oufvvghu	LOGGED IN (Credentials)	USER	cmsg3mpqm001n01s6uacw6clo	\N	\N	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:57:34.267	\N	2026-08-05 15:57:34.267
cmsgfzhrh000001s6tft2f124	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 18:50:24.557	\N	2026-08-05 18:50:24.557
cmsg6kc0k008101s6ldzc1woa	CREATE	PRODUCT	cmsg6kbzc008001s6ej1e3ffp	\N	{"id": "cmsg6kbzc008001s6ej1e3ffp", "sku": "", "name": "WI-FI ROUTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "300", "createdAt": "2026-08-05T14:26:40.680Z", "deletedAt": null, "unitPrice": "500", "updatedAt": "2026-08-05T14:26:40.680Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:26:40.724	\N	2026-08-05 14:26:40.724
cmsg6kdyj008401s6g8epyois	CREATE	PRODUCT	cmsg6kdxr008201s67l7aamcb	\N	{"id": "cmsg6kdxr008201s67l7aamcb", "sku": "", "name": "Puma suede xl", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939946/inventory/products/rucsdovj5k02xkv7v2s3.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:26:43.215Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:26:43.215Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:26:43.243	\N	2026-08-05 14:26:43.243
cmsg6lsg0008801s6s2t6ssup	CREATE	PRODUCT	cmsg6lsfd008701s6jxn10tyo	\N	{"id": "cmsg6lsfd008701s6jxn10tyo", "sku": "", "name": "MODEM", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "900", "createdAt": "2026-08-05T14:27:48.649Z", "deletedAt": null, "unitPrice": "1500", "updatedAt": "2026-08-05T14:27:48.649Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:27:48.672	\N	2026-08-05 14:27:48.672
cmsg6mgk6008g01s6zyunu07b	CREATE	PRODUCT	cmsg6mgjk008f01s6yp7hrn6m	\N	{"id": "cmsg6mgjk008f01s6yp7hrn6m", "sku": "", "name": "NETWORK SWITCH", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "400", "createdAt": "2026-08-05T14:28:19.904Z", "deletedAt": null, "unitPrice": "650", "updatedAt": "2026-08-05T14:28:19.904Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:28:19.926	\N	2026-08-05 14:28:19.926
cmsg6ni39008i01s6k7d84dak	CREATE	PRODUCT	cmsg6ni2n008h01s601q6pvz4	\N	{"id": "cmsg6ni2n008h01s601q6pvz4", "sku": "", "name": "5G ROUTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "", "metadata": {"packagingUnits": []}, "costPrice": "2000", "createdAt": "2026-08-05T14:29:08.543Z", "deletedAt": null, "unitPrice": "5000", "updatedAt": "2026-08-05T14:29:08.543Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:29:08.565	\N	2026-08-05 14:29:08.565
cmsg6ou7r008n01s64lll051c	CREATE	PRODUCT	cmsg6ou6w008l01s6k58s2dzl	\N	{"id": "cmsg6ou6w008l01s6k58s2dzl", "sku": "", "name": "Niketech fleece M~2XL ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940168/inventory/products/iocarieacbfqbjlysrd2.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "400", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:30:10.904Z", "deletedAt": null, "unitPrice": "400", "updatedAt": "2026-08-05T14:30:10.904Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:30:10.935	\N	2026-08-05 14:30:10.935
cmsg6p5wy008q01s6d0hf4rz9	CREATE	PRODUCT	cmsg6p5w8008o01s6aludbqvq	\N	{"id": "cmsg6p5w8008o01s6aludbqvq", "sku": "", "name": "becks", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940168/inventory/products/xjnlc4agxhqeqesrirbg.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "600", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "25", "createdAt": "2026-08-05T14:30:26.072Z", "deletedAt": null, "unitPrice": "30", "updatedAt": "2026-08-05T14:30:26.072Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:30:26.098	\N	2026-08-05 14:30:26.098
cmsg6o4rq008k01s6hdh4kg5z	CREATE	PRODUCT	cmsg6o4r3008j01s6iurw63vi	\N	{"id": "cmsg6o4r3008j01s6iurw63vi", "sku": "", "name": "Barcode Scanner", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940093/inventory/products/w1ttpwfso0b6mutn6r4w.webp", "metadata": {"packagingUnits": []}, "costPrice": "3500", "createdAt": "2026-08-05T14:29:37.935Z", "deletedAt": null, "unitPrice": "400", "updatedAt": "2026-08-05T14:29:37.935Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 14:29:37.958	\N	2026-08-05 14:29:37.958
cmsg6r3xp008t01s6kccs4vu7	CREATE	PRODUCT	cmsg6r3wv008r01s6ti56ge53	\N	{"id": "cmsg6r3wv008r01s6ti56ge53", "sku": "", "name": "🔥 Nike Shox ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940270/inventory/products/u3krokuaw3kep7t4wlmv.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "45000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "225", "createdAt": "2026-08-05T14:31:56.815Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:31:56.815Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:31:56.845	\N	2026-08-05 14:31:56.845
cmsg6r4sq008v01s6nlz59pxe	CREATE	PRODUCT	cmsg6r4s6008u01s6j77stev0	\N	{"id": "cmsg6r4s6008u01s6j77stev0", "sku": "", "name": "Receipt Printer", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940262/inventory/products/u60enftncp8tfbs0zrvy.webp", "metadata": {"packagingUnits": []}, "costPrice": "5000", "createdAt": "2026-08-05T14:31:57.942Z", "deletedAt": null, "unitPrice": "6000", "updatedAt": "2026-08-05T14:31:57.942Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 14:31:57.962	\N	2026-08-05 14:31:57.962
cmsg6sgri008y01s6l0uqrmh4	CREATE	PRODUCT	cmsg6sgqo008w01s6026x78jt	\N	{"id": "cmsg6sgqo008w01s6026x78jt", "sku": "", "name": "budweiser", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940328/inventory/products/odvo47recsenm1lyfqyq.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "62.5", "createdAt": "2026-08-05T14:33:00.096Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T14:33:00.096Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:33:00.126	\N	2026-08-05 14:33:00.126
cmsg6shzy008z01s6347zi8gu	UPDATE	PRODUCT	cmsg6ni2n008h01s601q6pvz4	\N	{"id": "cmsg6ni2n008h01s601q6pvz4", "sku": "", "name": "5G ROUTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940379/inventory/products/zhenf5xw7ehutvkoxgjo.webp", "metadata": {"packagingUnits": []}, "costPrice": "2000", "createdAt": "2026-08-05T14:29:08.543Z", "deletedAt": null, "unitPrice": "5000", "updatedAt": "2026-08-05T14:33:01.704Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:33:01.726	\N	2026-08-05 14:33:01.726
cmsg6su2y009001s606pg8l93	UPDATE	PRODUCT	cmsg6l4zv008501s62ztrajgj	\N	{"id": "cmsg6l4zv008501s62ztrajgj", "sku": "", "name": "ETHERNET CABLE", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940395/inventory/products/nnylz1ggxmk5w9ljqoei.webp", "metadata": {"packagingUnits": []}, "costPrice": "700", "createdAt": "2026-08-05T14:27:18.283Z", "deletedAt": null, "unitPrice": "1000", "updatedAt": "2026-08-05T14:33:17.362Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:33:17.386	\N	2026-08-05 14:33:17.386
cmsg6t77m009101s62mrnbmsy	UPDATE	PRODUCT	cmsg6lsfd008701s6jxn10tyo	\N	{"id": "cmsg6lsfd008701s6jxn10tyo", "sku": "", "name": "MODEM", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940411/inventory/products/nmlqvclqhkz2gdhpmtu8.webp", "metadata": {"packagingUnits": []}, "costPrice": "900", "createdAt": "2026-08-05T14:27:48.649Z", "deletedAt": null, "unitPrice": "1500", "updatedAt": "2026-08-05T14:33:34.380Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:33:34.402	\N	2026-08-05 14:33:34.402
cmsg98n7200go01s6un3ufkyk	Created Customer: jj	CUSTOMER	cmsg98n6s00gn01s6ivl00py0	\N	{"id": "cmsg98n6s00gn01s6ivl00py0", "name": "jj", "email": "", "phone": "", "address": "", "createdAt": "2026-08-05T15:41:34.180Z", "deletedAt": null, "updatedAt": "2026-08-05T15:41:34.180Z", "businessId": "cmsg38ejb000n01s66874af28"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:41:34.19	\N	2026-08-05 15:41:34.19
cmsg98q5400gt01s6unn9kc5i	Created Sale: INV-1785944497951-917 (Le 550)	SALE	cmsg98q3l00gp01s6p5dw76wk	\N	{"totalAmount": 550, "invoiceNumber": "INV-1785944497951-917"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:41:38.008	\N	2026-08-05 15:41:38.008
cmsg6ts2l009201s6oboo5idj	UPDATE	PRODUCT	cmsg6mgjk008f01s6yp7hrn6m	\N	{"id": "cmsg6mgjk008f01s6yp7hrn6m", "sku": "", "name": "NETWORK SWITCH", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940439/inventory/products/nvcumh28rcxyguegvfjc.webp", "metadata": {"packagingUnits": []}, "costPrice": "400", "createdAt": "2026-08-05T14:28:19.904Z", "deletedAt": null, "unitPrice": "650", "updatedAt": "2026-08-05T14:34:01.413Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:34:01.437	\N	2026-08-05 14:34:01.437
cmsg6uxen009501s66u8acowo	CREATE	PRODUCT	cmsg6uxe2009401s653r2k1gb	\N	{"id": "cmsg6uxe2009401s653r2k1gb", "sku": "", "name": "Cash Drawer", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940441/inventory/products/ifbotl2urobprqgvwixt.webp", "metadata": {"packagingUnits": []}, "costPrice": "1500", "createdAt": "2026-08-05T14:34:54.986Z", "deletedAt": null, "unitPrice": "2000", "updatedAt": "2026-08-05T14:34:54.986Z", "businessId": "cmrmq5v0e000301s68rl1kxrs", "categoryId": "cmrmrpczo001e01s6l6pnyec1", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 14:34:55.007	\N	2026-08-05 14:34:55.007
cmsg6v0gf009701s6dtz2l98h	Created Category: Slippers 	CATEGORY	cmsg6v0g5009601s6ur55tgt9	\N	{"id": "cmsg6v0g5009601s6ur55tgt9", "name": "Slippers ", "createdAt": "2026-08-05T14:34:58.949Z", "deletedAt": null, "updatedAt": "2026-08-05T14:34:58.949Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Slippers are comfortable, lightweight footwear designed for casual everyday use. They are easy to slip on and off, making them perfect for relaxing at home, quick errands, or warm-weather outings."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:34:58.959	\N	2026-08-05 14:34:58.959
cmsg6w4gt009b01s6o7tozw4n	Updated Category: Slippers Store	CATEGORY	cmsg6v0g5009601s6ur55tgt9	\N	{"id": "cmsg6v0g5009601s6ur55tgt9", "name": "Slippers Store", "createdAt": "2026-08-05T14:34:58.949Z", "deletedAt": null, "updatedAt": "2026-08-05T14:35:50.803Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "Slippers are comfortable, lightweight footwear designed for casual everyday use. They are easy to slip on and off, making them perfect for relaxing at home, quick errands, or warm-weather outings."}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:35:50.813	\N	2026-08-05 14:35:50.813
cmsg6u65x009301s6q5o9zoob	UPDATE	PRODUCT	cmsg6kbzc008001s6ej1e3ffp	\N	{"id": "cmsg6kbzc008001s6ej1e3ffp", "sku": "", "name": "WI-FI ROUTER", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940457/inventory/products/ad4rs3ww9qxlnccg2xmd.webp", "metadata": {"packagingUnits": []}, "costPrice": "300", "createdAt": "2026-08-05T14:26:40.680Z", "deletedAt": null, "unitPrice": "500", "updatedAt": "2026-08-05T14:34:19.675Z", "businessId": "cmsg3amla000x01s698usq8fn", "categoryId": "cmsg6iais007t01s6vyp6rl4v", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 5, "stockQuantity": "20", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 14:34:19.701	\N	2026-08-05 14:34:19.701
cmsg6vofc009a01s6v406zaaf	CREATE	PRODUCT	cmsg6voek009801s64lqcjrya	\N	{"id": "cmsg6voek009801s64lqcjrya", "sku": "", "name": "Tuoxib", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940454/inventory/products/ripjkc28zedybqcljfzs.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T14:35:29.996Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T14:35:29.996Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 14:35:30.024	\N	2026-08-05 14:35:30.024
cmsg6w8jg009c01s6g4tyv1o4	LOGGED IN (Credentials)	USER	cmsg38eqr000t01s66jjvivaf	\N	\N	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:35:56.092	\N	2026-08-05 14:35:56.092
cmsg6x4jc009f01s6bmhwoj1f	CREATE	PRODUCT	cmsg6x4ik009d01s6tpa1qyfc	\N	{"id": "cmsg6x4ik009d01s6tpa1qyfc", "sku": "", "name": "Lous Vuitton ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940562/inventory/products/axqomx2ag96cxtqc5ul9.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:36:37.532Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T14:36:37.532Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg6v0g5009601s6ur55tgt9", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:36:37.56	\N	2026-08-05 14:36:37.56
cmsg7cdua009h01s6kyytu8wu	Created Category: Bags store 	CATEGORY	cmsg7cdts009g01s6mov6cf4p	\N	{"id": "cmsg7cdts009g01s6mov6cf4p", "name": "Bags store ", "createdAt": "2026-08-05T14:48:29.440Z", "deletedAt": null, "updatedAt": "2026-08-05T14:48:29.440Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "description": "A stylish and durable handbag designed for everyday use. Made from high-quality materials with a spacious interior to carry your essentials such as your phone, wallet, keys, and cosmetics. Features sturdy handles, a secure zip closure, and a modern design that complements both casual and formal outfits"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:48:29.458	\N	2026-08-05 14:48:29.458
cmsg7d5ej009k01s6bcm73i5c	CREATE	PRODUCT	cmsg7d5dc009i01s6cen1qln8	\N	{"id": "cmsg7d5dc009i01s6cen1qln8", "sku": "", "name": "savanna", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941286/inventory/products/d6zpozqp1o7gdcolybu5.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "800", "sellingPrice": "35", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "33.33", "createdAt": "2026-08-05T14:49:05.136Z", "deletedAt": null, "unitPrice": "35", "updatedAt": "2026-08-05T14:49:05.136Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:49:05.179	\N	2026-08-05 14:49:05.179
cmsg7e1p1009n01s6e49mtrub	CREATE	PRODUCT	cmsg7e1o5009l01s654hcp5pw	\N	{"id": "cmsg7e1o5009l01s654hcp5pw", "sku": "", "name": "MIU", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941332/inventory/products/v1zakeisxmenjsdxnuu0.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "300", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "200", "createdAt": "2026-08-05T14:49:46.997Z", "deletedAt": null, "unitPrice": "300", "updatedAt": "2026-08-05T14:49:46.997Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg7cdts009g01s6mov6cf4p", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:49:47.029	\N	2026-08-05 14:49:47.029
cmsg7gqrq009q01s6xdef9gox	CREATE	PRODUCT	cmsg7gqqy009o01s6wze6g37b	\N	{"id": "cmsg7gqqy009o01s6wze6g37b", "sku": "", "name": "strongbow", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941463/inventory/products/bmbqcxb0btgewmgqvg2h.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "37.5", "createdAt": "2026-08-05T14:51:52.810Z", "deletedAt": null, "unitPrice": "40", "updatedAt": "2026-08-05T14:51:52.810Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg54q2y003t01s6blo4zqhe", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:51:52.838	\N	2026-08-05 14:51:52.838
cmsg98upc00gy01s6i44072tt	Created Sale: INV-1785944503866-522 (Le 200)	SALE	cmsg98unu00gu01s6dan9mn8h	\N	{"totalAmount": 200, "invoiceNumber": "INV-1785944503866-522"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:41:43.92	\N	2026-08-05 15:41:43.92
cmsg7ht84009t01s67r9klib0	CREATE	PRODUCT	cmsg7ht78009r01s6scudo3um	\N	{"id": "cmsg7ht78009r01s6scudo3um", "sku": "", "name": "Hood", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941504/inventory/products/gxgooomkrydt69pqzd5i.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T14:52:42.644Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T14:52:42.644Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:52:42.676	\N	2026-08-05 14:52:42.676
cmsg7i5cq009v01s68ejgm857	Created Category: gin	CATEGORY	cmsg7i5ce009u01s61a3srmiv	\N	{"id": "cmsg7i5ce009u01s61a3srmiv", "name": "gin", "createdAt": "2026-08-05T14:52:58.382Z", "deletedAt": null, "updatedAt": "2026-08-05T14:52:58.382Z", "businessId": "cmsg38ejb000n01s66874af28", "description": ""}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:52:58.394	\N	2026-08-05 14:52:58.394
cmsg7md8d00a101s6ek751vnz	CREATE	PRODUCT	cmsg7md7m009z01s6xzw8c2ti	\N	{"id": "cmsg7md7m009z01s6xzw8c2ti", "sku": "", "name": "jameson", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941703/inventory/products/tosio6uwpmbrhkulv9wh.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1000", "sellingPrice": "45", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "41.67", "createdAt": "2026-08-05T14:56:15.202Z", "deletedAt": null, "unitPrice": "45", "updatedAt": "2026-08-05T14:56:15.202Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:56:15.229	\N	2026-08-05 14:56:15.229
cmsg7mh1m00a401s6p45s0fzx	CREATE	PRODUCT	cmsg7mh0u00a201s6zas7zun1	\N	{"id": "cmsg7mh0u00a201s6zas7zun1", "sku": "", "name": "jameson", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941703/inventory/products/tosio6uwpmbrhkulv9wh.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1000", "sellingPrice": "45", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "41.67", "createdAt": "2026-08-05T14:56:20.142Z", "deletedAt": null, "unitPrice": "45", "updatedAt": "2026-08-05T14:56:20.142Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:56:20.17	\N	2026-08-05 14:56:20.17
cmsg7nkzd00a701s6n8q7uez3	CREATE	PRODUCT	cmsg7nkyj00a501s6rwqi0sm1	\N	{"id": "cmsg7nkyj00a501s6rwqi0sm1", "sku": "", "name": "Shannon clothe", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941786/inventory/products/tga2t5wqlqyyexhngvwf.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "35000", "sellingPrice": "500", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "175", "createdAt": "2026-08-05T14:57:11.899Z", "deletedAt": null, "unitPrice": "500", "updatedAt": "2026-08-05T14:57:11.899Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:57:11.929	\N	2026-08-05 14:57:11.929
cmsg7qs6800aa01s6817nigxq	CREATE	PRODUCT	cmsg7qs5h00a801s6mmw3bwuw	\N	{"id": "cmsg7qs5h00a801s6mmw3bwuw", "sku": "", "name": "jack daniels", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941928/inventory/products/zflbbqdqesuwzyu1w6h3.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "83.33", "createdAt": "2026-08-05T14:59:41.189Z", "deletedAt": null, "unitPrice": "90", "updatedAt": "2026-08-05T14:59:41.189Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "48", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 14:59:41.216	\N	2026-08-05 14:59:41.216
cmsg7r34m00ad01s6qe5nqbah	CREATE	PRODUCT	cmsg7r32s00ab01s6dhdndg9i	\N	{"id": "cmsg7r32s00ab01s6dhdndg9i", "sku": "", "name": "Caterpillar ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941897/inventory/products/qf4rvrzrygt9gdqzhp8v.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "250", "createdAt": "2026-08-05T14:59:55.348Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:59:55.348Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:59:55.414	\N	2026-08-05 14:59:55.414
cmsg9byuh00h101s6zkx9v2lx	Created Customer: jj	CUSTOMER	cmsg9byu600h001s6zarjz6cg	\N	{"id": "cmsg9byu600h001s6zarjz6cg", "name": "jj", "email": "", "phone": "031389794", "address": "", "createdAt": "2026-08-05T15:44:09.246Z", "deletedAt": null, "updatedAt": "2026-08-05T15:44:09.246Z", "businessId": "cmsg38ejb000n01s66874af28"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:44:09.257	\N	2026-08-05 15:44:09.257
cmsg9cdq100h701s6i96qtav1	Created Sale: INV-1785944668466-687 (Le 345)	SALE	cmsg9cdo500h201s6n9dc25vk	\N	{"totalAmount": 345, "invoiceNumber": "INV-1785944668466-687"}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:44:28.537	\N	2026-08-05 15:44:28.537
cmsg7kd6r009y01s6ogyvy3s7	CREATE	PRODUCT	cmsg7kd5z009w01s6puxm6pi2	\N	{"id": "cmsg7kd5z009w01s6puxm6pi2", "sku": "", "name": "Breitling ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785941626/inventory/products/mvwwcvizxmhvkvxkyzke.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "150", "createdAt": "2026-08-05T14:54:41.831Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T14:54:41.831Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg4c5ec002s01s6m4tjxtmo", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:54:41.859	\N	2026-08-05 14:54:41.859
cmsg7tnhb00ag01s6zf8nfayk	CREATE	PRODUCT	cmsg7tngj00ae01s66lwmcnmi	\N	{"id": "cmsg7tngj00ae01s66lwmcnmi", "sku": "", "name": "Dior", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942065/inventory/products/pxywnoqkzytr1nofn8ma.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Dozen"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:01:55.075Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:01:55.075Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg6v0g5009601s6ur55tgt9", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:01:55.103	\N	2026-08-05 15:01:55.103
cmsg7tur000aj01s62bxc3rzq	CREATE	PRODUCT	cmsg7tuq900ah01s6g9x75i01	\N	{"id": "cmsg7tuq900ah01s6g9x75i01", "sku": "", "name": "Dior", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942065/inventory/products/pxywnoqkzytr1nofn8ma.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Dozen"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:02:04.497Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:02:04.497Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg6v0g5009601s6ur55tgt9", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:02:04.524	\N	2026-08-05 15:02:04.524
cmsg7u3bu00ak01s654mmvy45	DELETE	PRODUCT	cmsg7tuq900ah01s6g9x75i01	\N	\N	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:02:15.642	\N	2026-08-05 15:02:15.642
cmsg7v9c400aq01s6oa9fim6i	CREATE	PRODUCT	cmsg7v9b800ao01s6fhom7t9b	\N	{"id": "cmsg7v9b800ao01s6fhom7t9b", "sku": "", "name": "Capol infant suspension", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942106/inventory/products/o4pcuigfdsojghklt7nn.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "15", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "6.67", "createdAt": "2026-08-05T15:03:10.052Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:03:10.052Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:03:10.084	\N	2026-08-05 15:03:10.084
cmsg7wq3600at01s6181s61fx	CREATE	PRODUCT	cmsg7wq2c00ar01s6o2spsh54	\N	{"id": "cmsg7wq2c00ar01s6o2spsh54", "sku": "", "name": "Piriton", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942203/inventory/products/gyeglstcgjlsbpi0fg5f.webp", "metadata": {"expiryDate": "2026-12-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T15:04:18.420Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:04:18.420Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "150", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:04:18.45	\N	2026-08-05 15:04:18.45
cmsg8o9xo00dw01s61z5c6dm2	CREATE	PRODUCT	cmsg8o9td00du01s6myc0qh5u	\N	{"id": "cmsg8o9td00du01s6myc0qh5u", "sku": "", "name": "Broxovic", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943484/inventory/products/c4pnpcsixpk2magzpy8e.webp", "metadata": {"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "16.67", "createdAt": "2026-08-05T15:25:43.729Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:25:43.729Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:25:43.884	\N	2026-08-05 15:25:43.884
cmsg8oj5g00el01s67w65lbro	Created Sale: INV-1785943555365-519 (Le 559,440)	SALE	cmsg8oisp00dx01s69t4dtuu4	\N	{"totalAmount": 559440, "invoiceNumber": "INV-1785943555365-519"}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:25:55.828	\N	2026-08-05 15:25:55.828
cmsg7v0zd00an01s64yjesqm0	CREATE	PRODUCT	cmsg7v0yl00al01s63jqgyu04	\N	{"id": "cmsg7v0yl00al01s63jqgyu04", "sku": "", "name": "hennessy", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942120/inventory/products/bougnr3sajjqvdk5cqly.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "104.17", "createdAt": "2026-08-05T15:02:59.229Z", "deletedAt": null, "unitPrice": "110", "updatedAt": "2026-08-05T15:02:59.229Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "48", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:02:59.257	\N	2026-08-05 15:02:59.257
cmsg7yvcx00aw01s6js9df9g2	CREATE	PRODUCT	cmsg7yvc500au01s6fsrb08y1	\N	{"id": "cmsg7yvc500au01s6fsrb08y1", "sku": "", "name": "Anti Hist", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942284/inventory/products/algg9kjq9rclabnatl9t.webp", "metadata": {"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "12.5", "createdAt": "2026-08-05T15:05:58.565Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:05:58.565Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:05:58.593	\N	2026-08-05 15:05:58.593
cmsg7z96n00az01s6lg6krapn	CREATE	PRODUCT	cmsg7z95u00ax01s62g0dkr4y	\N	{"id": "cmsg7z95u00ax01s62g0dkr4y", "sku": "", "name": "Mash T Shirt ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942330/inventory/products/zu3f2exsymzgmlp7iqb2.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "200", "createdAt": "2026-08-05T15:06:16.482Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T15:06:16.482Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:06:16.511	\N	2026-08-05 15:06:16.511
cmsg80mf100b201s6cgn3jl99	CREATE	PRODUCT	cmsg80me800b001s6moo4iui6	\N	{"id": "cmsg80me800b001s6moo4iui6", "sku": "", "name": "jonnie walker black label", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942365/inventory/products/ygouziakr0lr5idofkm6.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "125", "createdAt": "2026-08-05T15:07:20.288Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T15:07:20.288Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:07:20.317	\N	2026-08-05 15:07:20.317
cmsg816qn00b501s6oldsxt1g	CREATE	PRODUCT	cmsg816pt00b301s6knhcauwr	\N	{"id": "cmsg816pt00b301s6knhcauwr", "sku": "", "name": "Penadol Rapid", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942373/inventory/products/yehufbsqaid3fkkvjy7v.webp", "metadata": {"expiryDate": "2026-08-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}, "costPrice": "8.33", "createdAt": "2026-08-05T15:07:46.625Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:07:46.625Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:07:46.655	\N	2026-08-05 15:07:46.655
cmsg818pu00b601s672jddach	DELETE	PRODUCT	cmsg7mh0u00a201s6zas7zun1	\N	\N	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:07:49.218	\N	2026-08-05 15:07:49.218
cmsg818rh00b901s6taomv79v	CREATE	PRODUCT	cmsg818qq00b701s6evmsh1ow	\N	{"id": "cmsg818qq00b701s6evmsh1ow", "sku": "", "name": "Naruto", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942428/inventory/products/e4habt3n0qwu5okyq9vq.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "200", "createdAt": "2026-08-05T15:07:49.250Z", "deletedAt": null, "unitPrice": "250", "updatedAt": "2026-08-05T15:07:49.250Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:07:49.277	\N	2026-08-05 15:07:49.277
cmsg9cs9g00hc01s6qy2424ra	Created Sale: INV-1785944687324-360 (Le 40)	SALE	cmsg9cs7y00h801s6mlyzdnv8	\N	{"totalAmount": 40, "invoiceNumber": "INV-1785944687324-360"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:44:47.38	\N	2026-08-05 15:44:47.38
cmsg9ctxk00he01s6fph1rsa0	Created Customer: John	CUSTOMER	cmsg9ctx400hd01s6ue4pp7me	\N	{"id": "cmsg9ctx400hd01s6ue4pp7me", "name": "John", "email": "", "phone": "", "address": "", "createdAt": "2026-08-05T15:44:49.528Z", "deletedAt": null, "updatedAt": "2026-08-05T15:44:49.528Z", "businessId": "cmsg3mply001h01s6fbg9j6j0"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:44:49.544	\N	2026-08-05 15:44:49.544
cmsg9tyht00ia01s6drbtgim0	LOGGED IN (Credentials)	USER	cmsg38eqr000t01s66jjvivaf	\N	\N	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:58:08.609	\N	2026-08-05 15:58:08.609
cmsg82yc400bc01s6r2fyj34y	CREATE	PRODUCT	cmsg82ybc00ba01s6w2j4wtta	\N	{"id": "cmsg82ybc00ba01s6w2j4wtta", "sku": "", "name": "Zyrtec tablets ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942479/inventory/products/izhdijc0ew8gpbvmr9qc.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "20", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:09:09.048Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:09:09.048Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:09:09.076	\N	2026-08-05 15:09:09.076
cmsg83uu500bf01s6pl8rzno3	CREATE	PRODUCT	cmsg83utd00bd01s6f4yg27vl	\N	{"id": "cmsg83utd00bd01s6f4yg27vl", "sku": "", "name": "Swat Leather ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942547/inventory/products/ryvtiz8wcktvjuqk61sq.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Bale"}]}, "costPrice": "200", "createdAt": "2026-08-05T15:09:51.169Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:09:51.169Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:09:51.197	\N	2026-08-05 15:09:51.197
cmsg846uy00bg01s639ath0oe	LOGGED IN (Credentials)	USER	cmsg2hnri000b01s6wu161h2l	\N	\N	cmsg2hnri000b01s6wu161h2l	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:10:06.778	\N	2026-08-05 15:10:06.778
cmsg84kf200bj01s63po8vek8	CREATE	PRODUCT	cmsg84kee00bh01s6xghajjxm	\N	{"id": "cmsg84kee00bh01s6xghajjxm", "sku": "", "name": "Valtoren ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942572/inventory/products/w5tipcuzbhtpqvm22tgy.webp", "metadata": {"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Bottle", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:10:24.326Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:10:24.326Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg40ypn002601s6ssptt538", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:10:24.35	\N	2026-08-05 15:10:24.35
cmsg852ny00bm01s6ndfpbtle	CREATE	PRODUCT	cmsg852n600bk01s6m6vmqmix	\N	{"id": "cmsg852n600bk01s6m6vmqmix", "sku": "", "name": "jonnie walker blue label", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942593/inventory/products/oqmqzi4tzfkcl8ysrifv.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "125", "createdAt": "2026-08-05T15:10:47.970Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T15:10:47.970Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "48", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:10:47.998	\N	2026-08-05 15:10:47.998
cmsg8735i00bp01s6dltuyb9q	CREATE	PRODUCT	cmsg8734p00bn01s694mukfa5	\N	{"id": "cmsg8734p00bn01s694mukfa5", "sku": "", "name": "Trava calm", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942655/inventory/products/ododipw9hvzxbumrlcdd.webp", "metadata": {"expiryDate": "2027-06-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:12:21.913Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:12:21.913Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:12:21.942	\N	2026-08-05 15:12:21.942
cmsg8746400bs01s65zyoh7t9	CREATE	PRODUCT	cmsg8745900bq01s68epcelo2	\N	{"id": "cmsg8745900bq01s68epcelo2", "sku": "", "name": "Trava calm", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942655/inventory/products/ododipw9hvzxbumrlcdd.webp", "metadata": {"expiryDate": "2027-06-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:12:23.229Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:12:23.229Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:12:23.26	\N	2026-08-05 15:12:23.26
cmsg87f8600bt01s6wzm5j9bv	LOGGED IN (Credentials)	USER	cmsg3ampe001301s6hyhcq613	\N	\N	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:12:37.59	\N	2026-08-05 15:12:37.59
cmsg9ef8u00hk01s63rgo8935	Created Sale: INV-1785944763760-52 (Le 100)	SALE	cmsg9ef7600hg01s6omm24tna	\N	{"totalAmount": 100, "invoiceNumber": "INV-1785944763760-52"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:46:03.822	\N	2026-08-05 15:46:03.822
cmsg9udku00id01s6yp0n80w4	LOGGED IN (Credentials)	USER	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:58:28.158	\N	2026-08-05 15:58:28.158
cmsg9uejv00ie01s6w43oq8uj	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:58:29.419	\N	2026-08-05 15:58:29.419
cmsg88ask00bw01s6e4aaswtj	CREATE	PRODUCT	cmsg88aru00bu01s6hayis21e	\N	{"id": "cmsg88aru00bu01s6hayis21e", "sku": "", "name": "Lexon", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942757/inventory/products/mlja1tkyfwmeid7tgf9a.webp", "metadata": {"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:13:18.475Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:13:18.475Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "50", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:13:18.5	\N	2026-08-05 15:13:18.5
cmsg88ukb00bz01s6ltva7xum	CREATE	PRODUCT	cmsg88ujp00bx01s6aq835pom	\N	{"id": "cmsg88ujp00bx01s6aq835pom", "sku": "", "name": "jonnie walker red label", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942748/inventory/products/lofm3tamgl6p649tdbzn.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "125", "createdAt": "2026-08-05T15:13:44.101Z", "deletedAt": null, "unitPrice": "130", "updatedAt": "2026-08-05T15:13:44.101Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg557bw003v01s6y9upzyqh", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:13:44.123	\N	2026-08-05 15:13:44.123
cmsg89q1000c201s6ezua48p4	CREATE	PRODUCT	cmsg89q0600c001s6oz54416g	\N	{"id": "cmsg89q0600c001s6oz54416g", "sku": "", "name": "Alerid", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942812/inventory/products/s0dezyo5dnmbi31r7mbz.webp", "metadata": {"expiryDate": "2027-05-29", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "15", "createdAt": "2026-08-05T15:14:24.870Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:14:24.870Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:14:24.9	\N	2026-08-05 15:14:24.9
cmsg8a43r00c501s6z7rk2vcl	CREATE	PRODUCT	cmsg8a42w00c301s6ube85wbw	\N	{"id": "cmsg8a42w00c301s6ube85wbw", "sku": "", "name": "Beige ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942819/inventory/products/tg2apch7yvdyxo8qejej.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:14:43.112Z", "deletedAt": null, "unitPrice": "250", "updatedAt": "2026-08-05T15:14:43.112Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg6v0g5009601s6ur55tgt9", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:14:43.143	\N	2026-08-05 15:14:43.143
cmsg8b3p900c801s6ux2epcoh	CREATE	PRODUCT	cmsg8b3oh00c601s6q8rwxn5z	\N	{"id": "cmsg8b3oh00c601s6q8rwxn5z", "sku": "", "name": "Avomine", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942876/inventory/products/ekdgi5jdukvgyt3z4qic.webp", "metadata": {"expiryDate": "2027-02-28", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "15", "createdAt": "2026-08-05T15:15:29.249Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:15:29.249Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "70", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:15:29.277	\N	2026-08-05 15:15:29.277
cmsg8b42900cb01s6zfftkt71	CREATE	PRODUCT	cmsg8b41h00c901s6q3wbscxl	\N	{"id": "cmsg8b41h00c901s6q3wbscxl", "sku": "", "name": "Bobdog", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942888/inventory/products/laxc2bqkvjam98lrxd8r.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Bale"}]}, "costPrice": "200", "createdAt": "2026-08-05T15:15:29.717Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T15:15:29.717Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:15:29.745	\N	2026-08-05 15:15:29.745
cmsg8c3yt00ce01s60c4alrpt	CREATE	PRODUCT	cmsg8c3y300cc01s6x4g6d48j	\N	{"id": "cmsg8c3y300cc01s6x4g6d48j", "sku": "", "name": "sprite", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942937/inventory/products/eltucgoycoyoapcozt7j.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "400", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}, "costPrice": "16.67", "createdAt": "2026-08-05T15:16:16.251Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:16:16.251Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:16:16.277	\N	2026-08-05 15:16:16.277
cmsg8c8c900ch01s69j55ob91	CREATE	PRODUCT	cmsg8c8bh00cf01s6ktbeukfl	\N	{"id": "cmsg8c8bh00cf01s6ktbeukfl", "sku": "", "name": "Sulisi", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942940/inventory/products/llzftcqnfe9knka3acrc.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:16:21.917Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:16:21.917Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:16:21.945	\N	2026-08-05 15:16:21.945
cmsg8e77z00cn01s646hmdizg	CREATE	PRODUCT	cmsg8e77600cl01s6ws2ez4em	\N	{"id": "cmsg8e77600cl01s6ws2ez4em", "sku": "", "name": "Boat Shoe", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943042/inventory/products/ymdstoyc9sabwmuthxzy.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "250", "createdAt": "2026-08-05T15:17:53.778Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:17:53.778Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:17:53.807	\N	2026-08-05 15:17:53.807
cmsg8cq9d00ck01s646y7hros	CREATE	PRODUCT	cmsg8cq8j00ci01s66hm33qy5	\N	{"id": "cmsg8cq8j00ci01s66hm33qy5", "sku": "", "name": "Calpol 650", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785942946/inventory/products/w6uskrblh4ftsherjw6x.webp", "metadata": {"expiryDate": "2027-11-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:16:45.139Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:16:45.139Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:16:45.169	\N	2026-08-05 15:16:45.169
cmsg8euw500cq01s6dpxpwzb4	CREATE	PRODUCT	cmsg8euve00co01s62axv43un	\N	{"id": "cmsg8euve00co01s62axv43un", "sku": "", "name": "Eno", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943046/inventory/products/gekm9bhhoagoquozteri.webp", "metadata": {"expiryDate": "2027-07-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:18:24.458Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:18:24.458Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": null, "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:18:24.485	\N	2026-08-05 15:18:24.485
cmsg8fujo00ct01s6n62eh0nl	CREATE	PRODUCT	cmsg8fuir00cr01s6gclrz7tl	\N	{"id": "cmsg8fuir00cr01s6gclrz7tl", "sku": "", "name": "Keds", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943123/inventory/products/zb8gfn87ls4fuwmcdwlc.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:19:10.659Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:19:10.659Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:19:10.692	\N	2026-08-05 15:19:10.692
cmsg8h2yt00d501s6c9wgdsdy	Created Sale: INV-1785943208176-380 (Le 450,000)	SALE	cmsg8h2wk00d101s6gzh3t3zc	\N	{"totalAmount": 450000, "invoiceNumber": "INV-1785943208176-380"}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:20:08.261	\N	2026-08-05 15:20:08.261
cmsg8fxah00cw01s6usggnbm3	CREATE	PRODUCT	cmsg8fx9n00cu01s68oerrhoy	\N	{"id": "cmsg8fx9n00cu01s68oerrhoy", "sku": "", "name": "gordons", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943100/inventory/products/i6gur21p3q8trboxeauu.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "5", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Bundle"}]}, "costPrice": "4.17", "createdAt": "2026-08-05T15:19:14.219Z", "deletedAt": null, "unitPrice": "5", "updatedAt": "2026-08-05T15:19:14.219Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg7i5ce009u01s61a3srmiv", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:19:14.249	\N	2026-08-05 15:19:14.249
cmsg8gn5q00cz01s6inos7n2p	CREATE	PRODUCT	cmsg8gn4z00cx01s6cil9bvl0	\N	{"id": "cmsg8gn4z00cx01s6cil9bvl0", "sku": "", "name": "ORS Tablets ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943131/inventory/products/chkmgbd9wmcurmxhd5ev.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:19:47.747Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:19:47.747Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:19:47.774	\N	2026-08-05 15:19:47.774
cmsg8i3va00d801s64nkkq3k1	CREATE	PRODUCT	cmsg8i3ud00d601s6bh1vbc9x	\N	{"id": "cmsg8i3ud00d601s6bh1vbc9x", "sku": "", "name": "North face", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943205/inventory/products/zbirye8yqxgwwhbnqtyc.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:20:56.053Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-05T15:20:56.053Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:20:56.086	\N	2026-08-05 15:20:56.086
cmsg8i6aq00db01s6r3llve87	CREATE	PRODUCT	cmsg8i6a200d901s6dsl1lh95	\N	{"id": "cmsg8i6a200d901s6dsl1lh95", "sku": "", "name": "Cialis", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943216/inventory/products/k8ehsqghu5ejlijtla4t.webp", "metadata": {"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "15", "createdAt": "2026-08-05T15:20:59.210Z", "deletedAt": null, "unitPrice": "20", "updatedAt": "2026-08-05T15:20:59.210Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:20:59.234	\N	2026-08-05 15:20:59.234
cmsg8imxn00de01s6pkogzfzl	CREATE	PRODUCT	cmsg8imws00dc01s6rrdtn1uf	\N	{"id": "cmsg8imws00dc01s6rrdtn1uf", "sku": "", "name": "beefeater", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943227/inventory/products/jqs8jzavx71cidcvpe9w.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Bundle"}]}, "costPrice": "83.33", "createdAt": "2026-08-05T15:21:20.764Z", "deletedAt": null, "unitPrice": "90", "updatedAt": "2026-08-05T15:21:20.764Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg7i5ce009u01s61a3srmiv", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:21:20.795	\N	2026-08-05 15:21:20.795
cmsg8ja3600dh01s6ki8bjlnn	CREATE	PRODUCT	cmsg8ja2c00df01s6ustgwmwn	\N	{"id": "cmsg8ja2c00df01s6ustgwmwn", "sku": "", "name": "Relief", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943271/inventory/products/jv0jwn4uvyaghunir3as.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:21:50.772Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:21:50.772Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:21:50.802	\N	2026-08-05 15:21:50.802
cmsg8jes000dk01s6qgzddree	CREATE	PRODUCT	cmsg8jer200di01s630q8gm8j	\N	{"id": "cmsg8jer200di01s630q8gm8j", "sku": "", "name": "Relief", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943271/inventory/products/jv0jwn4uvyaghunir3as.webp", "metadata": {"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "10", "createdAt": "2026-08-05T15:21:56.846Z", "deletedAt": null, "unitPrice": "15", "updatedAt": "2026-08-05T15:21:56.846Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:21:56.88	\N	2026-08-05 15:21:56.88
cmsg8jlzx00dn01s6g1h7yo5t	CREATE	PRODUCT	cmsg8jlz400dl01s66iqd5h6c	\N	{"id": "cmsg8jlz400dl01s66iqd5h6c", "sku": "", "name": "Running Shoe", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943269/inventory/products/gz5usegtwr34vi7jp7tx.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "400", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T15:22:06.208Z", "deletedAt": null, "unitPrice": "400", "updatedAt": "2026-08-05T15:22:06.208Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:22:06.238	\N	2026-08-05 15:22:06.238
cmsg8li4g00dq01s6lllq5mvn	CREATE	PRODUCT	cmsg8li3n00do01s6nh1yknq6	\N	{"id": "cmsg8li3n00do01s6nh1yknq6", "sku": "", "name": "Nurofen", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943362/inventory/products/clxdergobqe462vdg9am.webp", "metadata": {"expiryDate": "2027-02-27", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "30", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}, "costPrice": "20", "createdAt": "2026-08-05T15:23:34.499Z", "deletedAt": null, "unitPrice": "30", "updatedAt": "2026-08-05T15:23:34.499Z", "businessId": "cmsg3i0h4001801s67p002bbz", "categoryId": "cmsg3x11f002101s6i0lld6x6", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "80", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:23:34.528	\N	2026-08-05 15:23:34.528
cmsg8luvx00dt01s6gtdmy2h9	CREATE	PRODUCT	cmsg8luv500dr01s69fl3ky5x	\N	{"id": "cmsg8luv500dr01s69fl3ky5x", "sku": "", "name": "tanqueray", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943381/inventory/products/jrqg5pjxegqv5kov9xbc.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "104.17", "createdAt": "2026-08-05T15:23:51.041Z", "deletedAt": null, "unitPrice": "110", "updatedAt": "2026-08-05T15:23:51.041Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg7i5ce009u01s61a3srmiv", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:23:51.069	\N	2026-08-05 15:23:51.069
cmsg9eqku00hm01s6xkh3hect	Created Customer: Chief Balogun	CUSTOMER	cmsg9eqix00hl01s60yg0lvw2	\N	{"id": "cmsg9eqix00hl01s60yg0lvw2", "name": "Chief Balogun", "email": "", "phone": "34 144225", "address": "25C old railway line Tengbeh Town", "createdAt": "2026-08-05T15:46:18.441Z", "deletedAt": null, "updatedAt": "2026-08-05T15:46:18.441Z", "businessId": "cmrmq5v0e000301s68rl1kxrs"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:46:18.51	\N	2026-08-05 15:46:18.51
cmsg9jsj600hz01s6bi4u8ag9	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:50:14.322	\N	2026-08-05 15:50:14.322
cmsg9lstz00i001s6biay6uex	LOGGED IN (Credentials)	USER	cmrza5stq000d01s6mtfyhx70	\N	\N	cmrza5stq000d01s6mtfyhx70	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:51:48.023	\N	2026-08-05 15:51:48.023
cmsg9n87l00i101s6dzr1wysx	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-08-05 15:52:54.609	\N	2026-08-05 15:52:54.609
cmsg8ou8000eo01s6airzd12e	CREATE	PRODUCT	cmsg8ou7400em01s64fd0mci0	\N	{"id": "cmsg8ou7400em01s64fd0mci0", "sku": "", "name": "champagne", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943495/inventory/products/y9dv7xicucerm3gyop0g.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "83.33", "createdAt": "2026-08-05T15:26:10.144Z", "deletedAt": null, "unitPrice": "90", "updatedAt": "2026-08-05T15:26:10.144Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg3rtpf001r01s6dkv01peg", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:26:10.176	\N	2026-08-05 15:26:10.176
cmsg8pfz700ev01s6ut2d8idh	Created Sale: INV-1785943598244-151 (Le 2,700)	SALE	cmsg8pfvq00ep01s6mwz2z8os	\N	{"totalAmount": 2700, "invoiceNumber": "INV-1785943598244-151"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:26:38.371	\N	2026-08-05 15:26:38.371
cmsg8pkx000ey01s6qye0a0u0	Created Customer: Alpha	CUSTOMER	cmsg8pkwk00ex01s6thyjwvv4	\N	{"id": "cmsg8pkwk00ex01s6thyjwvv4", "name": "Alpha", "email": "", "phone": "", "address": "", "createdAt": "2026-08-05T15:26:44.756Z", "deletedAt": null, "updatedAt": "2026-08-05T15:26:44.756Z", "businessId": "cmsg3amla000x01s698usq8fn"}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:26:44.772	\N	2026-08-05 15:26:44.772
cmsg8r5v700f301s6of7j0zd4	Created Sale: INV-1785943678444-622 (Le 30)	SALE	cmsg8r5ri00ez01s6ekbn14nb	\N	{"totalAmount": 30, "invoiceNumber": "INV-1785943678444-622"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:27:58.579	\N	2026-08-05 15:27:58.579
cmsg8rq1300f801s6i56j43gw	Created Sale: INV-1785943704652-512 (Le 30,000)	SALE	cmsg8rpzj00f401s67rtwz13a	\N	{"totalAmount": 30000, "invoiceNumber": "INV-1785943704652-512"}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:28:24.711	\N	2026-08-05 15:28:24.711
cmsg8sckg00fa01s68oe1ucuf	Created Customer: John	CUSTOMER	cmsg8sck400f901s6qjhoc1p6	\N	{"id": "cmsg8sck400f901s6qjhoc1p6", "name": "John", "email": "", "phone": "031766659", "address": "", "createdAt": "2026-08-05T15:28:53.908Z", "deletedAt": null, "updatedAt": "2026-08-05T15:28:53.908Z", "businessId": "cmsg3mply001h01s6fbg9j6j0"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:28:53.92	\N	2026-08-05 15:28:53.92
cmsg8shbn00fg01s6kftvbpl2	Created Sale: INV-1785943740017-154 (Le 350)	SALE	cmsg8sh9w00fb01s6g8flovra	\N	{"totalAmount": 350, "invoiceNumber": "INV-1785943740017-154"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:29:00.083	\N	2026-08-05 15:29:00.083
cmsg8skui00fm01s6g7ged7rf	Created Sale: INV-1785943744594-680 (Le 60,000)	SALE	cmsg8skt000fh01s6vzi84mbj	\N	{"totalAmount": 60000, "invoiceNumber": "INV-1785943744594-680"}	cmsg3ampe001301s6hyhcq613	cmsg3amla000x01s698usq8fn	2026-08-05 15:29:04.65	\N	2026-08-05 15:29:04.65
cmsg8trr300fo01s65yo2kv83	Created Customer: Abu Turay	CUSTOMER	cmsg8trqt00fn01s6jpoc86tl	\N	{"id": "cmsg8trqt00fn01s6jpoc86tl", "name": "Abu Turay", "email": "", "phone": "088 43 15 42", "address": "", "createdAt": "2026-08-05T15:30:00.245Z", "deletedAt": null, "updatedAt": "2026-08-05T15:30:00.245Z", "businessId": "cmsg3i0h4001801s67p002bbz"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:30:00.255	\N	2026-08-05 15:30:00.255
cmsg8twd000fu01s6zycucp95	Created Sale: INV-1785943806164-302 (Le 36)	SALE	cmsg8twba00fp01s6k17xuvy9	\N	{"totalAmount": 36, "invoiceNumber": "INV-1785943806164-302"}	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-05 15:30:06.228	\N	2026-08-05 15:30:06.228
cmsg8u8tb00fx01s6rwmx2tnq	CREATE	PRODUCT	cmsg8u8si00fv01s6068qszq5	\N	{"id": "cmsg8u8si00fv01s6068qszq5", "sku": "", "name": "fruit juice", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943705/inventory/products/dhab2ycfpkwemcxbrjka.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Box"}]}, "costPrice": "62.5", "createdAt": "2026-08-05T15:30:22.338Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T15:30:22.338Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:30:22.367	\N	2026-08-05 15:30:22.367
cmsg8x8u900g001s6qc2uv8ty	CREATE	PRODUCT	cmsg8x8td00fy01s6vspsombj	\N	{"id": "cmsg8x8td00fy01s6vspsombj", "sku": "", "name": "tonic water", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785943912/inventory/products/jlumvoxsw2xw9nd8rlh2.webp", "metadata": {"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}, "costPrice": "62.5", "createdAt": "2026-08-05T15:32:42.337Z", "deletedAt": null, "unitPrice": "70", "updatedAt": "2026-08-05T15:32:42.337Z", "businessId": "cmsg38ejb000n01s66874af28", "categoryId": "cmsg53xl9003o01s6u8mhewey", "isFavorite": false, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "96", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg38eqr000t01s66jjvivaf	cmsg38ejb000n01s66874af28	2026-08-05 15:32:42.369	\N	2026-08-05 15:32:42.369
cmsg929sz00g401s6ff298m7m	UPDATE	PRODUCT	cmsg6bex8007301s6gcc11zp5	\N	{"id": "cmsg6bex8007301s6gcc11zp5", "sku": "", "name": "Air Forces ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939515/inventory/products/emm2axwkml7iy2ucyypx.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Barrel"}]}, "costPrice": "250", "createdAt": "2026-08-05T14:19:44.588Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-05T15:36:36.871Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:36:36.899	\N	2026-08-05 15:36:36.899
cmsg93oq000g901s6qljs8dr8	Created Sale: INV-1785944262835-407 (Le 200)	SALE	cmsg93ool00g501s6c5fzinxd	\N	{"totalAmount": 200, "invoiceNumber": "INV-1785944262835-407"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:37:42.888	\N	2026-08-05 15:37:42.888
cmsgi888z000001s66i0lgas0	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 19:53:11.363	\N	2026-08-05 19:53:11.363
cmsgi9bxh000101s6ur10ao7o	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-05 19:54:02.789	\N	2026-08-05 19:54:02.789
cmsgw7jds000001s65wr272zz	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-06 02:24:33.76	\N	2026-08-06 02:24:33.76
cmshcy7zi000a01s6f2ah9qn1	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 10:13:12.558	\N	2026-08-06 10:13:12.558
cmshd6ydi0000rclnssoo268w	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 10:20:00.006	\N	2026-08-06 10:20:00.006
cmshdm987000001s63ba2zcx0	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 10:31:53.911	\N	2026-08-06 10:31:53.911
cmshe1m4q000101s6q8jcdffc	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-06 10:43:50.474	\N	2026-08-06 10:43:50.474
cmshe96qk000601s63i2h82r5	CREATE_USER	USER	cmshe96pv000501s6c0w9pf09	\N	{"name": "Ishmael Steven Moseray", "email": "ishmaelsmoseray@gmail.com"}	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 10:49:43.772	\N	2026-08-06 10:49:43.772
cmshea7f3000701s6mx4brh2o	LOGGED IN (Credentials)	USER	cmshe96pv000501s6c0w9pf09	\N	\N	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	2026-08-06 10:50:31.311	\N	2026-08-06 10:50:31.311
cmshecug2000801s6ezxsipqs	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 10:52:34.466	\N	2026-08-06 10:52:34.466
cmsheyr0j0000msln37qjlkb0	LOGGED IN (Credentials)	USER	cmshe96pv000501s6c0w9pf09	\N	\N	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	2026-08-06 11:09:36.451	\N	2026-08-06 11:09:36.451
cmshfumgu000001s6eiove5ch	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 11:34:23.55	\N	2026-08-06 11:34:23.55
cmshh0nng000001s6wtl7cqok	LOGGED IN (Credentials)	USER	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	cmsg3i0nt001e01s6vzkjqzy0	cmsg3i0h4001801s67p002bbz	2026-08-06 12:07:04.636	\N	2026-08-06 12:07:04.636
cmshh494b000001s6utqbba18	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:09:52.427	\N	2026-08-06 12:09:52.427
cmshhbzpx000001s6uh5qj0c2	LOGGED IN (Credentials)	USER	cmshe96pv000501s6c0w9pf09	\N	\N	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	2026-08-06 12:15:53.493	\N	2026-08-06 12:15:53.493
cmshhfj7e000101s61z1ic8az	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:18:38.714	\N	2026-08-06 12:18:38.714
cmshhn516000201s6vahv85zw	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:24:33.594	\N	2026-08-06 12:24:33.594
cmshhpee1000301s6lnmytr81	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:26:19.033	\N	2026-08-06 12:26:19.033
cmshhtv0v000401s6qn1uxat7	LOGGED IN (Credentials)	USER	cmshe96pv000501s6c0w9pf09	\N	\N	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	2026-08-06 12:29:47.215	\N	2026-08-06 12:29:47.215
cmshhufx3000501s6h5ouoww7	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:30:14.295	\N	2026-08-06 12:30:14.295
cmshhxfwj000701s68k3b14kw	CREATE_USER	USER	cmshhxfvv000601s6kej7h7v5	\N	{"name": "Ibrahim", "email": "bah2halal@gmail.com"}	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:32:34.244	\N	2026-08-06 12:32:34.244
cmshi11qp000f01s6hz3a8wc2	CREATE_USER	USER	cmshi11qa000e01s6rvgf8lzt	\N	{"name": "Ibrahim", "email": "6years@gmail.com"}	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:35:22.513	\N	2026-08-06 12:35:22.513
cmshi1osa000g01s63ymhlllk	DELETE	USER	cmshi11qa000e01s6rvgf8lzt	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:35:52.378	\N	2026-08-06 12:35:52.378
cmshi2rhn000h01s6fiq511xr	LOGGED IN (Credentials)	USER	cmshe96pv000501s6c0w9pf09	\N	\N	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	2026-08-06 12:36:42.539	\N	2026-08-06 12:36:42.539
cmshi2xrz000i01s63nrmbldf	LOGGED IN (Credentials)	USER	cmshhxfvv000601s6kej7h7v5	\N	\N	cmshhxfvv000601s6kej7h7v5	cmshcxlvv000001s682ba2jim	2026-08-06 12:36:50.687	\N	2026-08-06 12:36:50.687
cmshi7u0e000k01s6v3v01rgi	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:40:39.086	\N	2026-08-06 12:40:39.086
cmshia4hc000l01s6s28jm45q	DELETE	USER	cmshhxfvv000601s6kej7h7v5	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:42:25.968	\N	2026-08-06 12:42:25.968
cmshicstp000p01s6qjszf2b5	CREATE_USER	USER	cmshicst8000o01s6sia7gbop	\N	{"name": "Ibrahim", "email": "protect@gmail.com"}	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 12:44:30.829	\N	2026-08-06 12:44:30.829
cmshie4z3000r01s6ty7ew057	LOGGED IN (Credentials)	USER	cmshicst8000o01s6sia7gbop	\N	\N	cmshicst8000o01s6sia7gbop	cmshcxlvv000001s682ba2jim	2026-08-06 12:45:33.231	\N	2026-08-06 12:45:33.231
cmshnglp9000001s623qppqif	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 15:07:26.301	\N	2026-08-06 15:07:26.301
cmshnj1od000101s6g9jtcxpx	LOGGED IN (Credentials)	USER	cmrnhyn91000m01s6y2ree9sj	\N	\N	cmrnhyn91000m01s6y2ree9sj	cmrjt12jq0000lcln3os8anz5	2026-08-06 15:09:20.317	\N	2026-08-06 15:09:20.317
cmshnlclv000201s6c6tqjagt	LOGGED IN (Credentials)	USER	cmsg3mpqm001n01s6uacw6clo	\N	\N	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:11:07.795	\N	2026-08-06 15:11:07.795
cmshnotwu000401s6hwscqgxi	UPDATE	PRODUCT	cmsg6r3wv008r01s6ti56ge53	\N	{"id": "cmsg6r3wv008r01s6ti56ge53", "sku": "", "name": "🔥 Nike Shox ", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785940270/inventory/products/u3krokuaw3kep7t4wlmv.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "45000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}, "costPrice": "225", "createdAt": "2026-08-05T14:31:56.815Z", "deletedAt": null, "unitPrice": "450", "updatedAt": "2026-08-06T15:13:50.146Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5rd5u004z01s6ov2oxpci", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:13:50.19	\N	2026-08-06 15:13:50.19
cmsql5a91000f01s6vy5dk9q4	TOGGLED STATUS FOR USER: shop@gmail.com TO ACTIVE	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 21:12:34.597	\N	2026-08-12 21:12:34.597
cmsql62cp000g01s67421pyul	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-12 21:13:11.017	\N	2026-08-12 21:13:11.017
cmsuc7v1p000001s6ww6uqbod	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-15 12:13:43.021	\N	2026-08-15 12:13:43.021
cmsudzyuf000001s6bg22p521	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-15 13:03:33.927	\N	2026-08-15 13:03:33.927
cmshnpan9000601s68iqtlels	UPDATE	PRODUCT	cmsg49je5002i01s6cvarwut0	\N	{"id": "cmsg49je5002i01s6cvarwut0", "sku": "", "name": "Gucci", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785935878/inventory/products/lor1qknzazxv6ohuwdlt.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "200", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}, "costPrice": "150", "createdAt": "2026-08-05T13:22:17.837Z", "deletedAt": null, "unitPrice": "200", "updatedAt": "2026-08-06T15:14:11.852Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg3tg3i001t01s6a3zdumi8", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "200", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:14:11.877	\N	2026-08-06 15:14:11.877
cmshnpv7q000801s6rtn1wo6i	UPDATE	PRODUCT	cmsg61eos005v01s6rekxul60	\N	{"id": "cmsg61eos005v01s6rekxul60", "sku": "", "name": "Kitten Heel", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785939041/inventory/products/di2enhwfxfv3irdg8ypx.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "9500", "sellingPrice": "100", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Bundle"}]}, "costPrice": "95", "createdAt": "2026-08-05T14:11:57.724Z", "deletedAt": null, "unitPrice": "100", "updatedAt": "2026-08-06T15:14:38.511Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg5yxjv005l01s651exwli4", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "100", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:14:38.534	\N	2026-08-06 15:14:38.534
cmshnqh5u000a01s63lrqbulp	UPDATE	PRODUCT	cmsg4gzq9003301s6e5dc9uxa	\N	{"id": "cmsg4gzq9003301s6e5dc9uxa", "sku": "", "name": "Patex Philippe", "type": "PRODUCT", "status": "active", "barcode": null, "baseUnit": "Piece", "imageUrl": "https://res.cloudinary.com/daojpref4/image/upload/v1785936306/inventory/products/jljxaeixwuocgsr6ngwb.webp", "metadata": {"packagingUnits": [{"barcode": "", "purchaseCost": "100000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "300", "purchaseUnitName": "Pallet"}]}, "costPrice": "333.33", "createdAt": "2026-08-05T13:28:05.601Z", "deletedAt": null, "unitPrice": "350", "updatedAt": "2026-08-06T15:15:06.948Z", "businessId": "cmsg3mply001h01s6fbg9j6j0", "categoryId": "cmsg4c5ec002s01s6m4tjxtmo", "isFavorite": true, "description": "", "maxStockLevel": null, "minStockLevel": 10, "stockQuantity": "300", "originalProductId": null, "genericAlternative": null, "isNetworkAvailable": false, "originalBusinessId": null, "requiresPrescription": false, "isControlledSubstance": false}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:15:06.978	\N	2026-08-06 15:15:06.978
cmshns2se000f01s6w9kq83qf	Created Sale: INV-1786029381545-263 (Le 200)	SALE	cmshns2pr000b01s6cl0ioyva	\N	{"totalAmount": 200, "invoiceNumber": "INV-1786029381545-263"}	cmsg3mpqm001n01s6uacw6clo	cmsg3mply001h01s6fbg9j6j0	2026-08-06 15:16:21.662	\N	2026-08-06 15:16:21.662
cmshui39c000001s6i1q9pqbj	LOGGED IN (Credentials)	USER	cmshcxm52000801s6xux31gzs	\N	\N	cmshcxm52000801s6xux31gzs	cmshcxlvv000001s682ba2jim	2026-08-06 18:24:33.024	\N	2026-08-06 18:24:33.024
cmsj6itym000001s60ztq77ww	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-07 16:48:49.198	\N	2026-08-07 16:48:49.198
cmsj80ljn000101s63l9vceh7	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 17:30:37.715	\N	2026-08-07 17:30:37.715
cmsjekl4v000001s6w1c2k0nf	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 20:34:07.999	\N	2026-08-07 20:34:07.999
cmsjhb6sc000001s6nika4adi	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 21:50:48.348	\N	2026-08-07 21:50:48.348
cmsjhd8iz000101s60wxslqxx	TOGGLED STATUS FOR USER: shop@gmail.com TO ACTIVE	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 21:52:23.915	\N	2026-08-07 21:52:23.915
cmsjhgmgb000201s6m8d5pxor	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-07 21:55:01.931	\N	2026-08-07 21:55:01.931
cmsjhjhgt000301s60j2uzkay	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 21:57:15.437	\N	2026-08-07 21:57:15.437
cmsjhk3jy000401s6xvuwk0xx	TOGGLED STATUS FOR USER: shop@gmail.com TO INACTIVE	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 21:57:44.062	\N	2026-08-07 21:57:44.062
cmsjhk8dr000501s6ytdqw528	TOGGLED STATUS FOR USER: shop@gmail.com TO ACTIVE	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-07 21:57:50.319	\N	2026-08-07 21:57:50.319
cmsjhloie000601s68go0e9kx	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-07 21:58:57.878	\N	2026-08-07 21:58:57.878
cmsjqjh0u000001s6aon0kbyc	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-08 02:09:11.406	\N	2026-08-08 02:09:11.406
cmslmu3mz000001s6wh4x2oa6	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-09 10:01:01.163	\N	2026-08-09 10:01:01.163
cmsojsvhv000001s6bjmhovp7	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-11 10:59:23.635	\N	2026-08-11 10:59:23.635
cmspvafsu000001s669kzvpne	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 09:08:45.054	\N	2026-08-12 09:08:45.054
cmsqkbgrx000001s6uwgek3id	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-12 20:49:23.373	\N	2026-08-12 20:49:23.373
cmsqkdpuc000901s6t4orvpip	Created Sale: INV-1786567868229-780 (Le 13,000)	SALE	cmsqkdpqk000101s671f4p297	\N	{"totalAmount": 13000, "invoiceNumber": "INV-1786567868229-780"}	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-12 20:51:08.436	\N	2026-08-12 20:51:08.436
cmsqkgcgj000a01s6tdyr8g4x	LOGGED IN (Credentials)	USER	cmrmq5v3k000901s6lnumwy2c	\N	\N	cmrmq5v3k000901s6lnumwy2c	cmrmq5v0e000301s68rl1kxrs	2026-08-12 20:53:11.059	\N	2026-08-12 20:53:11.059
cmsqko4wy000b01s684a39z2e	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 20:59:14.53	\N	2026-08-12 20:59:14.53
cmsqkpvlz000c01s67c47c9jd	TOGGLED STATUS FOR USER: brightwave@gmail.com TO ACTIVE	USER	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 21:00:35.783	\N	2026-08-12 21:00:35.783
cmsqkq8no000d01s64kzpufuo	TOGGLED STATUS FOR USER: Electronic@gmail.com TO ACTIVE	USER	cmsg3ampe001301s6hyhcq613	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 21:00:52.692	\N	2026-08-12 21:00:52.692
cmsql4wwn000e01s66p4fz4to	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-12 21:12:17.303	\N	2026-08-12 21:12:17.303
cmsussz0r000001s604xg39yc	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-15 19:58:01.803	\N	2026-08-15 19:58:01.803
cmsustrwk000101s6d4wj2pg3	EXTENDED TRIAL: Protech Assist SL Limited Super Admin Hub by 7 days	BUSINESS	cmrjt12jq0000lcln3os8anz5	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-15 19:58:39.236	\N	2026-08-15 19:58:39.236
cmsuuej09000001s6zdgwp181	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-15 20:42:47.097	\N	2026-08-15 20:42:47.097
cmsv3yd72000001s6k9p71nkq	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-16 01:10:09.23	\N	2026-08-16 01:10:09.23
cmsvlv7qw000001s64xmw2qfg	LOGGED IN (Credentials)	USER	cmrjt1vu80002lcln5oxlwhqy	\N	\N	cmrjt1vu80002lcln5oxlwhqy	cmrjt12jq0000lcln3os8anz5	2026-08-16 09:31:35.288	\N	2026-08-16 09:31:35.288
\.


--
-- Data for Name: BankTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BankTransaction" (id, "businessId", date, description, amount, type, status, reference, "matchedWithId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Batch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Batch" (id, "productId", "batchNumber", quantity, "manufacturingDate", "expiryDate", "businessId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: BundleItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BundleItem" (id, "bundleId", "productId", quantity) FROM stdin;
\.


--
-- Data for Name: Business; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Business" (id, name, slug, "logoUrl", type, plan, status, "trialStartDate", "trialEndDate", "enabledModules", currency, timezone, "createdAt", "updatedAt", "registrationReceipt", address, email, phone, "flutterwaveRef", "subscriptionStatus", "requestedBillingPeriod", "institutionType", "customReferralSource", "referralSource", "activationTierId") FROM stdin;
cmsg3amla000x01s698usq8fn	Alhaji enterprise Demo	alhaji-enterprise-demo-g0xc86	https://res.cloudinary.com/daojpref4/image/upload/v1785934233/inventory/logos/buoysj7rqdl7o31rzat8.webp	SHOP	FREE	ACTIVE	2026-08-05 12:55:09.02	2026-09-04 12:55:09.02	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-05 12:55:09.022	2026-08-05 12:55:09.022	\N	31 Oldrailway line Tengbeh town	Electronic@gmail.com	73132555	\N	INACTIVE	monthly	\N	\N	Colleague / Friend	\N
cmsg3mply001h01s6fbg9j6j0	Rahim Luxury Boutique Demo 	rahim-luxury-boutique-demo--tlmhba	https://res.cloudinary.com/daojpref4/image/upload/v1785934867/inventory/logos/z1kjjha0hfec5xsgamer.webp	SHOP	ENTERPRISE	ACTIVE	2026-08-05 13:04:32.804	2026-09-04 15:58:25.775	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-05 13:04:32.806	2026-08-05 15:58:25.777	\N	47 Wilberforce Road	luxuryboutique001@gmail.com	077603897	\N	ACTIVE	monthly	\N	\N	\N	cmsc1qam4000301s6y6s9v10s
cmsd9himw000101s6z1fvs8fl	Protech Assist SL	protech-assist-sl-b7qt84	https://res.cloudinary.com/daojpref4/image/upload/v1785763359/inventory/logos/hvjm7qd6emf8e0rko6je.webp	OFFICE	ENTERPRISE	ACTIVE	2026-08-03 13:25:09.653	2026-09-02 13:25:09.653	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-03 13:25:09.656	2026-08-04 10:23:50.258	\N	8D Old Railway Line Tengbech Town	protechassist36@gmail.com	073019699	\N	INACTIVE	monthly	\N	\N	Billboard / Print	\N
cmrmq5v0e000301s68rl1kxrs	Electronics Shop Demo	electronics-shop-demo-8lhcc	https://res.cloudinary.com/daojpref4/image/upload/v1784158812/inventory/logos/q2xgggfyc27e9kucjdtu.webp	SHOP	BUSINESS	ACTIVE	2026-07-15 23:42:12.538	2026-09-04 15:59:45.951	{POS,INVENTORY}	SLL	UTC	2026-07-15 23:42:12.542	2026-08-05 15:59:45.954	\N	25C old railway line Tengbeh Town	shop@gmail.com	+23230798318	\N	ACTIVE	monthly	\N	\N	\N	cmsc1q5n2000101s6k06eln0y
cmsg3i0h4001801s67p002bbz	BrightWave Pharmacy 	brightwave-pharmacy--b9hvki	https://res.cloudinary.com/daojpref4/image/upload/v1785934641/inventory/logos/fuoo1sysztpu9tq11srs.webp	PHARMACY	ENTERPRISE	ACTIVE	2026-08-05 13:00:53.606	2026-09-04 15:59:48.465	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-05 13:00:53.609	2026-08-05 15:59:48.465	\N	26 Nelson lane, Tengbeh town.	brightwave@gmail.com	032678843	\N	ACTIVE	monthly	\N	\N	\N	cmsc1qam4000301s6y6s9v10s
cmshcxlvv000001s682ba2jim	Protech Clinical Demo	protech-clinical-demo-8r4d1q		CLINIC	ENTERPRISE	ACTIVE	2026-08-06 10:12:43.903	2026-09-05 10:47:29.322	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-06 10:12:43.915	2026-08-06 10:47:29.326	\N	25C old railway line Tengbeh Town	clinic@gmail.com	+232 34 955581	\N	ACTIVE	monthly	\N	\N	Billboard / Print	cmsc1qam4000301s6y6s9v10s
cmsg38ejb000n01s66874af28	jay2jay Bar demo	jay2jay-bar-demo-w33ngg	https://res.cloudinary.com/daojpref4/image/upload/v1785934168/inventory/logos/djcmeiwbnftg0vsfe0dp.webp	BAR	FREE	ACTIVE	2026-08-05 12:53:25.268	2026-09-04 12:53:25.268	{POS,INVENTORY}	SLL	Africa/Freetown	2026-08-05 12:53:25.271	2026-08-05 12:53:25.271	\N	26 old railway line tengbehtown	bar@gmail.com	031389794	\N	INACTIVE	monthly	\N	king julian	Colleague / Friend	\N
cmrjt12jq0000lcln3os8anz5	Protech Assist SL Limited Super Admin Hub	protech-nexus-core	\N	SHOP	ENTERPRISE	ACTIVE	2026-07-13 22:39:09.35	2026-08-22 19:58:39.208	{POS,INVENTORY,RESTAURANT}	SLL	UTC	2026-07-13 22:39:09.35	2026-08-15 19:58:39.211	\N	\N	\N	\N	\N	INACTIVE	monthly	\N	\N	\N	\N
\.


--
-- Data for Name: CashRegisterSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CashRegisterSession" (id, "businessId", "userId", "openedAt", "closedAt", "startingCash", "actualEndingCash", "expectedEndingCash", status, notes, "createdAt", "updatedAt") FROM stdin;
cmrwq0y0v0000uslncsbj3ihx	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:36:04.927	2026-07-22 23:56:15.326	500.00	7000.00	500.00	CLOSED	\N	2026-07-22 23:36:04.927	2026-07-22 23:56:15.33
cmrwqt2nt000101s69nfvwkid	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:57:57.306	2026-07-23 10:42:54.897	0.00	0.00	0.00	CLOSED	\N	2026-07-22 23:57:57.306	2026-07-23 10:42:54.901
cmrxdv6dk000101s6jxx5zs4b	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-23 10:43:26.6	2026-07-24 18:13:32.38	0.00	20000.00	0.00	CLOSED	\N	2026-07-23 10:43:26.6	2026-07-24 18:13:32.382
cmrz9ejzj000a01s6huf7kxy8	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 18:14:04.975	2026-07-25 17:59:08.779	200000.00	500.00	200000.00	CLOSED	\N	2026-07-24 18:14:04.975	2026-07-25 17:59:08.78
cms0obk72000p01s6reji8nok	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 17:59:25.694	\N	500.00	\N	\N	OPEN	\N	2026-07-25 17:59:25.694	2026-07-25 17:59:25.694
cms10rmk6000201s66d8syhsn	cms0msokq000001s6kwrsu6h2	cms0msoqt000601s6gyk5gsgj	2026-07-25 23:47:50.646	\N	0.00	\N	\N	OPEN	\N	2026-07-25 23:47:50.646	2026-07-25 23:47:50.646
cms125hjx001b01s668xkqbx8	cms111gtu000301s6ra7phyzg	cms111gzi000901s6li9elv9w	2026-07-26 00:26:36.957	\N	0.00	\N	\N	OPEN	\N	2026-07-26 00:26:36.957	2026-07-26 00:26:36.957
cms9acfxr000b01s67pkcqm6g	cmrmq5v0e000301s68rl1kxrs	cms9aa3k9000801s6phw014ay	2026-07-31 18:38:07.791	\N	0.00	\N	\N	OPEN	\N	2026-07-31 18:38:07.791	2026-07-31 18:38:07.791
cmsg8gni000d001s6p9qsctkw	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:19:48.216	\N	0.00	\N	\N	OPEN	\N	2026-08-05 15:19:48.216	2026-08-05 15:19:48.216
cmsg8pk9100ew01s6lx9wpsgq	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:26:43.909	\N	0.00	\N	\N	OPEN	\N	2026-08-05 15:26:43.909	2026-08-05 15:26:43.909
cmsg94oge00ga01s6kezjgc26	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:38:29.198	\N	0.00	\N	\N	OPEN	\N	2026-08-05 15:38:29.198	2026-08-05 15:38:29.198
cmshjbpv0001801s6slcb9lb0	cmshcxlvv000001s682ba2jim	cmshcxm52000801s6xux31gzs	2026-08-06 13:11:39.948	\N	0.00	\N	\N	OPEN	\N	2026-08-06 13:11:39.948	2026-08-06 13:11:39.948
cmsg3qsvu001q01s6kx7obxgp	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 13:07:43.674	2026-08-06 15:19:00.857	0.00	15000.00	0.00	CLOSED	\N	2026-08-05 13:07:43.674	2026-08-06 15:19:00.858
cmshoelr0000i01s62edfggnx	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-06 15:33:52.668	\N	0.00	\N	\N	OPEN	\N	2026-08-06 15:33:52.668	2026-08-06 15:33:52.668
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name, description, "businessId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmrmqe93w000b01s6m0zbxhqt	CCTV & Security	Full HD network camera with infrared night vision and motion detection.	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:48:44.06	2026-07-15 23:48:44.06	\N
cmrmqwmmw000m01s6mx38lur8	Smart Locks	Fingerprint, PIN, card, key, and mobile app access.	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:03:01.4	2026-07-16 00:03:01.4	\N
cmrmr3j3h000t01s6iyr5gjk6	Smart Home		cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:08:23.405	2026-07-16 00:08:23.405	\N
cmrmrc1df001201s697u9ugf9	Smartphones	6.7" Android smartphone with 5G connectivity and long-lasting battery.	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:15:00.339	2026-07-16 00:15:00.339	\N
cmrwtuhc5000601s6e93t39qe	Desktop Computer	High-performance desktop PC for office and home use.	cmrmq5v0e000301s68rl1kxrs	2026-07-23 01:23:01.829	2026-07-23 01:23:01.829	\N
cmrmrpczo001e01s6l6pnyec1	Electronics	Electronic devices, accessories, and gadgets used by consumers and businesses.	cmrmq5v0e000301s68rl1kxrs	2026-07-16 00:25:21.924	2026-07-25 10:30:44.361	\N
cmsg5yxjv005l01s651exwli4	Heel store 	Add elegance to your wardrobe with these stylish high heels, designed to enhance your look for every occasion. Crafted from high-quality materials, they feature a comfortable fit, durable sole, and a sleek, fashionable design.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:10:02.203	2026-08-05 14:10:02.203	\N
cmsg3rtpf001r01s6dkv01peg	wine	all types	cmsg38ejb000n01s66874af28	2026-08-05 13:08:31.395	2026-08-05 13:08:31.395	\N
cmsg3tpwg001w01s6wkwsw8l2	Mobile phones		cmsg3amla000x01s698usq8fn	2026-08-05 13:09:59.776	2026-08-05 13:09:59.776	\N
cmsg3tg3i001t01s6a3zdumi8	Clothing store 	Rahim Boutique is a modern fashion shop offering stylish clothing, shoes, handbags, accessories, perfumes, and fashion items for men, women, and children.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:09:47.07	2026-08-05 13:11:01.365	\N
cmsg3vknt001z01s6hb6lyfxt	Herbal Medicines	Made from natural plants and herbs. 	cmsg3i0h4001801s67p002bbz	2026-08-05 13:11:26.297	2026-08-05 13:11:26.297	\N
cmsg3x11f002101s6i0lld6x6	Tablets and Capsules 	Solid Medicines taken by mouth	cmsg3i0h4001801s67p002bbz	2026-08-05 13:12:34.179	2026-08-05 13:12:34.179	\N
cmsg40ypn002601s6ssptt538	Syrups and liquids Medicines 	Liquids Medicines Often used for children and Adults who have difficult swallowing problems 	cmsg3i0h4001801s67p002bbz	2026-08-05 13:15:37.787	2026-08-05 13:15:37.787	\N
cmsg425qo002801s67otdtxm1	Injectables Medicines 	Medicines given by injections	cmsg3i0h4001801s67p002bbz	2026-08-05 13:16:33.552	2026-08-05 13:16:33.552	\N
cmsg4c5ec002s01s6m4tjxtmo	Watch store	Discover stylish, high-quality watches designed for everyday wear and special occasions. Our collection features elegant, durable, and comfortable timepieces for both men and women. Whether you prefer a classic, luxury, or modern design, our watches combine fashion with reliable performance at affordable prices.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:24:19.668	2026-08-05 13:24:19.668	\N
cmsg4ecj9002y01s6qa8w3byt	LAPTOPS		cmsg3amla000x01s698usq8fn	2026-08-05 13:26:02.229	2026-08-05 13:26:02.229	\N
cmsg53xl9003o01s6u8mhewey	soft drinks and beverages		cmsg38ejb000n01s66874af28	2026-08-05 13:45:55.917	2026-08-05 13:45:55.917	\N
cmsg54q2y003t01s6blo4zqhe	beer and cider		cmsg38ejb000n01s66874af28	2026-08-05 13:46:32.842	2026-08-05 13:46:32.842	\N
cmsg557bw003v01s6y9upzyqh	whisky		cmsg38ejb000n01s66874af28	2026-08-05 13:46:55.196	2026-08-05 13:46:55.196	\N
cmsg5c8st004b01s6c0z5m6s4	Glasses 	Upgrade your style with these fashionable eyeglasses, designed for both comfort and elegance. The lightweight frame provides a comfortable fit for everyday wear, while the modern design complements casual, business, and formal outfits.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:52:23.693	2026-08-05 13:52:23.693	\N
cmsg5k170004o01s6a0fva9xw	Gaming		cmsg3amla000x01s698usq8fn	2026-08-05 13:58:27.084	2026-08-05 13:58:27.084	\N
cmsg5rd5u004z01s6ov2oxpci	Shoes store	Step into comfort and style with these premium shoes, designed for everyday wear. Made from high-quality materials, they provide a comfortable fit, breathable design, and durable sole for long-lasting performance.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:04:09.186	2026-08-05 14:04:09.186	\N
cmsg5wou2005e01s62eugzi8p	HOME APPLIANCE 		cmsg3amla000x01s698usq8fn	2026-08-05 14:08:17.594	2026-08-05 14:08:17.594	\N
cmsg6e5ty007b01s6x28v684h	Trousers store 	Trousers are comfortable and stylish lower-body garments designed for everyday wear, work, formal occasions, or casual outings. Made from high-quality materials such as cotton, denim, polyester, or linen, they provide a great fit, durability, and all-day comfort	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:21:52.774	2026-08-05 14:21:52.774	\N
cmsg6iais007t01s6vyp6rl4v	NETWORKING EQUIPMENT 		cmsg3amla000x01s698usq8fn	2026-08-05 14:25:05.476	2026-08-05 14:25:05.476	\N
cmsg6v0g5009601s6ur55tgt9	Slippers Store	Slippers are comfortable, lightweight footwear designed for casual everyday use. They are easy to slip on and off, making them perfect for relaxing at home, quick errands, or warm-weather outings.	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:34:58.949	2026-08-05 14:35:50.803	\N
cmsg7cdts009g01s6mov6cf4p	Bags store 	A stylish and durable handbag designed for everyday use. Made from high-quality materials with a spacious interior to carry your essentials such as your phone, wallet, keys, and cosmetics. Features sturdy handles, a secure zip closure, and a modern design that complements both casual and formal outfits	cmsg3mply001h01s6fbg9j6j0	2026-08-05 14:48:29.44	2026-08-05 14:48:29.44	\N
cmsg7i5ce009u01s61a3srmiv	gin		cmsg38ejb000n01s66874af28	2026-08-05 14:52:58.382	2026-08-05 14:52:58.382	\N
\.


--
-- Data for Name: Consultation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Consultation" (id, "patientId", "doctorId", "appointmentId", vitals, "chiefComplaint", symptoms, diagnosis, "treatmentPlan", "doctorNotes", "businessId", "saleId", "createdAt", "updatedAt") FROM stdin;
cmshirwzs001101s6z8u577oe	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	cmshide0p000q01s6upuxju0s	{"bp": "115", "temp": "56.4", "weight": "90", "heartRate": "74"}	Running Stomach	fever, headache	running stomach	Medication, Rest.		cmshcxlvv000001s682ba2jim	cmshis29k001201s6u8378dpv	2026-08-06 12:56:16.072	2026-08-06 12:56:22.94
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Customer" (id, name, email, phone, address, "businessId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmrnjtixj000101s6ccu7re0t	king julian		031389794		cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:32:25.495	2026-07-16 13:32:25.495	\N
cmrxdxlmp000201s6szuafcej	Foday Sesay			25C old railway line Tengbeh Town	cmrmq5v0e000301s68rl1kxrs	2026-07-23 10:45:19.681	2026-07-23 10:45:19.681	\N
cmsg8pkwk00ex01s6thyjwvv4	Alpha				cmsg3amla000x01s698usq8fn	2026-08-05 15:26:44.756	2026-08-05 15:26:44.756	\N
cmsg8sck400f901s6qjhoc1p6	John		031766659		cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:28:53.908	2026-08-05 15:28:53.908	\N
cmsg8trqt00fn01s6jpoc86tl	Abu Turay		088 43 15 42		cmsg3i0h4001801s67p002bbz	2026-08-05 15:30:00.245	2026-08-05 15:30:00.245	\N
cmsg98n6s00gn01s6ivl00py0	jj				cmsg38ejb000n01s66874af28	2026-08-05 15:41:34.18	2026-08-05 15:41:34.18	\N
cmsg9byu600h001s6zarjz6cg	jj		031389794		cmsg38ejb000n01s66874af28	2026-08-05 15:44:09.246	2026-08-05 15:44:09.246	\N
cmsg9ctx400hd01s6ue4pp7me	John				cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:44:49.528	2026-08-05 15:44:49.528	\N
cmsg9eqix00hl01s60yg0lvw2	Chief Balogun		34 144225	25C old railway line Tengbeh Town	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:46:18.441	2026-08-05 15:46:18.441	\N
\.


--
-- Data for Name: Debt; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Debt" (id, "customerId", "saleId", "totalAmount", "paidAmount", "dueDate", status, "businessId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmrnjuop8000601s6zuyjs5dh	cmrnjtixj000101s6ccu7re0t	cmrnjuooa000301s6p2rwrpz0	10000.00	10000.00	\N	PAID	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:33:19.628	2026-07-16 13:36:58.849	\N
cmrnk2ld8000801s6f1dyv3v2	cmrnjtixj000101s6ccu7re0t	cmrnk2lcp000201s6eozlh8u2	28500.00	28500.00	\N	PAID	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:39:28.556	2026-07-16 14:27:01.56	\N
cmrnukmvj000901s6jk0rdu6n	cmrnjtixj000101s6ccu7re0t	cmrnukmux000601s6ji6tkjht	5000.00	1000.00	\N	PARTIAL	cmrmq5v0e000301s68rl1kxrs	2026-07-16 18:33:26.479	2026-07-16 18:33:26.479	\N
cmrukgnmv000501s65kgtjw3j	cmrnjtixj000101s6ccu7re0t	cmrukgnlz000101s6ztsst37m	18998.00	0.00	\N	PENDING	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:24:47.912	2026-07-21 11:24:47.912	\N
cmsg8sktm00fk01s6fdfvleyt	cmsg8pkwk00ex01s6thyjwvv4	cmsg8skt000fh01s6vzi84mbj	60000.00	0.00	\N	PENDING	cmsg3amla000x01s698usq8fn	2026-08-05 15:29:04.618	2026-08-05 15:29:04.618	\N
cmsg8twbz00fs01s6ffpxz3yt	cmsg8trqt00fn01s6jpoc86tl	cmsg8twba00fp01s6k17xuvy9	36.00	0.00	\N	PENDING	cmsg3i0h4001801s67p002bbz	2026-08-05 15:30:06.191	2026-08-05 15:30:06.191	\N
cmsg8shai00fe01s6vi0pxa86	cmsg8sck400f901s6qjhoc1p6	cmsg8sh9w00fb01s6g8flovra	350.00	350.00	\N	PAID	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:29:00.042	2026-08-05 15:35:44.682	\N
cms0od2gn000u01s6jwv3cvv1	cmrnjtixj000101s6ccu7re0t	cms0od2fo000q01s66n22o2g1	21000.00	500.00	\N	PARTIAL	cmrmq5v0e000301s68rl1kxrs	2026-07-25 18:00:36.023	2026-08-05 15:35:56.865	\N
cmsg9cdow00h501s60g0gu5w9	cmsg9byu600h001s6zarjz6cg	cmsg9cdo500h201s6n9dc25vk	345.00	345.00	\N	PAID	cmsg38ejb000n01s66874af28	2026-08-05 15:44:28.496	2026-08-05 15:45:30.805	\N
cmsg9fxe500ht01s6x2xdq43s	cmsg9eqix00hl01s60yg0lvw2	cmsg9fxdc00hn01s6yzal8dei	16000.00	0.00	\N	PENDING	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:47:13.997	2026-08-05 15:47:13.997	\N
\.


--
-- Data for Name: DebtPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DebtPayment" (id, "debtId", amount, "paymentMethod", "businessId", "createdAt", "deletedAt", "updatedAt", note) FROM stdin;
cmrnjz5yh000001s6puim5k7b	cmrnjuop8000601s6zuyjs5dh	5000.00	CASH	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:36:48.617	\N	2026-07-16 13:36:48.617	
cmrnjzduh000101s6rtzgl8uf	cmrnjuop8000601s6zuyjs5dh	5000.00	CASH	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:36:58.841	\N	2026-07-16 13:36:58.841	
cmrnk53n0000e01s6rdxbsm5r	cmrnk2ld8000801s6f1dyv3v2	25000.00	CASH	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:41:25.548	\N	2026-07-16 13:41:25.548	
cmrnlrqr4000001s6yiool0gn	cmrnk2ld8000801s6f1dyv3v2	3500.00	CASH	cmrmq5v0e000301s68rl1kxrs	2026-07-16 14:27:01.552	\N	2026-07-16 14:27:01.552	
cmsg915i700g101s6yv4469t1	cmsg8shai00fe01s6vi0pxa86	350.00	CASH	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:35:44.671	\N	2026-08-05 15:35:44.671	
cmsg91ewp00g201s6pz40ihyj	cms0od2gn000u01s6jwv3cvv1	500.00	CASH	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:35:56.857	\N	2026-08-05 15:35:56.857	Cash 
cmsg9dprh00hf01s6uyfmbr2r	cmsg9cdow00h501s60g0gu5w9	345.00	CASH	cmsg38ejb000n01s66874af28	2026-08-05 15:45:30.797	\N	2026-08-05 15:45:30.797	
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Expense" (id, description, amount, category, date, "paymentMethod", "businessId", "userId", "createdAt", "updatedAt", "deletedAt", attachments) FROM stdin;
cms9mokn4000201s6hehstpt8	Rent	10000.00	Rent	2026-08-01 00:23:29.15	CASH	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-01 00:23:29.152	2026-08-01 00:23:29.152	\N	{}
\.


--
-- Data for Name: GiftCard; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GiftCard" (id, code, "originalAmount", balance, "expiryDate", status, "issuedTo", "businessId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GiftCardTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GiftCardTransaction" (id, "giftCardId", amount, type, "saleRef", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invoice" (id, "businessId", status, "dueDate", "createdAt", "updatedAt", "deletedAt", "balanceDue", "customerId", "discountAmount", "invoiceNumber", "issueDate", notes, "subTotal", "taxAmount", "taxRate", terms, "totalAmount") FROM stdin;
cmsc1sp93000101s6kgffxwel	cmrmq5v0e000301s68rl1kxrs	PAID	2026-09-01 17:02:08.312	2026-08-02 17:02:08.343	2026-08-02 17:02:08.343	\N	0.00	\N	0.00	INV-VCH-1785690128341	2026-08-02 17:02:08.341	Redeemed via Activation Voucher: 4J0H-0PG2-1I1C-TTK3	0.00	0.00	0.00	\N	0.00
cmsg9ubrb00ic01s6vh50z43u	cmsg3mply001h01s6fbg9j6j0	PAID	2026-09-04 15:58:25.775	2026-08-05 15:58:25.799	2026-08-05 15:58:25.799	\N	0.00	\N	0.00	INV-VCH-1785945505798	2026-08-05 15:58:25.798	Redeemed via Activation Voucher: F3LH-PJHD-O4F3-IH6M	0.00	0.00	0.00	\N	0.00
cmsg9w1m800ig01s6e00ef3ml	cmrmq5v0e000301s68rl1kxrs	PAID	2026-09-04 15:59:45.951	2026-08-05 15:59:45.968	2026-08-05 15:59:45.968	\N	0.00	\N	0.00	INV-VCH-1785945585967	2026-08-05 15:59:45.967	Redeemed via Activation Voucher: NP82-L65U-FHG9-ZTWP	0.00	0.00	0.00	\N	0.00
cmsg9w3jy00ii01s625p4zpn7	cmsg3i0h4001801s67p002bbz	PAID	2026-09-04 15:59:48.465	2026-08-05 15:59:48.478	2026-08-05 15:59:48.478	\N	0.00	\N	0.00	INV-VCH-1785945588477	2026-08-05 15:59:48.477	Redeemed via Activation Voucher: 2OWB-1Z4H-8622-CBR3	0.00	0.00	0.00	\N	0.00
cmshe6b0j000401s61dy597yk	cmshcxlvv000001s682ba2jim	PAID	2026-09-05 10:47:29.322	2026-08-06 10:47:29.347	2026-08-06 10:47:29.347	\N	0.00	\N	0.00	INV-VCH-1786013249345	2026-08-06 10:47:29.345	Redeemed via Activation Voucher: 98F0-J7JE-W55A-4AZC	0.00	0.00	0.00	\N	0.00
cmshnze19000g01s6rrvsgx8b	cmsg3mply001h01s6fbg9j6j0	UNPAID	2026-08-20 00:00:00	2026-08-06 15:22:02.829	2026-08-06 15:22:02.829	\N	6000.00	cmsg9ctx400hd01s6ue4pp7me	0.00	INV-722827	2026-08-06 00:00:00	Thank you for your business!	5000.00	1000.00	20.00	Please pay within 14 days of receiving this invoice.	6000.00
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InvoiceItem" (id, "invoiceId", "productId", description, quantity, "unitPrice", total) FROM stdin;
cmshnze1k000h01s6qm9dweew	cmshnze19000g01s6rrvsgx8b	\N	We have a issues where people mistake products for category 	10	500.00	5000.00
\.


--
-- Data for Name: LabTest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LabTest" (id, "patientId", "doctorId", "consultationId", "testName", "testCategory", results, status, "labTechnicianId", "businessId", "saleId", "createdAt", "updatedAt") FROM stdin;
cmshiqgp0000s01s6kysnrmki	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:08.292	2026-08-06 12:55:08.292
cmshiqry2000t01s6dsgcnbz5	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:22.874	2026-08-06 12:55:22.874
cmshiqtth000u01s614qzsxez	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:25.301	2026-08-06 12:55:25.301
cmshiqutc000v01s67y2xhuus	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:26.592	2026-08-06 12:55:26.592
cmshiqy4d000w01s6bvpeqhka	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:30.877	2026-08-06 12:55:30.877
cmshiqzuj000x01s63w1a1q9s	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:33.115	2026-08-06 12:55:33.115
cmshir1nz000y01s6b1e6yfyd	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	\N	PENDING	\N	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:35.471	2026-08-06 12:55:35.471
cmshir7pg001001s6si11ixcs	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	{"parameters":[{"id":"0.6336631330461402","name":"","result":"","unit":"","range":"","flag":""}],"notes":""}	COMPLETED	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	\N	2026-08-06 12:55:43.3	2026-08-06 13:07:47.283
cmshir45g000z01s63kuy4iuw	cmshi5thw000j01s63ftb92nd	cmshcxm52000801s6xux31gzs	\N	Complete running stomach check	\N	{"parameters":[{"id":"0.8133796319899014","name":"Blue","result":"67.9","unit":"56","range":"98","flag":"High"}],"notes":""}	COMPLETED	cmshe96pv000501s6c0w9pf09	cmshcxlvv000001s682ba2jim	cmshj90ip001501s63ld0arrt	2026-08-06 12:55:38.692	2026-08-06 13:09:33.822
\.


--
-- Data for Name: LicenseVoucher; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LicenseVoucher" (id, code, type, "tierId", "durationDays", status, "redeemedById", "redeemedAt", "createdAt", "updatedAt") FROM stdin;
cmsc1q5ne000201s6h5ub0gmm	YZBY-M2LV-NVFY-8742	TRIAL	cmsc1q5n2000101s6k06eln0y	30	ACTIVE	\N	\N	2026-08-02 17:00:09.626	2026-08-02 17:00:09.626
cmsc1qamb000401s661d0t4f1	4J0H-0PG2-1I1C-TTK3	TRIAL	cmsc1qam4000301s6y6s9v10s	30	REDEEMED	cmrmq5v0e000301s68rl1kxrs	2026-08-02 17:02:08.379	2026-08-02 17:00:16.067	2026-08-02 17:02:08.381
cmsd5b6um000401s6110sbrw5	HUSY-4Q6J-Z6MP-9PTU	TRIAL	cmsc1q5n2000101s6k06eln0y	30	ACTIVE	\N	\N	2026-08-03 11:28:15.982	2026-08-03 11:28:15.982
cmsd9x2l3000b01s6p50cyzcg	ZH7T-E2V8-WFUO-GI2N	TRIAL	cmsc1qam4000301s6y6s9v10s	30	ACTIVE	\N	\N	2026-08-03 13:37:15.351	2026-08-03 13:37:15.351
cmsg9nh6b00i201s6z2swjx9m	0GKW-QD1A-Y27H-AQ6X	TRIAL	cmsc1q5n2000101s6k06eln0y	30	ACTIVE	\N	\N	2026-08-05 15:53:06.227	2026-08-05 15:53:06.227
cmsg9s0xa00i801s6tkb51p0g	3USH-IFKL-ZLD6-T16M	TRIAL	cmsc1q5n2000101s6k06eln0y	30	ACTIVE	\N	\N	2026-08-05 15:56:38.446	2026-08-05 15:56:38.446
cmsg9okrd00i301s6jt1m8fgq	F3LH-PJHD-O4F3-IH6M	TRIAL	cmsc1qam4000301s6y6s9v10s	30	REDEEMED	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:58:25.809	2026-08-05 15:53:57.529	2026-08-05 15:58:25.81
cmsg9qv7f00i701s6lt5pfmll	NP82-L65U-FHG9-ZTWP	TRIAL	cmsc1q5n2000101s6k06eln0y	30	REDEEMED	cmrmq5v0e000301s68rl1kxrs	2026-08-05 15:59:45.973	2026-08-05 15:55:44.379	2026-08-05 15:59:45.974
cmsg9qsrz00i601s6ne5ru1rr	2OWB-1Z4H-8622-CBR3	TRIAL	cmsc1qam4000301s6y6s9v10s	30	REDEEMED	cmsg3i0h4001801s67p002bbz	2026-08-05 15:59:48.483	2026-08-05 15:55:41.231	2026-08-05 15:59:48.483
cmshe4eg1000201s6r898ra2x	98F0-J7JE-W55A-4AZC	TRIAL	cmsc1qam4000301s6y6s9v10s	30	REDEEMED	cmshcxlvv000001s682ba2jim	2026-08-06 10:47:29.358	2026-08-06 10:46:00.482	2026-08-06 10:47:29.359
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Location" (id, name, type, address, "businessId", "createdAt", "updatedAt") FROM stdin;
cmrnh5rj3000d01s6a6k44rub	Electronics Shop Demo 2	STORE	\N	cmrmq5v0e000301s68rl1kxrs	2026-07-16 12:17:57.663	2026-07-16 12:17:57.663
\.


--
-- Data for Name: LocationStock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LocationStock" (id, "locationId", "productId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyCampaign; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyCampaign" (id, name, "targetCluster", status, "businessId", "createdAt") FROM stdin;
\.


--
-- Data for Name: LoyaltyTier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LoyaltyTier" (id, name, multiplier, discount, "businessId") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, title, message, type, "isRead", "businessId", "createdAt", "deletedAt", "updatedAt") FROM stdin;
notif_1784041195825_z3mqsjj	System update	Already fix bug that was affecting the add product	INFO	f	cmrjt12jq0000lcln3os8anz5	2026-07-14 14:59:55.828	\N	2026-07-14 14:59:55.828
notif_1784041286798_azgpi9n	System Update	we have a issues were customer have been misuse there product for categories but we have solve the issue now	INFO	f	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:01:26.801	\N	2026-07-14 15:01:26.801
notif_1784041382327_9bicfk8	System Update: v1.5 - Software update	all bug fix	SYSTEM_UPDATE	f	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:03:02.329	\N	2026-07-14 15:03:02.329
notif_1784041538993_gw6se1j	System Update: V--1.0 - Software Update	All bug fix	SYSTEM_UPDATE	f	cmrjt12jq0000lcln3os8anz5	2026-07-14 15:05:38.995	\N	2026-07-14 15:05:38.995
notif_1784210078107_jugpgca	Low Stock: smart light	New product "smart light" initialized below threshold. Current: 7	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-16 13:54:38.109	2026-07-20 13:59:11.322	2026-07-20 13:59:09.035
notif_1784555845337_z2lvknd	Low Stock: Hikvision 2MP IP Camera	Product "Hikvision 2MP IP Camera" has reached its threshold. Remaining: 4	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-20 13:57:25.339	2026-07-20 13:59:11.322	2026-07-20 14:01:06.943
notif_1784557778924_660xes0	Low Stock: Hikvision 2MP IP Camera	Product "Hikvision 2MP IP Camera" has reached its threshold. Remaining: -4	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-20 14:29:38.926	2026-07-21 15:46:17.042	2026-07-20 14:35:28.883
notif_1784763835989_6q19cbd	Low Stock: Hikvision 2MP IP Camera	Product "Hikvision 2MP IP Camera" has reached its threshold. Remaining: -1	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-22 23:44:00.171	2026-07-22 23:48:31.94	2026-07-24 12:50:50.991
notif_1784633243930_zqb5hvb	Low Stock: Hikvision 2MP IP Camera	Product "Hikvision 2MP IP Camera" has reached its threshold. Remaining: 1	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-21 11:27:23.932	2026-07-21 15:46:17.042	2026-07-24 12:50:50.991
notif_1784939272625_b9bcvs3	Low Stock: Hikvision 2MP IP Camera	Product "Hikvision 2MP IP Camera" has reached its threshold. Remaining: 0	WARNING	t	cmrmq5v0e000301s68rl1kxrs	2026-07-25 00:27:52.628	2026-07-25 00:29:09.284	2026-07-25 22:48:38.431
notif_1785001978470_3wpsj1f	Over Stock Alert: Infinix Note 50	Product "Infinix Note 50" is at 50 units (excess inventory). (11 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 17:52:58.472	2026-07-25 22:40:35.565	2026-07-25 17:52:58.472
notif_1784994175303_lubow2i	Over Stock Alert: smart light	Product "smart light" is at 699 units (excess inventory). (21 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:42:55.304	2026-07-25 22:40:35.565	2026-07-25 15:42:55.304
notif_1785001982334_yth3oqq	Over Stock Alert: Redmi Note 14	Product "Redmi Note 14" is at 50 units (excess inventory). (10 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 17:53:02.335	2026-07-25 22:40:35.565	2026-07-25 17:53:02.335
notif_1784994182500_9434bq6	Over Stock Alert: hp laptop 15-dy2xxx	Product "hp laptop 15-dy2xxx" is at 200 units (excess inventory). (20 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:43:02.503	2026-07-25 22:40:35.565	2026-07-25 15:43:02.503
notif_1784994685430_ygzfg4n	Over Stock Alert: Desktop Computer	Product "Desktop Computer" is at 150 units (excess inventory). (19 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:51:25.433	2026-07-25 22:40:35.565	2026-07-25 15:51:25.433
notif_1785002671112_ecq3xvf	Over Stock Alert: Lenovo Tablet	Product "Lenovo Tablet" is at 61 units (excess inventory). (9 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 18:04:31.114	2026-07-25 22:40:35.565	2026-07-25 18:04:31.114
notif_1784994691645_b5u2d4o	Over Stock Alert: HP ProBook 450	Product "HP ProBook 450" is at 100 units (excess inventory). (18 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 15:51:31.647	2026-07-25 22:40:35.565	2026-07-25 15:51:31.647
notif_1784996872496_0xhhh6s	Over Stock Alert: Smart Watches	Product "Smart Watches" is at 98 units (excess inventory). (17 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:27:52.498	2026-07-25 22:40:35.565	2026-07-25 16:27:52.498
notif_1785019207904_eyh0ffv	Over Stock Alert: Galaxy Tab S11	Product "Galaxy Tab S11" is at 50 units (excess inventory). (8 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 22:40:07.908	2026-07-25 22:40:35.565	2026-07-25 22:40:07.908
notif_1784996878146_ssq3hjx	Over Stock Alert: Smart Video Doorbell	Product "Smart Video Doorbell" is at 97 units (excess inventory). (16 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:27:58.148	2026-07-25 22:40:35.565	2026-07-25 16:27:58.148
notif_1784996893452_8fh9ffv	Over Stock Alert: Fingerprint Door Lock	Product "Fingerprint Door Lock" is at 96 units (excess inventory). (15 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:28:13.454	2026-07-25 22:40:35.565	2026-07-25 16:28:13.454
notif_1785019213817_mnj7cq9	Over Stock Alert: Tablet TCL	Product "Tablet TCL" is at 50 units (excess inventory). (7 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 22:40:13.82	2026-07-25 22:40:35.565	2026-07-25 22:40:13.82
notif_1784996924292_fdy6i4h	Over Stock Alert: Tuya Smart Door Lock	Product "Tuya Smart Door Lock" is at 84 units (excess inventory). (14 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:28:44.293	2026-07-25 22:40:35.565	2026-07-25 16:28:44.293
notif_1784997278796_qhazjs6	Over Stock Alert: iPhone 15	Product "iPhone 15" is at 51 units (excess inventory). (13 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 16:34:38.798	2026-07-25 22:40:35.565	2026-07-25 16:34:38.798
notif_1784999654192_gc5y1m7	Over Stock Alert: Tecno Camon 40	Product "Tecno Camon 40" is at 50 units (excess inventory). (12 other products also overstocked)	WARNING	f	cmrmq5v0e000301s68rl1kxrs	2026-07-25 17:14:14.195	2026-07-25 22:40:35.565	2026-07-25 17:14:14.195
notif_1785944164332_g376oxs	Over Stock Alert: Nike 	Product "Nike " is at 300 units (excess inventory). (28 other products also overstocked)	WARNING	f	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:36:04.334	\N	2026-08-05 15:36:04.334
notif_1785943598327_muclevt	Low Stock: Air Forces 	Product "Air Forces " has reached its threshold. Remaining: 9	WARNING	t	cmsg3mply001h01s6fbg9j6j0	2026-08-05 15:26:38.33	\N	2026-08-05 15:36:36.912
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderStatusHistory" (id, "saleId", status, note, "userId", "createdAt", "businessId") FROM stdin;
cmrnjuoot000501s6y8azqtcz	cmrnjuooa000301s6p2rwrpz0	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:33:19.594	cmrmq5v0e000301s68rl1kxrs
cmrnk2lcy000701s6jvgnxram	cmrnk2lcp000201s6eozlh8u2	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:39:28.537	cmrmq5v0e000301s68rl1kxrs
cmrnlokjg000201s6rsswqvi6	cmrnlokj5000001s6d7o14fzy	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 14:24:33.521	cmrmq5v0e000301s68rl1kxrs
cmrnlpoqk000701s6fucerlyq	cmrnlpoq9000501s60am7rqhe	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 14:25:25.617	cmrmq5v0e000301s68rl1kxrs
cmrnuh3nq000301s6x0395cnb	cmrnuh3n6000101s65iq15izv	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 18:30:41.586	cmrmq5v0e000301s68rl1kxrs
cmrnukmv8000801s6rac0a69s	cmrnukmux000601s6ji6tkjht	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-16 18:33:26.457	cmrmq5v0e000301s68rl1kxrs
cmrozbw9h000601s6jo2c3n1t	cmrozbw8n000201s6mytg8fbu	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-17 13:34:22.967	cmrmq5v0e000301s68rl1kxrs
cmrp41c5o000501s64ykbxs46	cmrp41c56000201s6t1ikwsjb	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-17 15:46:08.442	cmrmq5v0e000301s68rl1kxrs
cmrtah2uj000401s6uyxyt2tt	cmrtah2u1000201s6ajasmzyt	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-20 13:57:25.273	cmrmq5v0e000301s68rl1kxrs
cmrtbc1el000k01s6st6fvlim	cmrtbc1e9000i01s6qg8g5mdr	PENDING	Converted from Sales Order SO-000001	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:21:29.745	cmrmq5v0e000301s68rl1kxrs
cmrtbmitg000u01s6oxn2remm	cmrtbmit5000s01s6yxxln2ld	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:29:38.873	cmrmq5v0e000301s68rl1kxrs
cmrte2ghm001d01s6oqqk9q2s	cmrte2gg7001b01s6h19o9mmq	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-20 15:38:01.543	cmrmq5v0e000301s68rl1kxrs
cmrukgnmi000401s6qx29p904	cmrukgnlz000101s6ztsst37m	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:24:47.879	cmrmq5v0e000301s68rl1kxrs
cmrukht95000c01s6f5su6v65	cmrukht8w000a01s6ydm208e0	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:25:41.84	cmrmq5v0e000301s68rl1kxrs
cmrukjzzp000h01s6dc6uxcqq	cmrukjzzd000f01s6lucm1fh5	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:27:23.881	cmrmq5v0e000301s68rl1kxrs
cmrwqb0rm000268lnmkm6aq03	cmrwqb0fa000068ln9uuoomtn	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:43:54.598	cmrmq5v0e000301s68rl1kxrs
cmrwqcckj000768lnush9wewo	cmrwqcc7e000568lnqna1umh5	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:44:56.522	cmrmq5v0e000301s68rl1kxrs
cmrxe2tes000801s6qkpob6ce	cmrxe2tdb000401s6tr1slkog	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-23 10:49:22.991	cmrmq5v0e000301s68rl1kxrs
cmryqly5t000301s6km6q0l72	cmryqly2c000101s6r4z5ct4q	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-24 09:27:57.108	cmrmq5v0e000301s68rl1kxrs
cmryqob0t000801s6phe16md7	cmryqob0f000601s6ntduyz51	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-24 09:29:47.199	cmrmq5v0e000301s68rl1kxrs
cmrywmyna000301s6bhmk3z1g	cmrywmylo000001s6eu82kppv	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-24 12:16:42.156	cmrmq5v0e000301s68rl1kxrs
cmrz8yn8x000301s6tcuqpm0a	cmrz8yn7b000101s694zyul6h	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-24 18:01:42.647	cmrmq5v0e000301s68rl1kxrs
cmrzmr98s000601s6gc208xo6	cmrzmr987000401s6z17x93xd	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-25 00:27:52.567	cmrmq5v0e000301s68rl1kxrs
cmrzmshvs000b01s6440zn2h0	cmrzmshvh000901s6ln1u6jmg	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-25 00:28:50.429	cmrmq5v0e000301s68rl1kxrs
cms09i1hy000p01s6hgn5vrm0	cms09i1fz000l01s6og0906j1	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-25 11:04:33.743	cmrmq5v0e000301s68rl1kxrs
cms0co4tq000401s6qmqauggd	cms0co4s1000101s6a79j72q4	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-25 12:33:16.849	cmrmq5v0e000301s68rl1kxrs
cms0k2e10000401s64alibh7t	cms0k2e0a000201s6l307v52h	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-25 16:00:19.306	cmrmq5v0e000301s68rl1kxrs
cms0od2g8000t01s6ozubw1jz	cms0od2fo000q01s66n22o2g1	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-25 18:00:35.988	cmrmq5v0e000301s68rl1kxrs
cms54a6cm000401s6owx3zz3v	cms54a6c3000201s6zk4ttarx	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-28 20:37:19.635	cmrmq5v0e000301s68rl1kxrs
cms54a819000901s6wnj68wzy	cms54a80z000701s6zxwaa5az	PENDING	OFFLINE SYNCED SALE	cmrmq5v3k000901s6lnumwy2c	2026-07-28 20:37:21.827	cmrmq5v0e000301s68rl1kxrs
cms67p5au000301s6a60bmupx	cms67p5a8000101s6k4343x42	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-07-29 15:00:43.136	cmrmq5v0e000301s68rl1kxrs
cms9ae6yw000g01s649xb43uo	cms9ae6y7000c01s6dzcrauo0	PENDING	Order created	cms9aa3k9000801s6phw014ay	2026-07-31 18:39:29.455	cmrmq5v0e000301s68rl1kxrs
cms9mrrv2000701s6b8d5fdae	cms9mrrtu000401s68qye0m3n	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-08-01 00:25:58.434	cmrmq5v0e000301s68rl1kxrs
cmsemo8bz000201s64onwdzss	cmsemo8bd000001s60c26vp53	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-08-04 12:22:04.058	cmrmq5v0e000301s68rl1kxrs
cmsewl1tw000401s6kx6ivyms	cmsewl1sc000201s6964cokus	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-08-04 16:59:31.788	cmrmq5v0e000301s68rl1kxrs
cmsg8h2x700d301s666vjrj4e	cmsg8h2wk00d101s6gzh3t3zc	PENDING	Order created	cmsg3ampe001301s6hyhcq613	2026-08-05 15:20:08.18	cmsg3amla000x01s698usq8fn
cmsg8oit800e901s6g18rzxef	cmsg8oisp00dx01s69t4dtuu4	PENDING	Order created	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.369	cmsg3amla000x01s698usq8fn
cmsg8pfw300es01s6vizrubyu	cmsg8pfvq00ep01s6mwz2z8os	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:26:38.246	cmsg3mply001h01s6fbg9j6j0
cmsg8r5ru00f101s6lypitren	cmsg8r5ri00ez01s6ekbn14nb	PENDING	Order created	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:27:58.446	cmsg3i0h4001801s67p002bbz
cmsg8rpzw00f601s6xqk1kqfa	cmsg8rpzj00f401s67rtwz13a	PENDING	Order created	cmsg3ampe001301s6hyhcq613	2026-08-05 15:28:24.655	cmsg3amla000x01s698usq8fn
cmsg8sha700fd01s6mcdzxi0j	cmsg8sh9w00fb01s6g8flovra	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:29:00.02	cmsg3mply001h01s6fbg9j6j0
cmsg8skta00fj01s6ccbl1d2e	cmsg8skt000fh01s6vzi84mbj	PENDING	Order created	cmsg3ampe001301s6hyhcq613	2026-08-05 15:29:04.596	cmsg3amla000x01s698usq8fn
cmsg8twbm00fr01s6o94rmdlc	cmsg8twba00fp01s6k17xuvy9	PENDING	Order created	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:30:06.166	cmsg3i0h4001801s67p002bbz
cmsg93oox00g701s6a3rgpjis	cmsg93ool00g501s6c5fzinxd	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:37:42.837	cmsg3mply001h01s6fbg9j6j0
cmsg97ag100ge01s6hvnbie4m	cmsg97afp00gc01s6kte5xaox	PENDING	Order created	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:40:30.997	cmsg38ejb000n01s66874af28
cmsg983fz00gk01s6z9qiqqfe	cmsg983fq00gi01s61vhj4bsi	PENDING	Order created	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:41:08.582	cmsg3i0h4001801s67p002bbz
cmsg98q3y00gr01s6kbbeqqye	cmsg98q3l00gp01s6p5dw76wk	PENDING	Order created	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:41:37.953	cmsg38ejb000n01s66874af28
cmsg98uo600gw01s6jm6b2m7q	cmsg98unu00gu01s6dan9mn8h	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:41:43.866	cmsg3mply001h01s6fbg9j6j0
cmsg9cdoh00h401s6hvhhcvbz	cmsg9cdo500h201s6n9dc25vk	PENDING	Order created	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:44:28.469	cmsg38ejb000n01s66874af28
cmsg9cs8a00ha01s6ryiu7j71	cmsg9cs7y00h801s6mlyzdnv8	PENDING	Order created	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:44:47.326	cmsg3i0h4001801s67p002bbz
cmsg9ef7j00hi01s62ap5s53r	cmsg9ef7600hg01s6omm24tna	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:46:03.762	cmsg3mply001h01s6fbg9j6j0
cmsg9fxdr00hs01s6m3jrcro4	cmsg9fxdc00hn01s6yzal8dei	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-08-05 15:47:13.968	cmrmq5v0e000301s68rl1kxrs
cmshis2a4001401s6vzucjk0w	cmshis29k001201s6u8378dpv	PENDING	Medical bill generated from Consultation	cmshcxm52000801s6xux31gzs	2026-08-06 12:56:22.904	cmshcxlvv000001s682ba2jim
cmshj90j5001701s6z8zgqe9l	cmshj90ip001501s63ld0arrt	PENDING	Medical bill generated from Laboratory	cmshe96pv000501s6c0w9pf09	2026-08-06 13:09:33.793	cmshcxlvv000001s682ba2jim
cmshjc0gq001901s6j4kvrdrj	cmshis29k001201s6u8378dpv	COMPLETED	Medical bill paid via CASH 	cmshcxm52000801s6xux31gzs	2026-08-06 13:11:53.684	cmshcxlvv000001s682ba2jim
cmshjceu6001a01s66yvir1ok	cmshj90ip001501s63ld0arrt	COMPLETED	Medical bill paid via CASH 	cmshcxm52000801s6xux31gzs	2026-08-06 13:12:12.312	cmshcxlvv000001s682ba2jim
cmshns2r4000d01s6dl3setsu	cmshns2pr000b01s6cl0ioyva	PENDING	Order created	cmsg3mpqm001n01s6uacw6clo	2026-08-06 15:16:21.567	cmsg3mply001h01s6fbg9j6j0
cmsqkdprb000501s68urmq5gc	cmsqkdpqk000101s671f4p297	PENDING	Order created	cmrmq5v3k000901s6lnumwy2c	2026-08-12 20:51:08.3	cmrmq5v0e000301s68rl1kxrs
\.


--
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Patient" (id, name, "dateOfBirth", gender, phone, email, address, allergies, "medicalNotes", "businessId", "createdAt", "updatedAt", conditions, "currentMedications", "emergencyContact", immunizations, nationality, "pastProcedures") FROM stdin;
cmshi5thw000j01s63ftb92nd	Alhaji Amadu Bah	2019-05-20 00:00:00	MALE	032425543	alhajibah@gmail.com	26A Nelson Lane, Tengbeh Town.	\N	\N	cmshcxlvv000001s682ba2jim	2026-08-06 12:39:05.108	2026-08-06 12:39:05.108	\N	\N	\N	\N	Sierra Leonean	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "businessId", "invoiceId", amount, "paymentMethod", "paymentRef", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: Payroll; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payroll" (id, "userId", "businessId", amount, status, "periodStart", "periodEnd", "paymentDate", "paymentMethod", "createdAt", "updatedAt", "deletedAt") FROM stdin;
pay_1784723060629_c8w7qvr	cmrw19y5t000201s6tl660ld1	cmrmq5v0e000301s68rl1kxrs	2000.00	PAID	2026-07-01 00:00:00	2026-07-31 00:00:00	2026-07-22 12:24:26.165	CASH	2026-07-22 12:24:20.631	2026-07-22 12:24:26.165	\N
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Permission" (id, key) FROM stdin;
cmrwj82rp0000lolnrwkhijda	menu:overview
cmrwj83nb0001lolnso7nrlqe	menu:intelligence:hub
cmrwj84im0002lolnoa9cjgnv	menu:intelligence:chat
cmrwj85qp0003lolnvcnfwmag	menu:intelligence:analytics
cmrwj86v40004loln7255kmxi	menu:intelligence:reports
cmrwj87px0005lolnfu0n7wvn	menu:sales
cmrwj88ku0006lolnnbrsmlgc	menu:bar:tables
cmrwj89fg0007lolndj8ypwye	menu:inventory
cmrwj8b3m0008lolnhyef758p	menu:purchases
cmrwj8c0v0009loln663y2jva	menu:customers
cmrwj8cvu000alolnwomd20qc	menu:accounting
cmrwj8drg000blolnb0t56cm8	menu:accounting:billing
cmrwj8ewq000cloln9vqj9z69	menu:staff
cmrwj8g4d000dloln8u8954c5	menu:system
cmrwj8h7w000eloln7vlict9c	menu:support:manual
cmrwj8i3m000flolngqscrvdl	menu:support:pricing
cmrwj8j2t000gloln2jc36mhz	menu:inventory:categories
cmrwj8kbt000hloln5ojn12g1	menu:sales:history
cmrwj8ld8000ilolnp49yj66h	menu:customers:loyalty
cmrwj8m8l000jloln5rgelj5q	menu:system:settings
cmrwj8n4c000klolngz6sxg73	menu:clinic:overview
cmrwj8oal000llolnu9uhhca5	menu:clinic:appointments
cmrwj8pyk000mlolnngnjt7ua	menu:clinic:consultations
cmrwj8rbl000nloln6qamz2o9	menu:clinic:lab
cmrwj8s7z000ololn4buldpvo	menu:prescriptions
cmrwj8tlx000plolnaegmityw	menu:patients
cmrwj8wub000qlolnyw9xcgih	menu:purchases:suppliers
cmrwj8xpm000rlolnkild41kb	menu:accounting:expenses
cmrwj8yo9000sloln7m5om7ig	menu:accounting:pl
cmrwj91qy000tlolnnredfudf	menu:services
cmrwj9372000uloln2e77htdq	menu:inventory:expiry
cmrwj94pq000vlolnevoeuass	menu:kitchen
cmrwj95rx000wlolncifbbxsi	menu:tables
cmrwj96ms000xloln92uifl6u	menu:reservations
cmrwj97i9000ylolnxplk5ozy	menu:recipes
cmrwj98or000zlolnlhbiud9o	menu:intelligence:replenishment
cmrwj99y70010loln8deexla6	menu:inventory:adjustments
\.


--
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Prescription" (id, "prescriptionNumber", "patientId", "doctorName", "dateIssued", status, notes, instructions, "businessId", "saleId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, sku, description, barcode, "unitPrice", "costPrice", "stockQuantity", "minStockLevel", status, metadata, "businessId", "categoryId", "createdAt", "updatedAt", "deletedAt", "isNetworkAvailable", "requiresPrescription", "genericAlternative", "isControlledSubstance", "originalBusinessId", "originalProductId", type, "imageUrl", "baseUnit", "isFavorite", "maxStockLevel") FROM stdin;
cmrmre95k001401s662v8j8cf	Samsung Galaxy A56			\N	4500.00	3000.00	46.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrc1df001201s697u9ugf9	2026-07-16 00:16:43.736	2026-07-25 18:00:36.049	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160942/inventory/products/aftrrpfvtisns7xrwhta.webp	Piece	f	\N
cmrmqr19a000g01s6aqtfxfk6	Hikvision 5MP Dome Camera			\N	4000.00	3500.00	41.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmqe93w000b01s6m0zbxhqt	2026-07-15 23:58:40.414	2026-08-12 20:51:08.393	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784159853/inventory/products/asztosoyhrd38na38ehi.webp	Piece	f	\N
cmrmqk58o000d01s6fzatd6n0	Hikvision 2MP IP Camera			\N	3500.00	2800.00	39.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "", "sellingPrice": "", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmrmq5v0e000301s68rl1kxrs	cmrmqe93w000b01s6m0zbxhqt	2026-07-15 23:53:18.984	2026-08-05 15:47:14.011	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784159420/inventory/products/c4kivdc2a5idyd1lbhev.webp	Piece	f	\N
cmrmrmkog001a01s60ry9zqmk	Infinix Note 50			\N	5000.00	4500.00	49.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrc1df001201s697u9ugf9	2026-07-16 00:23:11.92	2026-08-12 20:51:08.41	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161361/inventory/products/vklxjop0457fpfhzlx3n.webp	Piece	f	\N
cmrmr84ux000x01s65ogzv6cr	Smart Door Sensor			\N	6000.00	4500.00	40.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmr3j3h000t01s6iyr5gjk6	2026-07-16 00:11:58.233	2026-07-25 18:00:36.067	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160692/inventory/products/wd1qnl2vyhviqm2zqgcu.webp	Piece	f	\N
cmrmrk9sg001801s6a24s9awm	Tecno Camon 40			\N	8000.00	5000.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrc1df001201s697u9ugf9	2026-07-16 00:21:24.496	2026-07-16 00:21:24.496	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161246/inventory/products/z9nclm5cxa6blalwsbgu.webp	Piece	f	\N
cmrmro8i5001c01s6mfnf0oa3	Redmi Note 14			\N	4000.00	3500.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrc1df001201s697u9ugf9	2026-07-16 00:24:29.453	2026-07-16 00:24:29.453	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161440/inventory/products/j4pl9klhnw2duh01rycd.webp	Piece	f	\N
cmrmrr1tt001g01s6jwz4x6j2	HP ProBook 450			\N	7500.00	5000.00	100.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-16 00:26:40.769	2026-07-16 00:26:40.769	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161568/inventory/products/nm96zwtdjkztggzrwieh.webp	Piece	f	\N
cmrms5u6p001k01s6lghot16g	Camera Installation	\N		\N	2000.00	\N	0.00	0	active	\N	cmrmq5v0e000301s68rl1kxrs	\N	2026-07-16 00:38:10.705	2026-07-16 00:38:10.705	\N	f	f	\N	f	\N	\N	SERVICE	\N	Unit	f	\N
cmrmri2zt001601s6zqhoba8z	iPhone 15			\N	20000.00	15000.00	51.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrc1df001201s697u9ugf9	2026-07-16 00:19:42.377	2026-07-16 12:22:49.091	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161095/inventory/products/pent0jpwcjbaqzuiaxum.webp	Piece	f	\N
cmrmqys0v000o01s6xmwvel9d	Tuya Smart Door Lock			\N	5000.00	2000.00	82.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmqwmmw000m01s6mx38lur8	2026-07-16 00:04:41.695	2026-08-05 15:47:14.052	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160296/inventory/products/i1biytorquzp9mdmghha.webp	Piece	f	\N
cmrmqv85x000k01s6btj8rupy	Hikvision Bullet Camera			\N	3500.00	2800.00	38.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmqe93w000b01s6m0zbxhqt	2026-07-16 00:01:55.989	2026-08-05 15:47:14.072	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160073/inventory/products/kcz5ky0uluunlwfqwfnd.webp	Piece	f	\N
cmrmr1g5u000r01s6mogei2xn	Fingerprint Door Lock			\N	4000.00	1000.00	94.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmqwmmw000m01s6mx38lur8	2026-07-16 00:06:46.29	2026-08-12 20:51:08.359	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160379/inventory/products/l9qao244zdv6wk8xp5dj.webp	Piece	f	\N
cmrmrte1b001i01s64lsy6zwo	Dell Latitude 5440			\N	15000.00	12000.00	49.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-16 00:28:29.903	2026-07-23 10:49:23.113	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784161670/inventory/products/phbx4oxnd2jxtthhgdl9.webp	Piece	f	\N
cmrmr9yev000z01s6llw0xrfx	Smart Motion Sensor			\N	4000.00	3501.00	49.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmr3j3h000t01s6iyr5gjk6	2026-07-16 00:13:23.191	2026-07-24 12:16:42.24	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160780/inventory/products/njc1kynghwii0oat1gdl.webp	Piece	f	\N
cms08hjg7000301s6n8j1gozw	Lenovo Tablet			\N	7000.00	5000.00	60.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-25 10:36:10.807	2026-08-01 00:25:58.5	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784975646/inventory/products/idjwepwv4ugi1gk6xm6l.webp	Piece	f	100
cmrnkm34d000f01s66kijfnfa	smart light			\N	25.00	20.83	699.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "250", "sellingPrice": "25", "sellingUnitName": "Unit", "unitsPerPackage": "12", "purchaseUnitName": "Carton"}]}	cmrmq5v0e000301s68rl1kxrs	cmrmr3j3h000t01s6iyr5gjk6	2026-07-16 13:54:38.029	2026-07-20 14:21:29.769	\N	f	f	\N	f	\N	\N	PRODUCT		Piece	f	\N
cmrwtw5us000801s6q1dlfweq	Desktop Computer			\N	20000.00	15000.00	150.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrwtuhc5000601s6e93t39qe	2026-07-23 01:24:20.26	2026-07-23 01:24:20.26	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784769794/inventory/products/xxweyhrtmd3a7e1etemp.webp	Piece	f	100
cms08l2p8000501s6rf6bk7gk	Galaxy Tab S11			\N	10000.00	7000.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-25 10:38:55.725	2026-07-25 10:38:55.725	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784975868/inventory/products/nu4xyzoksmnnk2v8o6wx.webp	Piece	f	100
cms08n360000701s6mqjp312s	Tablet TCL			\N	7499.00	5000.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-25 10:40:29.64	2026-07-25 10:40:29.64	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784975976/inventory/products/zb38ypufxvk6ek8ieice.webp	Piece	f	\N
cms08vv4n000b01s601d5tzua	Smart Watches			\N	1000.00	500.00	96.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-25 10:47:19.127	2026-08-04 12:22:04.105	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784976399/inventory/products/v4nocvnqo09iwc98ksfb.webp	Piece	f	100
cmrmr5vue000v01s6rz47br6y	Smart Video Doorbell			\N	4000.00	3500.00	96.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmr3j3h000t01s6iyr5gjk6	2026-07-16 00:10:13.238	2026-07-31 18:39:29.544	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784160556/inventory/products/yv03rtr4h9fwjrrbylmq.webp	Piece	f	\N
cms08sh4u000901s6z990hr8r	Samsung 43-inch FHD Smart TV			\N	10000.00	6000.00	29.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	\N	2026-07-25 10:44:41.022	2026-07-25 12:33:16.943	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784976191/inventory/products/whq4hn0oorx4pcid76ag.webp	Piece	f	98
cms08xymo000d01s6lcchaqfp	Power Banks			\N	800.00	500.00	47.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-25 10:48:56.976	2026-07-28 20:37:19.677	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784976500/inventory/products/qe3dmuqdgwt2ctlrxbb7.webp	Piece	f	100
cmrwt5kvz000001s6oupurq0n	hp laptop 15-dy2xxx			\N	18000.00	10000.00	199.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-07-23 01:03:40.031	2026-08-01 00:25:58.524	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1784768497/inventory/products/qpy4hq2gjvgtgxdwtmlg.webp	Piece	t	150
cmsg4agai002n01s6o1e6auva	rose wine			\N	130.00	125.00	48.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 13:23:00.474	2026-08-05 13:23:00.474	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936051/inventory/products/laqrdragm5hhjr3tbnuk.webp	Piece	f	\N
cmsg4c6uv002u01s6lm83ukkn	ONE PLUS 15			\N	25000.00	18000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg3tpwg001w01s6wkwsw8l2	2026-08-05 13:24:21.559	2026-08-05 13:24:21.559	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936227/inventory/products/sovjmue7b2h75ha0dvxi.webp	Piece	f	\N
cmsg4dhsf002w01s6gvmdvh5x	GALAXY S25 ULTRA			\N	47000.00	35000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg3tpwg001w01s6wkwsw8l2	2026-08-05 13:25:22.383	2026-08-05 13:25:22.383	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936273/inventory/products/ojpdvj1ekimzobendulz.webp	Piece	f	\N
cmsg4j105003601s61tbanl2z	dessert wine			\N	215.00	208.33	72.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "5000", "sellingPrice": "215", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 13:29:40.565	2026-08-05 13:29:40.565	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936445/inventory/products/xbgkf52s5vtdtd6ulk17.webp	Piece	f	\N
cmsg4pmhd003901s6vm7bcwcu	fortified			\N	50.00	41.67	48.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1000", "sellingPrice": "50", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 13:34:48.337	2026-08-05 13:34:48.337	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936797/inventory/products/yhaqplor9l4vwtcxsxmy.webp	Piece	t	\N
cmsg4v5od003c01s6mss6m6vm	Amoxicillin 			\N	15.00	8.33	100.00	10	active	{"expiryDate": "2027-03-10", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 13:39:06.493	2026-08-05 13:39:06.493	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936953/inventory/products/mod8j9kducgfitmnhhpq.webp	Piece	f	\N
cmsg4xht2003f01s6iopaw2wz	LG GRAM PRO			\N	14000.00	9000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg4ecj9002y01s6qa8w3byt	2026-08-05 13:40:55.526	2026-08-05 13:40:55.526	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937220/inventory/products/sezsqxycj1dqtppkxykv.webp	Piece	f	\N
cmsg4znev003h01s6qudymizw	SAMSUNG GALAXY BOOK			\N	24000.00	17000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg4ecj9002y01s6qa8w3byt	2026-08-05 13:42:36.103	2026-08-05 13:42:36.103	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937304/inventory/products/lqeajgowk3dgfv5wyler.webp	Piece	f	\N
cmsg50425003j01s6jrz4yj4e	Congestyl			\N	15.00	8.33	80.00	10	active	{"expiryDate": "2027-04-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 13:42:57.677	2026-08-05 13:42:57.677	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937184/inventory/products/qma8pcnmyex6jd4pra7s.webp	Piece	f	\N
cmsg4aukj002q01s6hz6jqye9	TECNO PHANTOM V FOLD			\N	30000.00	23000.00	19.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg3tpwg001w01s6wkwsw8l2	2026-08-05 13:23:18.979	2026-08-05 15:28:24.687	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936161/inventory/products/ubinhi48jsicyvw3gyqo.webp	Piece	f	\N
cmsg49je5002i01s6cvarwut0	Gucci			\N	200.00	150.00	199.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "200", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 13:22:17.837	2026-08-06 15:16:21.636	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785935878/inventory/products/lor1qknzazxv6ohuwdlt.webp	Piece	t	\N
cmsg451qn002c01s6y1vkdjq3	IPHONE 17 PRO			\N	60000.00	45000.00	19.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg3tpwg001w01s6wkwsw8l2	2026-08-05 13:18:48.335	2026-08-05 15:29:04.629	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785935841/inventory/products/vhmefqgzhkkozisbx7fa.webp	Piece	f	\N
cmsg458q8002e01s6478pm5l6	white wine			\N	115.00	104.17	93.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "115", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 13:18:57.392	2026-08-05 15:44:28.51	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785935803/inventory/products/qy85l9abteta2owh9pks.webp	Piece	t	100
cmsg4gzq9003301s6e5dc9uxa	Patex Philippe			\N	350.00	333.33	300.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "100000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "300", "purchaseUnitName": "Pallet"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg4c5ec002s01s6m4tjxtmo	2026-08-05 13:28:05.601	2026-08-06 15:15:06.948	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936306/inventory/products/jljxaeixwuocgsr6ngwb.webp	Piece	t	\N
cmsg40e83002301s6r8dz9yjf	red wine			\N	110.00	104.17	90.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 13:15:11.235	2026-08-05 15:41:37.984	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785935492/inventory/products/vj822ykfgfazzqwkvkui.webp	Piece	t	\N
cmsg52qyn003m01s606jf9qsl	LENOVO THINKPAD X1			\N	12000.00	9000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg4ecj9002y01s6qa8w3byt	2026-08-05 13:45:00.671	2026-08-05 13:45:00.671	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937436/inventory/products/etddms7ftu0wnld6ngri.webp	Piece	f	\N
cmsg58obu004401s60j7l9qsu	Nike 			\N	250.00	166.67	300.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "300", "purchaseUnitName": "Barrel"}, {"barcode": "", "purchaseCost": "", "sellingPrice": "", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 13:49:37.194	2026-08-05 13:49:37.194	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937662/inventory/products/ltqodobast4xiosdmrvz.webp	Piece	f	\N
cmsg599is004801s6r0mgmpnc	Multivitamins 			\N	10.00	5.83	70.00	10	active	{"expiryDate": "2028-05-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "70", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 13:50:04.66	2026-08-05 13:50:04.66	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937614/inventory/products/rjrlwgpzlqkt5twrjo3r.webp	Piece	f	\N
cmsg5cbma004h01s6uj70ztjx	coca cola			\N	35.00	29.17	72.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "700", "sellingPrice": "35", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 13:52:27.346	2026-08-05 13:52:27.346	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937827/inventory/products/uisutlhzbcmvgjhbghyu.webp	Piece	f	\N
cmsg5hpfr004l01s6l77hutho	Anti blue light glass 			\N	250.00	200.00	100.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "20000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Carton"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5c8st004b01s6c0z5m6s4	2026-08-05 13:56:38.535	2026-08-05 13:56:38.535	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937974/inventory/products/lxyvgyl8sgxznwtncbka.webp	Piece	t	\N
cmsg5kcnb004q01s6tnosoctn	pepsi			\N	40.00	37.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 13:58:41.927	2026-08-05 13:58:41.927	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938252/inventory/products/ecyqtqf4yrtrivkiiiuf.webp	Piece	f	\N
cmsg5olxy004v01s65v5o0f7c	NINTENDO SWITCH			\N	1500.00	1000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5k170004o01s6a0fva9xw	2026-08-05 14:02:00.598	2026-08-05 14:02:00.598	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938473/inventory/products/jnfza9wbqek67mdgknrw.webp	Piece	f	\N
cmsg5qdoa004x01s6t331pqxu	META QUEST 3			\N	45000.00	32000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5k170004o01s6a0fva9xw	2026-08-05 14:03:23.194	2026-08-05 14:03:23.194	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938566/inventory/products/blrdshopc7hvbcvubnaa.webp	Piece	f	\N
cmsg5s0v2005301s6y43tsovn	fanta			\N	30.00	20.83	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "500", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 14:04:39.902	2026-08-05 14:04:39.902	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938433/inventory/products/dwkf441oyi7ooz5dl4cz.webp	Piece	t	\N
cmsg5u2sc005801s6dmwvo4di	Moccasin 			\N	300.00	250.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "300", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Pack"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:06:15.708	2026-08-05 14:06:15.708	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938686/inventory/products/aubll4smwuxgjh2drsew.webp	Piece	t	\N
cmsg5wo1j005b01s63lzjllf8	maltina			\N	40.00	37.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 14:08:16.567	2026-08-05 14:08:16.567	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938818/inventory/products/wnrmdwr1vgxxzszu6mf7.webp	Piece	f	\N
cmsg5ti4h005601s6zqcdlnyl	PLAYSTATION 5			\N	14000.00	7000.00	13.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5k170004o01s6a0fva9xw	2026-08-05 14:05:48.929	2026-08-05 15:25:55.591	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938695/inventory/products/ggdc7xcywlmiti05k9h5.webp	Piece	f	\N
cmsg54cbf003q01s6kd00gec0	Vitamin C			\N	12.00	6.67	77.00	10	active	{"expiryDate": "2027-09-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "12", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 13:46:15.003	2026-08-05 15:30:06.204	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937450/inventory/products/ivah66bgxrbuod3oydwg.webp	Piece	f	\N
cmsg5cbd3004d01s65xg4s2x1	Benadryl 			\N	20.00	8.00	78.00	10	active	{"expiryDate": "", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "20", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}, {"barcode": "", "purchaseCost": "100", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 13:52:27.015	2026-08-05 15:44:47.356	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937828/inventory/products/xkn8vfa7wjn17yjjmd3z.webp	Piece	f	\N
cmsg619n5005s01s6znryjlbz	water			\N	10.00	7.08	60.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "85", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Bundle"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 14:11:51.185	2026-08-05 14:11:51.185	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938991/inventory/products/odd1csynep2rkonyfz6o.webp	Piece	t	\N
cmsg61s9u005y01s63b6yk2ke	Dry lil buds			\N	10.00	6.67	80.00	10	active	{"expiryDate": "2027-04-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}	cmsg3i0h4001801s67p002bbz	cmsg3vknt001z01s6hb6lyfxt	2026-08-05 14:12:15.33	2026-08-05 14:12:15.33	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939048/inventory/products/kpzupp4r3d3r4dyqdbmn.webp	Piece	f	\N
cmsg63du2006501s6vw8fgqbl	Star anise			\N	10.00	6.67	60.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}	cmsg3i0h4001801s67p002bbz	cmsg3vknt001z01s6hb6lyfxt	2026-08-05 14:13:29.93	2026-08-05 14:13:29.93	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939155/inventory/products/dzusgnnkk1j5vof5gdz6.webp	Piece	f	\N
cmsg65l31006f01s69kobogp2	Chinese pearl barley			\N	10.00	6.67	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}	cmsg3i0h4001801s67p002bbz	cmsg3vknt001z01s6hb6lyfxt	2026-08-05 14:15:12.637	2026-08-05 14:15:12.637	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939233/inventory/products/pxwg5nlvg3zbdoaslsiw.webp	Piece	f	\N
cmsg6877k006t01s6krlyutz1	Dried Jujube fruits 	Dried Jujube fruits 		\N	10.00	5.00	70.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "60", "sellingPrice": "10", "sellingUnitName": "Portion", "unitsPerPackage": "12", "purchaseUnitName": "Bag"}]}	cmsg3i0h4001801s67p002bbz	cmsg3vknt001z01s6hb6lyfxt	2026-08-05 14:17:14.624	2026-08-05 14:17:14.624	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939332/inventory/products/tlxleke6rvgppk00zik7.webp	Piece	f	\N
cmsg6ay6k006z01s6xi9ms0ww	Pumpkin seeds 			\N	10.00	8.33	200.00	10	active	{"expiryDate": "2028-05-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "10", "sellingUnitName": "Cup", "unitsPerPackage": "12", "purchaseUnitName": "Drum"}]}	cmsg3i0h4001801s67p002bbz	cmsg3vknt001z01s6hb6lyfxt	2026-08-05 14:19:22.893	2026-08-05 14:19:22.893	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939456/inventory/products/whmx0dbvgyiotfaypneo.webp	Piece	f	\N
cmsg6dbwi007601s60jtmez5n	heineken			\N	130.00	125.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:21:13.986	2026-08-05 14:21:13.986	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939577/inventory/products/hfn4ai9mqg14ffy1onwi.webp	Piece	t	\N
cmsg60su0005q01s6vw9pd1n7	AIR CONDITIONER			\N	800.00	600.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:11:29.4	2026-08-05 14:21:22.331	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939679/inventory/products/tqnf9p7x3ztgutakcpma.webp	Piece	f	\N
cmsg62rjy006301s6bp0a9dkn	BLENDER			\N	100.00	80.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:13:01.054	2026-08-05 14:21:36.954	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939695/inventory/products/orni3iliisojzfxlgs0j.webp	Piece	f	\N
cmsg64eio006c01s68eziyseq	ELECTRIC IRON			\N	315.00	250.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:14:17.472	2026-08-05 14:21:59.209	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939716/inventory/products/swcoioxexoqysmwhrn11.webp	Piece	f	\N
cmsg67o14006m01s67s6yaji6	Air Max			\N	450.00	300.00	97.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:16:49.768	2026-08-05 15:26:38.28	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939265/inventory/products/z6wg8src5ifvmye5ba9x.webp	Piece	t	\N
cmsg623uq006101s60wpgwghr	Refrigerator 			\N	3000.00	1500.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:12:30.338	2026-08-05 14:22:33.947	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939752/inventory/products/dlefhvdqnli9ba1kfxn2.webp	Piece	f	\N
cmsg5xpji005g01s6kq39cs7p	MICROWAVE OVEN			\N	400.00	230.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:09:05.166	2026-08-05 14:22:47.952	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939766/inventory/products/ndwu2qdjgye23ajncalw.webp	Piece	f	\N
cmsg63e8j006801s6wjclc1gk	TOASTER			\N	150.00	120.00	14.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:13:30.451	2026-08-05 15:25:55.705	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939820/inventory/products/zkgwuleanbvffqzhyr3a.webp	Piece	f	\N
cmsg61eos005v01s6rekxul60	Kitten Heel			\N	100.00	95.00	100.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "9500", "sellingPrice": "100", "sellingUnitName": "Piece", "unitsPerPackage": "100", "purchaseUnitName": "Bundle"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5yxjv005l01s651exwli4	2026-08-05 14:11:57.724	2026-08-06 15:14:38.511	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939041/inventory/products/di2enhwfxfv3irdg8ypx.webp	Piece	t	\N
cmsg6fmgd007h01s69qe71sop	Essential 			\N	250.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg6e5ty007b01s6x28v684h	2026-08-05 14:23:00.973	2026-08-05 14:23:00.973	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939726/inventory/products/rbhgfrnsbrt0vjhqmbrb.webp	Piece	t	\N
cmsg5yk0i005j01s628t8ksj8	RICE COOKER			\N	600.00	450.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:09:44.658	2026-08-05 14:23:23.699	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939799/inventory/products/twjcopkeae1eyfwmseyo.webp	Piece	f	\N
cmsg6g5eu007m01s6e1itvcsn	Wire Keyboard			\N	150.00	100.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrwtuhc5000601s6e93t39qe	2026-08-05 14:23:25.542	2026-08-05 14:23:25.542	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939707/inventory/products/ztc179baj80xq0et1fm6.webp	Piece	f	\N
cmsg6k0ak007v01s693xkb00v	Usb wireless Keyboard	Wireless Keyboard		\N	500.00	350.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrwtuhc5000601s6e93t39qe	2026-08-05 14:26:25.532	2026-08-05 14:26:25.532	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939836/inventory/products/wirgfunhtp0aoni0hvre.webp	Piece	f	\N
cmsg6k9o2007x01s6dlcbs83v	star beer			\N	30.00	25.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "600", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:26:37.682	2026-08-05 14:26:37.682	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939923/inventory/products/tgwsko8thskxrihpdd9q.webp	Piece	f	\N
cmsg6kdxr008201s67l7aamcb	Puma suede xl			\N	450.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:26:43.215	2026-08-05 14:26:43.215	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939946/inventory/products/rucsdovj5k02xkv7v2s3.webp	Piece	t	\N
cmsg6kbzc008001s6ej1e3ffp	WI-FI ROUTER			\N	500.00	300.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg6iais007t01s6vyp6rl4v	2026-08-05 14:26:40.68	2026-08-05 14:34:19.675	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940457/inventory/products/ad4rs3ww9qxlnccg2xmd.webp	Piece	f	\N
cmsg6615l006i01s6d0dsx0g3	COFFEE MAKER			\N	70.00	60.00	14.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:15:33.465	2026-08-05 15:25:55.725	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939778/inventory/products/wqmbidw46h6ipzsstfax.webp	Piece	f	\N
cmsg6guiv007p01s6e8ql6fij	guinness			\N	130.00	125.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:23:58.087	2026-08-05 14:23:58.087	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939788/inventory/products/bylpsq2etpxw4l0tj7fq.webp	Piece	f	\N
cmsg6m8pv008901s698emlh89	Insulin Injection 			\N	10.00	6.00	50.00	10	active	{"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "10", "sellingUnitName": "Bottle", "unitsPerPackage": "25", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg425qo002801s67otdtxm1	2026-08-05 14:28:09.763	2026-08-05 14:28:09.763	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939979/inventory/products/fzxdqeswasfuy8edq9u6.webp	Piece	f	\N
cmsg6ma8a008c01s62j86g36g	Nike Portal Pink 			\N	450.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:28:11.722	2026-08-05 14:28:11.722	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940057/inventory/products/fahaovlfddgakbmrir5y.webp	Piece	t	\N
cmsg6o4r3008j01s6iurw63vi	Barcode Scanner			\N	400.00	3500.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-08-05 14:29:37.935	2026-08-05 14:29:37.935	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940093/inventory/products/w1ttpwfso0b6mutn6r4w.webp	Piece	f	\N
cmsg6ou6w008l01s6k58s2dzl	Niketech fleece M~2XL 			\N	400.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "400", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 14:30:10.904	2026-08-05 14:30:10.904	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940168/inventory/products/iocarieacbfqbjlysrd2.webp	Piece	t	\N
cmsg6p5w8008o01s6aludbqvq	becks			\N	30.00	25.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "600", "sellingPrice": "30", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:30:26.072	2026-08-05 14:30:26.072	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940168/inventory/products/xjnlc4agxhqeqesrirbg.webp	Piece	f	\N
cmsg6r4s6008u01s6j77stev0	Receipt Printer			\N	6000.00	5000.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-08-05 14:31:57.942	2026-08-05 14:31:57.942	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940262/inventory/products/u60enftncp8tfbs0zrvy.webp	Piece	f	\N
cmsg6sgqo008w01s6026x78jt	budweiser			\N	70.00	62.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:33:00.096	2026-08-05 14:33:00.096	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940328/inventory/products/odvo47recsenm1lyfqyq.webp	Piece	f	\N
cmsg6ni2n008h01s601q6pvz4	5G ROUTER			\N	5000.00	2000.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg6iais007t01s6vyp6rl4v	2026-08-05 14:29:08.543	2026-08-05 14:33:01.704	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940379/inventory/products/zhenf5xw7ehutvkoxgjo.webp	Piece	f	\N
cmsg6r3wv008r01s6ti56ge53	🔥 Nike Shox 			\N	450.00	225.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "45000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:31:56.815	2026-08-06 15:13:50.146	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940270/inventory/products/u3krokuaw3kep7t4wlmv.webp	Piece	t	\N
cmsg6mgjk008f01s6yp7hrn6m	NETWORK SWITCH			\N	650.00	400.00	20.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg6iais007t01s6vyp6rl4v	2026-08-05 14:28:19.904	2026-08-05 14:34:01.413	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940439/inventory/products/nvcumh28rcxyguegvfjc.webp	Piece	f	\N
cmsg6uxe2009401s653r2k1gb	Cash Drawer			\N	2000.00	1500.00	50.00	10	active	{"packagingUnits": []}	cmrmq5v0e000301s68rl1kxrs	cmrmrpczo001e01s6l6pnyec1	2026-08-05 14:34:54.986	2026-08-05 14:34:54.986	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940441/inventory/products/ifbotl2urobprqgvwixt.webp	Piece	f	\N
cmsg6voek009801s64lqcjrya	Tuoxib			\N	20.00	8.33	50.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 14:35:29.996	2026-08-05 14:35:29.996	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940454/inventory/products/ripjkc28zedybqcljfzs.webp	Piece	f	\N
cmsg6x4ik009d01s6tpa1qyfc	Lous Vuitton 			\N	350.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg6v0g5009601s6ur55tgt9	2026-08-05 14:36:37.532	2026-08-05 14:36:37.532	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940562/inventory/products/axqomx2ag96cxtqc5ul9.webp	Piece	t	\N
cmsg7d5dc009i01s6cen1qln8	savanna			\N	35.00	33.33	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "800", "sellingPrice": "35", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:49:05.136	2026-08-05 14:49:05.136	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941286/inventory/products/d6zpozqp1o7gdcolybu5.webp	Piece	f	\N
cmsg5znvw005o01s6td0ltg7q	VACUUM CLEANER			\N	200.00	150.00	14.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:10:36.332	2026-08-05 15:25:55.49	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939837/inventory/products/atqbkthal9n1wmelq7zm.webp	Piece	f	\N
cmsg7e1o5009l01s654hcp5pw	MIU			\N	300.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "300", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg7cdts009g01s6mov6cf4p	2026-08-05 14:49:46.997	2026-08-05 14:49:46.997	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941332/inventory/products/v1zakeisxmenjsdxnuu0.webp	Piece	t	\N
cmsg7gqqy009o01s6wze6g37b	strongbow			\N	40.00	37.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "900", "sellingPrice": "40", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg54q2y003t01s6blo4zqhe	2026-08-05 14:51:52.81	2026-08-05 14:51:52.81	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941463/inventory/products/bmbqcxb0btgewmgqvg2h.webp	Piece	f	\N
cmsg7ht78009r01s6scudo3um	Hood			\N	350.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 14:52:42.644	2026-08-05 14:52:42.644	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941504/inventory/products/gxgooomkrydt69pqzd5i.webp	Piece	t	\N
cmsg7kd5z009w01s6puxm6pi2	Breitling 			\N	450.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Box"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg4c5ec002s01s6m4tjxtmo	2026-08-05 14:54:41.831	2026-08-05 14:54:41.831	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941626/inventory/products/mvwwcvizxmhvkvxkyzke.webp	Piece	t	\N
cmsg7md7m009z01s6xzw8c2ti	jameson			\N	45.00	41.67	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1000", "sellingPrice": "45", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 14:56:15.202	2026-08-05 14:56:15.202	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941703/inventory/products/tosio6uwpmbrhkulv9wh.webp	Piece	f	\N
cmsg7nkyj00a501s6rwqi0sm1	Shannon clothe			\N	500.00	175.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "35000", "sellingPrice": "500", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 14:57:11.899	2026-08-05 14:57:11.899	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941786/inventory/products/tga2t5wqlqyyexhngvwf.webp	Piece	t	\N
cmsg7qs5h00a801s6mmw3bwuw	jack daniels			\N	90.00	83.33	48.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 14:59:41.189	2026-08-05 14:59:41.189	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941928/inventory/products/zflbbqdqesuwzyu1w6h3.webp	Piece	f	\N
cmsg7r32s00ab01s6dhdndg9i	Caterpillar 			\N	450.00	250.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:59:55.348	2026-08-05 14:59:55.348	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785941897/inventory/products/qf4rvrzrygt9gdqzhp8v.webp	Piece	t	\N
cmsg7tngj00ae01s66lwmcnmi	Dior			\N	350.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Dozen"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg6v0g5009601s6ur55tgt9	2026-08-05 15:01:55.075	2026-08-05 15:01:55.075	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942065/inventory/products/pxywnoqkzytr1nofn8ma.webp	Piece	t	\N
cmsg7v0yl00al01s63jqgyu04	hennessy			\N	110.00	104.17	48.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 15:02:59.229	2026-08-05 15:02:59.229	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942120/inventory/products/bougnr3sajjqvdk5cqly.webp	Piece	f	\N
cmsg7v9b800ao01s6fhom7t9b	Capol infant suspension			\N	15.00	6.67	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "80", "sellingPrice": "15", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 15:03:10.052	2026-08-05 15:03:10.052	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942106/inventory/products/o4pcuigfdsojghklt7nn.webp	Piece	f	\N
cmsg7wq2c00ar01s6o2spsh54	Piriton			\N	15.00	8.33	150.00	10	active	{"expiryDate": "2026-12-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:04:18.42	2026-08-05 15:04:18.42	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942203/inventory/products/gyeglstcgjlsbpi0fg5f.webp	Piece	f	\N
cmsg7yvc500au01s6fsrb08y1	Anti Hist			\N	15.00	12.50	80.00	10	active	{"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:05:58.565	2026-08-05 15:05:58.565	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942284/inventory/products/algg9kjq9rclabnatl9t.webp	Piece	f	\N
cmsg7z95u00ax01s62g0dkr4y	Mash T Shirt 			\N	450.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 15:06:16.482	2026-08-05 15:06:16.482	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942330/inventory/products/zu3f2exsymzgmlp7iqb2.webp	Piece	t	\N
cmsg80me800b001s6moo4iui6	jonnie walker black label			\N	130.00	125.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 15:07:20.288	2026-08-05 15:07:20.288	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942365/inventory/products/ygouziakr0lr5idofkm6.webp	Piece	f	\N
cmsg816pt00b301s6knhcauwr	Penadol Rapid			\N	15.00	8.33	80.00	10	active	{"expiryDate": "2026-08-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:07:46.625	2026-08-05 15:07:46.625	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942373/inventory/products/yehufbsqaid3fkkvjy7v.webp	Piece	f	\N
cmsg818qq00b701s6evmsh1ow	Naruto			\N	250.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg3tg3i001t01s6a3zdumi8	2026-08-05 15:07:49.25	2026-08-05 15:07:49.25	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942428/inventory/products/e4habt3n0qwu5okyq9vq.webp	Piece	f	\N
cmsg82ybc00ba01s6w2j4wtta	Zyrtec tablets 			\N	20.00	10.00	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "20", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:09:09.048	2026-08-05 15:09:09.048	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942479/inventory/products/izhdijc0ew8gpbvmr9qc.webp	Piece	f	\N
cmsg83utd00bd01s6f4yg27vl	Swat Leather 			\N	350.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Bale"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:09:51.169	2026-08-05 15:09:51.169	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942547/inventory/products/ryvtiz8wcktvjuqk61sq.webp	Piece	f	\N
cmsg84kee00bh01s6xghajjxm	Valtoren 			\N	15.00	10.00	100.00	10	active	{"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Bottle", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 15:10:24.326	2026-08-05 15:10:24.326	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942572/inventory/products/w5tipcuzbhtpqvm22tgy.webp	Piece	f	\N
cmsg852n600bk01s6m6vmqmix	jonnie walker blue label			\N	130.00	125.00	48.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 15:10:47.97	2026-08-05 15:10:47.97	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942593/inventory/products/oqmqzi4tzfkcl8ysrifv.webp	Piece	f	\N
cmsg8734p00bn01s694mukfa5	Trava calm			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2027-06-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:12:21.913	2026-08-05 15:12:21.913	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942655/inventory/products/ododipw9hvzxbumrlcdd.webp	Piece	f	\N
cmsg8745900bq01s68epcelo2	Trava calm			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2027-06-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:12:23.229	2026-08-05 15:12:23.229	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942655/inventory/products/ododipw9hvzxbumrlcdd.webp	Piece	f	\N
cmsg88aru00bu01s6hayis21e	Lexon			\N	15.00	10.00	50.00	10	active	{"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:13:18.475	2026-08-05 15:13:18.475	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942757/inventory/products/mlja1tkyfwmeid7tgf9a.webp	Piece	f	\N
cmsg88ujp00bx01s6aq835pom	jonnie walker red label			\N	130.00	125.00	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "130", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg557bw003v01s6y9upzyqh	2026-08-05 15:13:44.101	2026-08-05 15:13:44.101	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942748/inventory/products/lofm3tamgl6p649tdbzn.webp	Piece	f	\N
cmsg89q0600c001s6oz54416g	Alerid			\N	20.00	15.00	80.00	10	active	{"expiryDate": "2027-05-29", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:14:24.87	2026-08-05 15:14:24.87	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942812/inventory/products/s0dezyo5dnmbi31r7mbz.webp	Piece	f	\N
cmsg8a42w00c301s6ube85wbw	Beige 			\N	250.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "250", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg6v0g5009601s6ur55tgt9	2026-08-05 15:14:43.112	2026-08-05 15:14:43.112	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942819/inventory/products/tg2apch7yvdyxo8qejej.webp	Piece	t	\N
cmsg8b3oh00c601s6q8rwxn5z	Avomine			\N	20.00	15.00	70.00	10	active	{"expiryDate": "2027-02-28", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:15:29.249	2026-08-05 15:15:29.249	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942876/inventory/products/ekdgi5jdukvgyt3z4qic.webp	Piece	f	\N
cmsg8b41h00c901s6q3wbscxl	Bobdog			\N	450.00	200.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "40000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Bale"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:15:29.717	2026-08-05 15:15:29.717	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942888/inventory/products/laxc2bqkvjam98lrxd8r.webp	Piece	t	\N
cmsg8c3y300cc01s6x4g6d48j	sprite			\N	20.00	16.67	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "400", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Crate"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 15:16:16.251	2026-08-05 15:16:16.251	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942937/inventory/products/eltucgoycoyoapcozt7j.webp	Piece	f	\N
cmsg8c8bh00cf01s6ktbeukfl	Sulisi			\N	350.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:16:21.917	2026-08-05 15:16:21.917	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942940/inventory/products/llzftcqnfe9knka3acrc.webp	Piece	t	\N
cmsg8cq8j00ci01s66hm33qy5	Calpol 650			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2027-11-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:16:45.139	2026-08-05 15:16:45.139	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785942946/inventory/products/w6uskrblh4ftsherjw6x.webp	Piece	f	\N
cmsg8e77600cl01s6ws2ez4em	Boat Shoe			\N	350.00	250.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "50000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:17:53.778	2026-08-05 15:17:53.778	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943042/inventory/products/ymdstoyc9sabwmuthxzy.webp	Piece	f	\N
cmsg8euve00co01s62axv43un	Eno			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2027-07-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	\N	2026-08-05 15:18:24.458	2026-08-05 15:18:24.458	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943046/inventory/products/gekm9bhhoagoquozteri.webp	Piece	f	\N
cmsg8fuir00cr01s6gclrz7tl	Keds			\N	350.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:19:10.659	2026-08-05 15:19:10.659	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943123/inventory/products/zb8gfn87ls4fuwmcdwlc.webp	Piece	t	\N
cmsg8fx9n00cu01s68oerrhoy	gordons			\N	5.00	4.17	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "5", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Bundle"}]}	cmsg38ejb000n01s66874af28	cmsg7i5ce009u01s61a3srmiv	2026-08-05 15:19:14.219	2026-08-05 15:19:14.219	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943100/inventory/products/i6gur21p3q8trboxeauu.webp	Piece	f	\N
cmsg8gn4z00cx01s6cil9bvl0	ORS Tablets 			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:19:47.747	2026-08-05 15:19:47.747	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943131/inventory/products/chkmgbd9wmcurmxhd5ev.webp	Piece	f	\N
cmsg8i3ud00d601s6bh1vbc9x	North face			\N	350.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "350", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:20:56.053	2026-08-05 15:20:56.053	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943205/inventory/products/zbirye8yqxgwwhbnqtyc.webp	Piece	t	\N
cmsg8i6a200d901s6dsl1lh95	Cialis			\N	20.00	15.00	80.00	10	active	{"expiryDate": "2027-03-31", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "150", "sellingPrice": "20", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:20:59.21	2026-08-05 15:20:59.21	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943216/inventory/products/k8ehsqghu5ejlijtla4t.webp	Piece	f	\N
cmsg8imws00dc01s6rrdtn1uf	beefeater			\N	90.00	83.33	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Bundle"}]}	cmsg38ejb000n01s66874af28	cmsg7i5ce009u01s61a3srmiv	2026-08-05 15:21:20.764	2026-08-05 15:21:20.764	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943227/inventory/products/jqs8jzavx71cidcvpe9w.webp	Piece	f	\N
cmsg8ja2c00df01s6ustgwmwn	Relief			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:21:50.772	2026-08-05 15:21:50.772	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943271/inventory/products/jv0jwn4uvyaghunir3as.webp	Piece	f	\N
cmsg8jer200di01s630q8gm8j	Relief			\N	15.00	10.00	80.00	10	active	{"expiryDate": "2026-08-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:21:56.846	2026-08-05 15:21:56.846	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943271/inventory/products/jv0jwn4uvyaghunir3as.webp	Piece	f	\N
cmsg8jlz400dl01s66iqd5h6c	Running Shoe			\N	400.00	150.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "30000", "sellingPrice": "400", "sellingUnitName": "Piece", "unitsPerPackage": "200", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 15:22:06.208	2026-08-05 15:22:06.208	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943269/inventory/products/gz5usegtwr34vi7jp7tx.webp	Piece	t	\N
cmsg8li3n00do01s6nh1yknq6	Nurofen			\N	30.00	20.00	80.00	10	active	{"expiryDate": "2027-02-27", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "30", "sellingUnitName": "Piece", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 15:23:34.499	2026-08-05 15:23:34.499	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943362/inventory/products/clxdergobqe462vdg9am.webp	Piece	f	\N
cmsg8luv500dr01s69fl3ky5x	tanqueray			\N	110.00	104.17	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2500", "sellingPrice": "110", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg7i5ce009u01s61a3srmiv	2026-08-05 15:23:51.041	2026-08-05 15:23:51.041	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943381/inventory/products/jrqg5pjxegqv5kov9xbc.webp	Piece	f	\N
cmsg8o9td00du01s6myc0qh5u	Broxovic			\N	20.00	16.67	80.00	10	active	{"expiryDate": "2027-01-30", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "200", "sellingPrice": "20", "sellingUnitName": "Bottle", "unitsPerPackage": "12", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg40ypn002601s6ssptt538	2026-08-05 15:25:43.729	2026-08-05 15:25:43.729	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943484/inventory/products/c4pnpcsixpk2magzpy8e.webp	Piece	f	\N
cmsg5ri4a005101s60he6v9bu	XBOX SERIES X			\N	17000.00	12000.00	13.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5k170004o01s6a0fva9xw	2026-08-05 14:04:15.61	2026-08-05 15:25:55.614	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938618/inventory/products/uh7caj6jlcm7pmzvgzhu.webp	Piece	f	\N
cmsg5ma2p004t01s6z1mechsf	STEAM DECK			\N	4000.00	2000.00	13.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5k170004o01s6a0fva9xw	2026-08-05 14:00:11.905	2026-08-05 15:25:55.64	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785938367/inventory/products/daamgmgt8oaaxncz51rp.webp	Piece	f	\N
cmsg57083004201s6m0lzae0k	APPLE MACBOOK AIR			\N	30000.00	23000.00	14.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg4ecj9002y01s6qa8w3byt	2026-08-05 13:48:19.299	2026-08-05 15:25:55.664	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937668/inventory/products/swgbzpejyk9d8bpaoshd.webp	Piece	f	\N
cmsg5656e004001s6k4if24v3	HP SPECTRE x360			\N	20000.00	12000.00	14.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg4ecj9002y01s6qa8w3byt	2026-08-05 13:47:39.062	2026-08-05 15:25:55.685	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785937585/inventory/products/elj7oubbb4rjaqnfzjaz.webp	Piece	f	\N
cmsg66qp5006k01s6umuf7ioi	JUICER			\N	70.00	55.00	14.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg5wou2005e01s62eugzi8p	2026-08-05 14:16:06.569	2026-08-05 15:25:55.746	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939731/inventory/products/uidk0gpkuapyvj9pnoct.webp	Piece	f	\N
cmsg6lsfd008701s6jxn10tyo	MODEM			\N	1500.00	900.00	13.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg6iais007t01s6vyp6rl4v	2026-08-05 14:27:48.649	2026-08-05 15:25:55.768	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940411/inventory/products/nmlqvclqhkz2gdhpmtu8.webp	Piece	f	\N
cmsg6l4zv008501s62ztrajgj	ETHERNET CABLE			\N	1000.00	700.00	19.00	10	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg6iais007t01s6vyp6rl4v	2026-08-05 14:27:18.283	2026-08-05 15:25:55.798	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785940395/inventory/products/nnylz1ggxmk5w9ljqoei.webp	Piece	f	\N
cmsg8ou7400em01s64fd0mci0	champagne			\N	90.00	83.33	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "2000", "sellingPrice": "90", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg3rtpf001r01s6dkv01peg	2026-08-05 15:26:10.144	2026-08-05 15:26:10.144	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943495/inventory/products/y9dv7xicucerm3gyop0g.webp	Piece	f	\N
cmsg8u8si00fv01s6068qszq5	fruit juice			\N	70.00	62.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Box"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 15:30:22.338	2026-08-05 15:30:22.338	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943705/inventory/products/dhab2ycfpkwemcxbrjka.webp	Piece	f	\N
cmsg8x8td00fy01s6vspsombj	tonic water			\N	70.00	62.50	96.00	10	active	{"isAlcoholic": true, "packagingUnits": [{"barcode": "", "purchaseCost": "1500", "sellingPrice": "70", "sellingUnitName": "Bottle", "unitsPerPackage": "24", "purchaseUnitName": "Carton"}]}	cmsg38ejb000n01s66874af28	cmsg53xl9003o01s6u8mhewey	2026-08-05 15:32:42.337	2026-08-05 15:32:42.337	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785943912/inventory/products/jlumvoxsw2xw9nd8rlh2.webp	Piece	f	\N
cmsg6bex8007301s6gcc11zp5	Air Forces 			\N	450.00	250.00	200.00	10	active	{"packagingUnits": [{"barcode": "", "purchaseCost": "3000", "sellingPrice": "450", "sellingUnitName": "Piece", "unitsPerPackage": "12", "purchaseUnitName": "Barrel"}]}	cmsg3mply001h01s6fbg9j6j0	cmsg5rd5u004z01s6ov2oxpci	2026-08-05 14:19:44.588	2026-08-05 15:36:36.871	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785939515/inventory/products/emm2axwkml7iy2ucyypx.webp	Piece	t	\N
cmsg4g34p003001s6z5h1cjxu	Paracetamol 			\N	15.00	10.00	56.00	10	active	{"expiryDate": "2027-03-05", "batchNumber": "", "packagingUnits": [{"barcode": "", "purchaseCost": "100", "sellingPrice": "15", "sellingUnitName": "Packet", "unitsPerPackage": "10", "purchaseUnitName": "Box"}]}	cmsg3i0h4001801s67p002bbz	cmsg3x11f002101s6i0lld6x6	2026-08-05 13:27:23.353	2026-08-05 15:41:57.545	\N	f	f	Paracetamol 500mg	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936164/inventory/products/nb65p38u2wweu9wwyzll.webp	Piece	f	\N
cmsg49mq4002l01s6vhym2ei1	IPHONE 18			\N	75000.00	55000.00	20.00	5	active	{"packagingUnits": []}	cmsg3amla000x01s698usq8fn	cmsg3tpwg001w01s6wkwsw8l2	2026-08-05 13:22:22.156	2026-08-05 15:39:26.013	\N	f	f	\N	f	\N	\N	PRODUCT	https://res.cloudinary.com/daojpref4/image/upload/v1785936103/inventory/products/fkf1mrfpi0gepqrof95c.webp	Piece	f	\N
\.


--
-- Data for Name: ProductBundle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductBundle" (id, name, description, "bundlePrice", "imageUrl", status, "businessId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductUnit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductUnit" (id, "productId", name, ratio, "sellingPrice", "costPrice", barcode, "createdAt", "updatedAt") FROM stdin;
cmrnkncxc000i01s62bxesxof	cmrnkm34d000f01s66kijfnfa	Unit	12.0000	25.00	20.83		2026-07-16 13:55:37.392	2026-07-16 13:55:37.392
cmryxuvgw000901s6wqqrhj10	cmrmqk58o000d01s6fzatd6n0	Piece	12.0000	0.00	0.00		2026-07-24 12:50:50.96	2026-07-24 12:50:50.96
cmsg40e8g002401s6fyax6n2k	cmsg40e83002301s6r8dz9yjf	Bottle	24.0000	110.00	104.17		2026-08-05 13:15:11.235	2026-08-05 13:15:11.235
cmsg458qm002f01s6naq4wmex	cmsg458q8002e01s6478pm5l6	Bottle	24.0000	115.00	104.17		2026-08-05 13:18:57.392	2026-08-05 13:18:57.392
cmsg4agan002o01s6k4gfa4a0	cmsg4agai002n01s6o1e6auva	Bottle	24.0000	130.00	125.00		2026-08-05 13:23:00.474	2026-08-05 13:23:00.474
cmsg4g34u003101s6t82gg343	cmsg4g34p003001s6z5h1cjxu	Packet	10.0000	15.00	10.00		2026-08-05 13:27:23.353	2026-08-05 13:27:23.353
cmsg4j10a003701s6xkdtluik	cmsg4j105003601s61tbanl2z	Bottle	24.0000	215.00	208.33		2026-08-05 13:29:40.565	2026-08-05 13:29:40.565
cmsg4pmhh003a01s6p2og3mll	cmsg4pmhd003901s6vm7bcwcu	Bottle	24.0000	50.00	41.67		2026-08-05 13:34:48.337	2026-08-05 13:34:48.337
cmsg4v5oi003d01s66eru4chq	cmsg4v5od003c01s6mss6m6vm	Packet	12.0000	15.00	8.33		2026-08-05 13:39:06.493	2026-08-05 13:39:06.493
cmsg5042a003k01s6y709vhnw	cmsg50425003j01s6jrz4yj4e	Packet	12.0000	15.00	8.33		2026-08-05 13:42:57.677	2026-08-05 13:42:57.677
cmsg54cbl003r01s6r32isqqc	cmsg54cbf003q01s6kd00gec0	Packet	12.0000	12.00	6.67		2026-08-05 13:46:15.003	2026-08-05 13:46:15.003
cmsg58oc1004501s6qvft62mm	cmsg58obu004401s60j7l9qsu	Piece	300.0000	250.00	166.67		2026-08-05 13:49:37.194	2026-08-05 13:49:37.194
cmsg58oc2004601s6uxmn8jk0	cmsg58obu004401s60j7l9qsu	Piece	12.0000	0.00	0.00		2026-08-05 13:49:37.194	2026-08-05 13:49:37.194
cmsg599ix004901s60mcnvhhr	cmsg599is004801s6r0mgmpnc	Bottle	12.0000	10.00	5.83		2026-08-05 13:50:04.66	2026-08-05 13:50:04.66
cmsg5cbda004e01s6nauw08b6	cmsg5cbd3004d01s65xg4s2x1	Piece	10.0000	20.00	8.00		2026-08-05 13:52:27.015	2026-08-05 13:52:27.015
cmsg5cbda004f01s6ckcqrb25	cmsg5cbd3004d01s65xg4s2x1	Bottle	12.0000	20.00	8.33		2026-08-05 13:52:27.015	2026-08-05 13:52:27.015
cmsg5cbml004i01s6yqn43cd9	cmsg5cbma004h01s6uj70ztjx	Bottle	24.0000	35.00	29.17		2026-08-05 13:52:27.346	2026-08-05 13:52:27.346
cmsg5hpfx004m01s6l4jkes8s	cmsg5hpfr004l01s6l77hutho	Piece	100.0000	250.00	200.00		2026-08-05 13:56:38.535	2026-08-05 13:56:38.535
cmsg5kcnh004r01s6p6gs6n98	cmsg5kcnb004q01s6tnosoctn	Bottle	24.0000	40.00	37.50		2026-08-05 13:58:41.927	2026-08-05 13:58:41.927
cmsg5s0v7005401s6kj9u96jm	cmsg5s0v2005301s6y43tsovn	Bottle	24.0000	30.00	20.83		2026-08-05 14:04:39.902	2026-08-05 14:04:39.902
cmsg5u2sh005901s6iy233e02	cmsg5u2sc005801s6dmwvo4di	Piece	200.0000	300.00	250.00		2026-08-05 14:06:15.708	2026-08-05 14:06:15.708
cmsg5wo1o005c01s69d2yix37	cmsg5wo1j005b01s63lzjllf8	Bottle	24.0000	40.00	37.50		2026-08-05 14:08:16.567	2026-08-05 14:08:16.567
cmsg619na005t01s6wb95fse9	cmsg619n5005s01s6znryjlbz	Bottle	12.0000	10.00	7.08		2026-08-05 14:11:51.185	2026-08-05 14:11:51.185
cmsg61sa0005z01s6380kkjsw	cmsg61s9u005y01s63b6yk2ke	Portion	12.0000	10.00	6.67		2026-08-05 14:12:15.33	2026-08-05 14:12:15.33
cmsg63du8006601s68fv4ckrk	cmsg63du2006501s6vw8fgqbl	Portion	12.0000	10.00	6.67		2026-08-05 14:13:29.93	2026-08-05 14:13:29.93
cmsg65l37006g01s69nkotv90	cmsg65l31006f01s69kobogp2	Portion	12.0000	10.00	6.67		2026-08-05 14:15:12.637	2026-08-05 14:15:12.637
cmsg67o18006n01s60t1i9yxs	cmsg67o14006m01s67s6yaji6	Piece	100.0000	450.00	300.00		2026-08-05 14:16:49.768	2026-08-05 14:16:49.768
cmsg6877q006u01s60xtvho8n	cmsg6877k006t01s6krlyutz1	Portion	12.0000	10.00	5.00		2026-08-05 14:17:14.624	2026-08-05 14:17:14.624
cmsg6ay6q007001s6r4e7j1g7	cmsg6ay6k006z01s6xi9ms0ww	Cup	12.0000	10.00	8.33		2026-08-05 14:19:22.893	2026-08-05 14:19:22.893
cmsg6dbwn007701s6u5y113cp	cmsg6dbwi007601s60jtmez5n	Bottle	24.0000	130.00	125.00		2026-08-05 14:21:13.986	2026-08-05 14:21:13.986
cmsg6fmgj007i01s61oa52l24	cmsg6fmgd007h01s69qe71sop	Piece	200.0000	250.00	200.00		2026-08-05 14:23:00.973	2026-08-05 14:23:00.973
cmsg6guj1007q01s649p2ehea	cmsg6guiv007p01s6e8ql6fij	Bottle	24.0000	130.00	125.00		2026-08-05 14:23:58.087	2026-08-05 14:23:58.087
cmsg6k9o8007y01s68acv3u4m	cmsg6k9o2007x01s6dlcbs83v	Bottle	24.0000	30.00	25.00		2026-08-05 14:26:37.682	2026-08-05 14:26:37.682
cmsg6kdxx008301s6kfnyupqz	cmsg6kdxr008201s67l7aamcb	Piece	200.0000	450.00	200.00		2026-08-05 14:26:43.215	2026-08-05 14:26:43.215
cmsg6m8q0008a01s6wk4deu4y	cmsg6m8pv008901s698emlh89	Bottle	25.0000	10.00	6.00		2026-08-05 14:28:09.763	2026-08-05 14:28:09.763
cmsg6ma8g008d01s6rh38cyu7	cmsg6ma8a008c01s62j86g36g	Piece	200.0000	450.00	200.00		2026-08-05 14:28:11.722	2026-08-05 14:28:11.722
cmsg6ou72008m01s6x0ovq3si	cmsg6ou6w008l01s6k58s2dzl	Piece	200.0000	400.00	200.00		2026-08-05 14:30:10.904	2026-08-05 14:30:10.904
cmsg6p5wd008p01s628qgsjiy	cmsg6p5w8008o01s6aludbqvq	Bottle	24.0000	30.00	25.00		2026-08-05 14:30:26.072	2026-08-05 14:30:26.072
cmsg6sgqu008x01s60k45mihx	cmsg6sgqo008w01s6026x78jt	Bottle	24.0000	70.00	62.50		2026-08-05 14:33:00.096	2026-08-05 14:33:00.096
cmsg6voeq009901s6kasnm441	cmsg6voek009801s64lqcjrya	Bottle	12.0000	20.00	8.33		2026-08-05 14:35:29.996	2026-08-05 14:35:29.996
cmsg6x4iq009e01s63sbka84i	cmsg6x4ik009d01s6tpa1qyfc	Piece	200.0000	350.00	200.00		2026-08-05 14:36:37.532	2026-08-05 14:36:37.532
cmsg7d5ds009j01s6ebm4w0rg	cmsg7d5dc009i01s6cen1qln8	Bottle	24.0000	35.00	33.33		2026-08-05 14:49:05.136	2026-08-05 14:49:05.136
cmsg7e1od009m01s67qu3hcjn	cmsg7e1o5009l01s654hcp5pw	Piece	200.0000	300.00	200.00		2026-08-05 14:49:46.997	2026-08-05 14:49:46.997
cmsg7gqr4009p01s6o69w5wew	cmsg7gqqy009o01s6wze6g37b	Bottle	24.0000	40.00	37.50		2026-08-05 14:51:52.81	2026-08-05 14:51:52.81
cmsg7ht7f009s01s6z8bp4ff5	cmsg7ht78009r01s6scudo3um	Piece	200.0000	350.00	150.00		2026-08-05 14:52:42.644	2026-08-05 14:52:42.644
cmsg7kd66009x01s6or2ur3bh	cmsg7kd5z009w01s6puxm6pi2	Piece	200.0000	450.00	150.00		2026-08-05 14:54:41.831	2026-08-05 14:54:41.831
cmsg7md7s00a001s6v8aiz6pw	cmsg7md7m009z01s6xzw8c2ti	Bottle	24.0000	45.00	41.67		2026-08-05 14:56:15.202	2026-08-05 14:56:15.202
cmsg7nkyp00a601s61smi5wrc	cmsg7nkyj00a501s6rwqi0sm1	Piece	200.0000	500.00	175.00		2026-08-05 14:57:11.899	2026-08-05 14:57:11.899
cmsg7qs5m00a901s6uppn8p2u	cmsg7qs5h00a801s6mmw3bwuw	Bottle	24.0000	90.00	83.33		2026-08-05 14:59:41.189	2026-08-05 14:59:41.189
cmsg7r33400ac01s6x8ndkm08	cmsg7r32s00ab01s6dhdndg9i	Piece	200.0000	450.00	250.00		2026-08-05 14:59:55.348	2026-08-05 14:59:55.348
cmsg7tngo00af01s6660we4ix	cmsg7tngj00ae01s66lwmcnmi	Piece	200.0000	350.00	150.00		2026-08-05 15:01:55.075	2026-08-05 15:01:55.075
cmsg7v0yr00am01s67k8zxj4d	cmsg7v0yl00al01s63jqgyu04	Bottle	24.0000	110.00	104.17		2026-08-05 15:02:59.229	2026-08-05 15:02:59.229
cmsg7v9bd00ap01s6898v7rsj	cmsg7v9b800ao01s6fhom7t9b	Bottle	12.0000	15.00	6.67		2026-08-05 15:03:10.052	2026-08-05 15:03:10.052
cmsg7wq2i00as01s6iucrrfku	cmsg7wq2c00ar01s6o2spsh54	Packet	12.0000	15.00	8.33		2026-08-05 15:04:18.42	2026-08-05 15:04:18.42
cmsg7yvcb00av01s661lvhm32	cmsg7yvc500au01s6fsrb08y1	Packet	12.0000	15.00	12.50		2026-08-05 15:05:58.565	2026-08-05 15:05:58.565
cmsg7z96100ay01s6jim574zm	cmsg7z95u00ax01s62g0dkr4y	Piece	200.0000	450.00	200.00		2026-08-05 15:06:16.482	2026-08-05 15:06:16.482
cmsg80mee00b101s6m3xll9d3	cmsg80me800b001s6moo4iui6	Bottle	24.0000	130.00	125.00		2026-08-05 15:07:20.288	2026-08-05 15:07:20.288
cmsg816q100b401s68rkjg0yf	cmsg816pt00b301s6knhcauwr	Packet	12.0000	15.00	8.33		2026-08-05 15:07:46.625	2026-08-05 15:07:46.625
cmsg818qw00b801s68k9wk3ep	cmsg818qq00b701s6evmsh1ow	Piece	200.0000	250.00	200.00		2026-08-05 15:07:49.25	2026-08-05 15:07:49.25
cmsg82ybi00bb01s6bpsy3c22	cmsg82ybc00ba01s6w2j4wtta	Packet	20.0000	20.00	10.00		2026-08-05 15:09:09.048	2026-08-05 15:09:09.048
cmsg83utj00be01s6cdaikn1u	cmsg83utd00bd01s6f4yg27vl	Piece	200.0000	350.00	200.00		2026-08-05 15:09:51.169	2026-08-05 15:09:51.169
cmsg84kek00bi01s65dtmrc3g	cmsg84kee00bh01s6xghajjxm	Bottle	10.0000	15.00	10.00		2026-08-05 15:10:24.326	2026-08-05 15:10:24.326
cmsg852nc00bl01s6m9ex8vhq	cmsg852n600bk01s6m6vmqmix	Bottle	24.0000	130.00	125.00		2026-08-05 15:10:47.97	2026-08-05 15:10:47.97
cmsg8734v00bo01s6gb94tok7	cmsg8734p00bn01s694mukfa5	Packet	10.0000	15.00	10.00		2026-08-05 15:12:21.913	2026-08-05 15:12:21.913
cmsg8745g00br01s6efm8hfo9	cmsg8745900bq01s68epcelo2	Packet	10.0000	15.00	10.00		2026-08-05 15:12:23.229	2026-08-05 15:12:23.229
cmsg88as000bv01s6rkqck9i2	cmsg88aru00bu01s6hayis21e	Packet	10.0000	15.00	10.00		2026-08-05 15:13:18.475	2026-08-05 15:13:18.475
cmsg88uju00by01s6eme13pb0	cmsg88ujp00bx01s6aq835pom	Bottle	24.0000	130.00	125.00		2026-08-05 15:13:44.101	2026-08-05 15:13:44.101
cmsg8fx9t00cv01s6pjvbp5r2	cmsg8fx9n00cu01s68oerrhoy	Bottle	24.0000	5.00	4.17		2026-08-05 15:19:14.219	2026-08-05 15:19:14.219
cmsg8gn5500cy01s60k8dhrmx	cmsg8gn4z00cx01s6cil9bvl0	Packet	10.0000	15.00	10.00		2026-08-05 15:19:47.747	2026-08-05 15:19:47.747
cmsg8imwz00dd01s6c8jjk198	cmsg8imws00dc01s6rrdtn1uf	Bottle	24.0000	90.00	83.33		2026-08-05 15:21:20.764	2026-08-05 15:21:20.764
cmsg8ja2i00dg01s66q7eihjh	cmsg8ja2c00df01s6ustgwmwn	Packet	10.0000	15.00	10.00		2026-08-05 15:21:50.772	2026-08-05 15:21:50.772
cmsg8jer900dj01s6h1tjtxlj	cmsg8jer200di01s630q8gm8j	Packet	10.0000	15.00	10.00		2026-08-05 15:21:56.846	2026-08-05 15:21:56.846
cmsg8jlza00dm01s6k46glxg8	cmsg8jlz400dl01s66iqd5h6c	Piece	200.0000	400.00	150.00		2026-08-05 15:22:06.208	2026-08-05 15:22:06.208
cmsg8li3t00dp01s637sxyyep	cmsg8li3n00do01s6nh1yknq6	Piece	10.0000	30.00	20.00		2026-08-05 15:23:34.499	2026-08-05 15:23:34.499
cmsg8luvb00ds01s6q53ajuqb	cmsg8luv500dr01s69fl3ky5x	Bottle	24.0000	110.00	104.17		2026-08-05 15:23:51.041	2026-08-05 15:23:51.041
cmsg89q0d00c101s62r38rtde	cmsg89q0600c001s6oz54416g	Piece	10.0000	20.00	15.00		2026-08-05 15:14:24.87	2026-08-05 15:14:24.87
cmsg8a43400c401s6dkritqs2	cmsg8a42w00c301s6ube85wbw	Piece	200.0000	250.00	150.00		2026-08-05 15:14:43.112	2026-08-05 15:14:43.112
cmsg8b3on00c701s6rx49nzrj	cmsg8b3oh00c601s6q8rwxn5z	Packet	10.0000	20.00	15.00		2026-08-05 15:15:29.249	2026-08-05 15:15:29.249
cmsg8b41n00ca01s671ysvzup	cmsg8b41h00c901s6q3wbscxl	Piece	200.0000	450.00	200.00		2026-08-05 15:15:29.717	2026-08-05 15:15:29.717
cmsg8c3y800cd01s6ajau1ega	cmsg8c3y300cc01s6x4g6d48j	Bottle	24.0000	20.00	16.67		2026-08-05 15:16:16.251	2026-08-05 15:16:16.251
cmsg8c8bn00cg01s6ucygplo5	cmsg8c8bh00cf01s6ktbeukfl	Piece	200.0000	350.00	150.00		2026-08-05 15:16:21.917	2026-08-05 15:16:21.917
cmsg8cq8q00cj01s6u98lqai9	cmsg8cq8j00ci01s66hm33qy5	Packet	10.0000	15.00	10.00		2026-08-05 15:16:45.139	2026-08-05 15:16:45.139
cmsg8e77d00cm01s67pgrvlga	cmsg8e77600cl01s6ws2ez4em	Piece	200.0000	350.00	250.00		2026-08-05 15:17:53.778	2026-08-05 15:17:53.778
cmsg8euvj00cp01s6nnyzfara	cmsg8euve00co01s62axv43un	Packet	10.0000	15.00	10.00		2026-08-05 15:18:24.458	2026-08-05 15:18:24.458
cmsg8fuix00cs01s6gi87zwvl	cmsg8fuir00cr01s6gclrz7tl	Piece	200.0000	350.00	150.00		2026-08-05 15:19:10.659	2026-08-05 15:19:10.659
cmsg8i3uj00d701s6yy8ehz4r	cmsg8i3ud00d601s6bh1vbc9x	Piece	200.0000	350.00	150.00		2026-08-05 15:20:56.053	2026-08-05 15:20:56.053
cmsg8i6a700da01s6ez9h22ot	cmsg8i6a200d901s6dsl1lh95	Packet	10.0000	20.00	15.00		2026-08-05 15:20:59.21	2026-08-05 15:20:59.21
cmsg8o9tj00dv01s6hy6oouq2	cmsg8o9td00du01s6myc0qh5u	Bottle	12.0000	20.00	16.67		2026-08-05 15:25:43.729	2026-08-05 15:25:43.729
cmsg8ou7a00en01s6r9hvz5xc	cmsg8ou7400em01s64fd0mci0	Bottle	24.0000	90.00	83.33		2026-08-05 15:26:10.144	2026-08-05 15:26:10.144
cmsg8u8so00fw01s6edvh2r9n	cmsg8u8si00fv01s6068qszq5	Bottle	24.0000	70.00	62.50		2026-08-05 15:30:22.338	2026-08-05 15:30:22.338
cmsg8x8tj00fz01s6qww9l3vc	cmsg8x8td00fy01s6vspsombj	Bottle	24.0000	70.00	62.50		2026-08-05 15:32:42.337	2026-08-05 15:32:42.337
cmsg929sj00g301s6jgixcrh6	cmsg6bex8007301s6gcc11zp5	Piece	12.0000	450.00	250.00		2026-08-05 15:36:36.883	2026-08-05 15:36:36.883
cmshnotw5000301s674ms6veo	cmsg6r3wv008r01s6ti56ge53	Piece	200.0000	450.00	225.00		2026-08-06 15:13:50.165	2026-08-06 15:13:50.165
cmshnpamt000501s6446pk8ud	cmsg49je5002i01s6cvarwut0	Piece	200.0000	200.00	150.00		2026-08-06 15:14:11.861	2026-08-06 15:14:11.861
cmshnpv7d000701s63hqb9xz5	cmsg61eos005v01s6rekxul60	Piece	100.0000	100.00	95.00		2026-08-06 15:14:38.521	2026-08-06 15:14:38.521
cmshnqh5i000901s6kxoahx0t	cmsg4gzq9003301s6e5dc9uxa	Piece	300.0000	350.00	333.33		2026-08-06 15:15:06.966	2026-08-06 15:15:06.966
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Promotion" (id, name, description, type, value, "minQty", "freeQty", "minAmount", "startDate", "endDate", status, "appliesTo", "categoryId", "productId", "businessId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Purchase; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Purchase" (id, "invoiceNumber", "totalAmount", status, "supplierId", "businessId", "userId", "createdAt", "updatedAt", "deletedAt", attachments, "dueDate", "paidAmount", "paymentStatus") FROM stdin;
cmrtaltvp000701s6ubddsgvv	PO-2026-4940	2800.00	COMPLETED	cmrndbmox000701s60mewvkbs	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:01:06.949	2026-07-20 14:01:06.949	\N	{}	\N	0.00	PAID
cmrtbu0vs000x01s6rb4qysgn	PO-2026-4622	2800.00	COMPLETED	cmrndbmox000701s60mewvkbs	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:35:28.888	2026-07-20 14:35:28.888	\N	{}	\N	0.00	PAID
cms0oaf5j000l01s6frcb82v3	PO-2026-7289	5000.00	COMPLETED	\N	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 17:58:32.503	2026-07-25 17:58:32.503	\N	{}	\N	0.00	PAID
cms0ynhoc000101s69eyvfa61	PO-2026-715	2800.00	COMPLETED	cmrwrn7yb00002wln0qr31tlu	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 22:48:38.46	2026-07-25 22:48:38.46	\N	{}	\N	0.00	PAID
\.


--
-- Data for Name: PurchaseItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PurchaseItem" (id, "purchaseId", "productId", quantity, "unitCost", total, "businessId", "unitId") FROM stdin;
cmrtaltw1000801s6t6l2bewf	cmrtaltvp000701s6ubddsgvv	cmrmqk58o000d01s6fzatd6n0	30	2800.00	84000.00	cmrmq5v0e000301s68rl1kxrs	\N
cmrtbu0vx000y01s65fchromu	cmrtbu0vs000x01s6rb4qysgn	cmrmqk58o000d01s6fzatd6n0	50	2800.00	140000.00	cmrmq5v0e000301s68rl1kxrs	\N
cms0oaf5z000m01s6ve2775zd	cms0oaf5j000l01s6frcb82v3	cms08hjg7000301s6n8j1gozw	12	5000.00	60000.00	cmrmq5v0e000301s68rl1kxrs	\N
cms0ynhon000201s6rsi9epyb	cms0ynhoc000101s69eyvfa61	cmrmqk58o000d01s6fzatd6n0	40	2800.00	112000.00	cmrmq5v0e000301s68rl1kxrs	\N
\.


--
-- Data for Name: PushSubscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PushSubscription" (id, endpoint, "keysAuth", "keysP256dh", "businessId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Quote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Quote" (id, reference, "customerId", status, "totalAmount", notes, "validUntil", "businessId", "createdAt", "updatedAt") FROM stdin;
cmrt53p60000201s6paw2ppz5	QT-731264	cmrnjtixj000101s6ccu7re0t	DRAFT	1700.00	This quote is valid for 14 days. Prices may vary after expiry.	2026-08-03 00:00:00	cmrmq5v0e000301s68rl1kxrs	2026-07-20 11:27:02.952	2026-07-20 11:27:02.952
\.


--
-- Data for Name: QuoteItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."QuoteItem" (id, "quoteId", "productId", quantity, "unitPrice", amount) FROM stdin;
cmrt53p6i000301s6cd8xg4l1	cmrt53p60000201s6paw2ppz5	cmrmri2zt001601s6zqhoba8z	1	1700.00	1700.00
\.


--
-- Data for Name: Referral; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Referral" (id, "referrerBusinessId", "referredBusinessId", "codeUsed", status, "rewardGranted", "rewardDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReferralCode; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ReferralCode" (id, "businessId", code, "createdAt") FROM stdin;
cms8v7bc2000101s62tn5t0qy	cmrmq5v0e000301s68rl1kxrs	PTA-JGGSFD	2026-07-31 11:34:14.307
cmsd9hj8x000801s62ynck9ty	cmsd9himw000101s6z1fvs8fl	PRO-MJWXM6	2026-08-03 13:25:10.449
cmsg38f82000u01s67jzy3swc	cmsg38ejb000n01s66874af28	PTA-QZWVY1	2026-08-05 12:53:26.162
cmsg3an0w001401s6korzim0x	cmsg3amla000x01s698usq8fn	PRO-8X2MVB	2026-08-05 12:55:09.584
cmsg3i12q001f01s6kgfyxu6n	cmsg3i0h4001801s67p002bbz	PRO-ZL9XAK	2026-08-05 13:00:54.386
cmsg3mq63001o01s62z7jkoms	cmsg3mply001h01s6fbg9j6j0	PASL-BUZF1M	2026-08-05 13:04:33.532
cmshcxmiv000901s6hr2rc77o	cmshcxlvv000001s682ba2jim	PASL-MEYJ68	2026-08-06 10:12:44.743
\.


--
-- Data for Name: RestaurantTable; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RestaurantTable" (id, name, capacity, status, "businessId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Role" (id, name, "businessId", "createdAt", "updatedAt") FROM stdin;
cmrjt1kr90001lclngzxcqgwv	SUPERADMIN	cmrjt12jq0000lcln3os8anz5	2026-07-13 22:39:32.949	2026-07-13 22:39:32.949
cmsd9hiod000201s6fw71e0g0	ADMIN	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.709	2026-08-03 13:25:09.709
cmsd9hip7000301s67inbuxgb	MANAGER	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.739	2026-08-03 13:25:09.739
cmsd9hipk000401s64lys2xfy	EMPLOYEE	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.752	2026-08-03 13:25:09.752
cmsd9hipx000501s6g86o1uta	CASHIER	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.765	2026-08-03 13:25:09.765
cmsd9hiqc000601s653sccrvr	STOCK_KEEPER	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.78	2026-08-03 13:25:09.78
cmsg38emx000p01s6b4e58pdw	MANAGER	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.401	2026-08-05 12:53:25.401
cmsg38enj000q01s64een1qgt	EMPLOYEE	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.423	2026-08-05 12:53:25.423
cmsg38eo4000r01s61o1pri2l	CASHIER	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.444	2026-08-05 12:53:25.444
cmsg38eow000s01s6d9ou7j2z	STOCK_KEEPER	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.472	2026-08-05 12:53:25.472
cmsg3amlo000y01s68i943xdm	ADMIN	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.036	2026-08-05 12:55:09.036
cmsg3amme000z01s65jutq8nq	MANAGER	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.062	2026-08-05 12:55:09.062
cmsg3ammz001001s6ll3q1fwk	EMPLOYEE	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.083	2026-08-05 12:55:09.083
cmsg3amnk001101s6ds91z3js	CASHIER	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.104	2026-08-05 12:55:09.104
cmsg3amo5001201s62cezj8bk	STOCK_KEEPER	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.125	2026-08-05 12:55:09.125
cmsg3i0hm001901s6rlnbatlj	ADMIN	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.626	2026-08-05 13:00:53.626
cmsg3i0it001a01s6v4io89xf	MANAGER	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.669	2026-08-05 13:00:53.669
cmsg3i0jg001b01s6dhatuv4h	EMPLOYEE	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.692	2026-08-05 13:00:53.692
cmsg3i0kb001c01s624jirtbl	PHARMACIST	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.723	2026-08-05 13:00:53.723
cmsg3i0lb001d01s6ktq2fqav	CASHIER	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.759	2026-08-05 13:00:53.759
cmsg38ell000o01s6zommxaq3	ADMIN	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.353	2026-08-05 13:02:33.65
cmsg3mpmf001i01s6iy5pzbsu	ADMIN	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.823	2026-08-05 13:04:32.823
cmsg3mpn2001j01s6j94skhw6	MANAGER	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.846	2026-08-05 13:04:32.846
cmsg3mpno001k01s64f9g0km1	EMPLOYEE	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.868	2026-08-05 13:04:32.868
cmsg3mpol001l01s6pc6yibgy	CASHIER	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.901	2026-08-05 13:04:32.901
cmsg3mpp6001m01s67po31qms	STOCK_KEEPER	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.922	2026-08-05 13:04:32.922
cmshcxly8000101s6ory43vyf	ADMIN	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44	2026-08-06 10:12:44
cmshcxm0b000301s60gqzf682	EMPLOYEE	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.075	2026-08-06 10:12:44.075
cmshcxm2x000501s6ehhpvwtq	NURSE	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.169	2026-08-06 10:12:44.169
cmshcxm3v000701s6hzhhjfqc	RECEPTIONIST	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.203	2026-08-06 10:12:44.203
cmshcxm2a000401s67ht5uc6j	DOCTOR	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.146	2026-08-06 10:34:11.399
cmshcxm3e000601s6zqtuwvbh	LAB_TECH	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.186	2026-08-06 10:35:33.005
cmshcxlzu000201s68xr0orvj	MANAGER	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.058	2026-08-06 10:36:22.856
cmrmq5v2q000601s6hy4eis3z	EMPLOYEE	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:42:12.626	2026-07-22 12:07:28.063
cmrmq5v39000801s64b7eoaa8	STOCK_KEEPER	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:42:12.645	2026-07-22 20:36:01.276
cmrmq5v1p000401s6y72lcc3w	ADMIN	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:42:12.589	2026-07-22 20:48:37.437
cms9a7hzw000701s67rlguzp7	MANAGER 	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:34:17.18	2026-07-31 18:34:17.18
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Sale" (id, "invoiceNumber", "totalAmount", discount, tax, "paymentMethod", "paymentStatus", status, "businessId", "userId", "customerId", "patientId", "tableId", "createdAt", "deletedAt", "updatedAt", "staffId", "staffName", attachments, "splitPayments") FROM stdin;
cmrms6iym001l01s6581k5tqh	SRV-260716-1297	2000.00	0.00	0.00	CASH	PAID	COMPLETED	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-16 00:38:42.814	\N	2026-07-16 00:38:42.814	\N	Mr Moseray	{}	\N
cmrncr222000301s6zyhm6n2b	SRV-260716-8420	2000.00	0.00	0.00	CASH	PAID	COMPLETED	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-16 10:14:33.002	\N	2026-07-16 10:14:33.002	\N	Mr Edwin	{}	\N
cmrnjuooa000301s6p2rwrpz0	INV-1784208799565-566	10000.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-16 13:33:19.594	\N	2026-07-16 13:33:19.594	\N	\N	{}	\N
cmrnk2lcp000201s6eozlh8u2	INV-1784209168518-44	28500.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-16 13:39:28.537	\N	2026-07-16 13:39:28.537	\N	\N	{}	\N
cmrnlokj5000001s6d7o14fzy	INV-1784211873498-196	5000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-16 14:24:33.521	\N	2026-07-16 14:24:33.521	\N	\N	{}	\N
cmrnlpoq9000501s60am7rqhe	INV-1784211925613-658	3500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-16 14:25:25.617	\N	2026-07-16 14:25:25.617	\N	\N	{}	\N
cmrnuh3n6000101s65iq15izv	INV-1784226641564-996	8000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-16 18:30:41.586	\N	2026-07-16 18:30:41.586	\N	\N	{}	\N
cmrnukmux000601s6ji6tkjht	INV-1784226806454-523	5000.00	0.00	0.00	CREDIT	PARTIAL	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-16 18:33:26.457	\N	2026-07-16 18:33:26.457	\N	\N	{}	\N
cmrozbw8n000201s6mytg8fbu	INV-1784295262939-612	12500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-17 13:34:22.967	\N	2026-07-17 13:34:22.967	\N	\N	{}	\N
cmrp41c56000201s6t1ikwsjb	INV-1784303168412-982	37500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-17 15:46:08.442	\N	2026-07-17 15:46:08.442	\N	\N	{}	\N
cmrp45mrc000901s681els1e5	SRV-260717-4262	2000.00	0.00	0.00	CASH	PAID	COMPLETED	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-17 15:49:28.824	\N	2026-07-17 15:49:28.824	cmrmq5v3k000901s6lnumwy2c	\N	{}	\N
cmrtah2u1000201s6ajasmzyt	INV-1784555845246-200	157500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-20 13:57:25.273	\N	2026-07-20 13:57:25.273	\N	\N	{}	\N
cmrtbc1e9000i01s6qg8g5mdr	INV-SO-1784557289741	25.00	0.00	0.00	CASH	PENDING	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-20 14:21:29.745	\N	2026-07-20 14:21:29.745	\N	\N	{}	\N
cmrtbmit5000s01s6yxxln2ld	INV-1784557778871-756	133000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-20 14:29:38.873	\N	2026-07-20 14:29:38.873	\N	\N	{}	\N
cmrte2gg7001b01s6h19o9mmq	INV-1784561881541-126	5000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-20 15:38:01.543	\N	2026-07-20 15:38:01.543	\N	\N	{}	\N
cmrukgnlz000101s6ztsst37m	INV-1784633087855-906	18998.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-21 11:24:47.879	\N	2026-07-21 11:24:47.879	\N	\N	{}	\N
cmrukht8w000a01s6ydm208e0	INV-1784633141836-310	29995.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-21 11:25:41.84	\N	2026-07-21 11:25:41.84	\N	\N	{}	\N
cmrukjzzd000f01s6lucm1fh5	INV-1784633243878-676	150500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-21 11:27:23.881	\N	2026-07-21 11:27:23.881	\N	\N	{}	\N
cmrwqb0fa000068ln9uuoomtn	INV-1784763834570-140	3500.00	0.00	0.00	SPLIT	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-22 23:43:54.598	\N	2026-07-22 23:43:54.598	\N	\N	{}	[{"amount": 3000, "method": "CASH"}, {"amount": 500, "method": "MOBILE_MONEY"}]
cmrwqcc7e000568lnqna1umh5	INV-1784763896517-224	3500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-22 23:44:56.522	\N	2026-07-22 23:44:56.522	\N	\N	{}	null
cmrxe2tdb000401s6tr1slkog	INV-1784803762966-862	24500.00	0.00	0.00	SPLIT	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrxdxlmp000201s6szuafcej	\N	\N	2026-07-23 10:49:22.991	\N	2026-07-23 10:49:22.991	\N	\N	{}	[{"amount": 24000, "method": "CASH"}, {"amount": 500, "method": "MOBILE_MONEY"}]
cmryqly2c000101s6r4z5ct4q	INV-1784885277017-564	4000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-24 09:27:57.108	\N	2026-07-24 09:27:57.108	\N	\N	{}	null
cmryqob0f000601s6ntduyz51	INV-1784885387195-143	25000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-24 09:29:47.199	\N	2026-07-24 09:29:47.199	\N	\N	{}	null
cmrywmylo000001s6eu82kppv	INV-1784895402123-743	9999.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-24 12:16:42.156	\N	2026-07-24 12:16:42.156	\N	\N	{}	null
cmrz8yn7b000101s694zyul6h	INV-1784916102621-356	7000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-24 18:01:42.647	\N	2026-07-24 18:01:42.647	\N	\N	{}	null
cmrzmr987000401s6z17x93xd	INV-1784939272542-517	199500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-25 00:27:52.567	\N	2026-07-25 00:27:52.567	\N	\N	{}	null
cmrzmshvh000901s6ln1u6jmg	INV-1784939330425-598	3500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-25 00:28:50.429	\N	2026-07-25 00:28:50.429	\N	\N	{}	null
cms09i1fz000l01s6og0906j1	INV-1784977473735-184	9800.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-25 11:04:33.743	\N	2026-07-25 11:04:33.743	\N	\N	{}	null
cms0co4s1000101s6a79j72q4	INV-1784982796815-826	10800.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-25 12:33:16.849	\N	2026-07-25 12:33:16.849	\N	\N	{}	null
cms0k2e0a000201s6l307v52h	INV-1784995219276-23	17500.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-25 16:00:19.306	\N	2026-07-25 16:00:19.306	\N	\N	{}	null
cms0od2fo000q01s66n22o2g1	INV-1785002435982-288	21000.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	\N	\N	2026-07-25 18:00:35.988	\N	2026-07-25 18:00:35.988	\N	\N	{}	null
cms54a6c3000201s6zk4ttarx	INV-1785271039612-717	800.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-28 20:37:19.635	\N	2026-07-28 20:37:19.635	\N	\N	{}	null
cms54a80z000701s6zxwaa5az	INV-1785271041823-973	1000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-28 20:37:21.827	\N	2026-07-28 20:37:21.827	\N	\N	{}	null
cms67p5a8000101s6k4343x42	INV-1785337243113-418	12000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-07-29 15:00:43.136	\N	2026-07-29 15:00:43.136	\N	\N	{}	null
cms9ae6y7000c01s6dzcrauo0	INV-1785523169447-851	13000.00	0.00	0.00	MOBILE_MONEY	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cms9aa3k9000801s6phw014ay	\N	\N	\N	2026-07-31 18:39:29.455	\N	2026-07-31 18:39:29.455	\N	\N	{}	null
cms9mrrtu000401s68qye0m3n	INV-1785543958409-590	25000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-08-01 00:25:58.434	\N	2026-08-01 00:25:58.434	\N	\N	{}	null
cmsemo8bd000001s60c26vp53	INV-1785846124029-364	1000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-08-04 12:22:04.058	\N	2026-08-04 12:22:04.058	\N	\N	{}	null
cmsewl1sc000201s6964cokus	INV-1785862771763-544	4000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-08-04 16:59:31.788	\N	2026-08-04 16:59:31.788	\N	\N	{}	null
cmsg8oisp00dx01s69t4dtuu4	INV-1785943555365-519	559440.00	0.00	0.00	CASH	PAID	PENDING	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	\N	\N	\N	2026-08-05 15:25:55.369	\N	2026-08-05 15:25:55.369	\N	\N	{}	null
cmsg8pfvq00ep01s6mwz2z8os	INV-1785943598244-151	2700.00	0.00	0.00	CASH	PAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	\N	\N	\N	2026-08-05 15:26:38.246	\N	2026-08-05 15:26:38.246	\N	\N	{}	null
cmsg8r5ri00ez01s6ekbn14nb	INV-1785943678444-622	30.00	0.00	0.00	CASH	PAID	PENDING	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	\N	2026-08-05 15:27:58.446	\N	2026-08-05 15:27:58.446	\N	\N	{}	null
cmsg8rpzj00f401s67rtwz13a	INV-1785943704652-512	30000.00	0.00	0.00	MOBILE_MONEY	PAID	PENDING	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	cmsg8pkwk00ex01s6thyjwvv4	\N	\N	2026-08-05 15:28:24.655	\N	2026-08-05 15:28:24.655	\N	\N	{}	null
cmsg8sh9w00fb01s6g8flovra	INV-1785943740017-154	350.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	cmsg8sck400f901s6qjhoc1p6	\N	\N	2026-08-05 15:29:00.02	\N	2026-08-05 15:29:00.02	\N	\N	{}	null
cmsg8skt000fh01s6vzi84mbj	INV-1785943744594-680	60000.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	cmsg8pkwk00ex01s6thyjwvv4	\N	\N	2026-08-05 15:29:04.596	\N	2026-08-05 15:29:04.596	\N	\N	{}	null
cmsg8twba00fp01s6k17xuvy9	INV-1785943806164-302	36.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	cmsg8trqt00fn01s6jpoc86tl	\N	\N	2026-08-05 15:30:06.166	\N	2026-08-05 15:30:06.166	\N	\N	{}	null
cmsg93ool00g501s6c5fzinxd	INV-1785944262835-407	200.00	0.00	0.00	CASH	PAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	\N	\N	\N	2026-08-05 15:37:42.837	\N	2026-08-05 15:37:42.837	\N	\N	{}	null
cmsg8h2wk00d101s6gzh3t3zc	INV-1785943208176-380	0.00	0.00	0.00	CASH	PAID	RETURNED	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	\N	\N	\N	2026-08-05 15:20:08.18	\N	2026-08-05 15:39:26.046	\N	\N	{}	null
cmsg97afp00gc01s6kte5xaox	INV-1785944430995-414	110.00	0.00	0.00	CASH	PAID	PENDING	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	\N	\N	\N	2026-08-05 15:40:30.997	\N	2026-08-05 15:40:30.997	\N	\N	{}	null
cmsg98q3l00gp01s6p5dw76wk	INV-1785944497951-917	550.00	0.00	0.00	CASH	PAID	PENDING	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	cmsg98n6s00gn01s6ivl00py0	\N	\N	2026-08-05 15:41:37.953	\N	2026-08-05 15:41:37.953	\N	\N	{}	null
cmsg98unu00gu01s6dan9mn8h	INV-1785944503866-522	200.00	0.00	0.00	CASH	PAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	\N	\N	\N	2026-08-05 15:41:43.866	\N	2026-08-05 15:41:43.866	\N	\N	{}	null
cmsg983fq00gi01s61vhj4bsi	INV-1785944468580-106	30.00	0.00	0.00	CASH	PAID	PARTIAL_RETURN	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	\N	2026-08-05 15:41:08.582	\N	2026-08-05 15:41:57.574	\N	\N	{}	null
cmsg9cdo500h201s6n9dc25vk	INV-1785944668466-687	345.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	cmsg9byu600h001s6zarjz6cg	\N	\N	2026-08-05 15:44:28.469	\N	2026-08-05 15:44:28.469	\N	\N	{}	null
cmsg9cs7y00h801s6mlyzdnv8	INV-1785944687324-360	40.00	0.00	0.00	SPLIT	PAID	PENDING	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	\N	\N	\N	2026-08-05 15:44:47.326	\N	2026-08-05 15:44:47.326	\N	\N	{}	[{"amount": 20, "method": "CASH"}, {"amount": 20, "method": "MOBILE_MONEY"}]
cmsg9ef7600hg01s6omm24tna	INV-1785944763760-52	100.00	0.00	0.00	SPLIT	PAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	cmsg8sck400f901s6qjhoc1p6	\N	\N	2026-08-05 15:46:03.762	\N	2026-08-05 15:46:03.762	\N	\N	{}	[{"amount": 65, "method": "CASH"}, {"amount": 65, "method": "MOBILE_MONEY"}]
cmsg9fxdc00hn01s6yzal8dei	INV-1785944833965-380	16000.00	0.00	0.00	CREDIT	UNPAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmsg9eqix00hl01s60yg0lvw2	\N	\N	2026-08-05 15:47:13.968	\N	2026-08-05 15:47:13.968	\N	\N	{}	null
cmshis29k001201s6u8378dpv	MED-1786020982878-691	120.00	0.00	0.00	CASH	PAID	COMPLETED	cmshcxlvv000001s682ba2jim	cmshcxm52000801s6xux31gzs	\N	cmshi5thw000j01s63ftb92nd	\N	2026-08-06 12:56:22.904	\N	2026-08-06 13:11:53.684	\N	\N	{}	\N
cmshj90ip001501s63ld0arrt	LAB-1786021773789-276	50.00	0.00	0.00	CASH	PAID	COMPLETED	cmshcxlvv000001s682ba2jim	cmshe96pv000501s6c0w9pf09	\N	cmshi5thw000j01s63ftb92nd	\N	2026-08-06 13:09:33.793	\N	2026-08-06 13:12:12.312	\N	\N	{}	\N
cmshns2pr000b01s6cl0ioyva	INV-1786029381545-263	200.00	0.00	0.00	CASH	PAID	PENDING	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	\N	\N	\N	2026-08-06 15:16:21.567	\N	2026-08-06 15:16:21.567	\N	\N	{}	null
cmsqkdpqk000101s671f4p297	INV-1786567868229-780	13000.00	0.00	0.00	CASH	PAID	PENDING	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	\N	\N	\N	2026-08-12 20:51:08.3	\N	2026-08-12 20:51:08.3	\N	\N	{}	null
\.


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SaleItem" (id, "saleId", "productId", quantity, "unitPrice", total, status, "externalCostPrice", "externalSourceName", "isExternalSourced", "productName", "businessId") FROM stdin;
cmrms6iyu001m01s6fjn0sazp	cmrms6iym001l01s6581k5tqh	cmrms5u6p001k01s6lghot16g	1	2000.00	2000.00	pending	\N	\N	f	\N	cmrmq5v0e000301s68rl1kxrs
cmrncr22b000401s63e21lwdl	cmrncr222000301s6zyhm6n2b	cmrms5u6p001k01s6lghot16g	1	2000.00	2000.00	pending	\N	\N	f	\N	cmrmq5v0e000301s68rl1kxrs
cmrnjuook000401s66kizgcc2	cmrnjuooa000301s6p2rwrpz0	cmrmqys0v000o01s6xmwvel9d	2	5000.00	10000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrnk2lcu000301s6mbw4dvrn	cmrnk2lcp000201s6eozlh8u2	cmrmqr19a000g01s6aqtfxfk6	2	4000.00	8000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cmrnk2lcu000401s65jhelbzv	cmrnk2lcp000201s6eozlh8u2	cmrmr1g5u000r01s6mogei2xn	2	4000.00	8000.00	pending	\N	\N	f	Fingerprint Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrnk2lcu000501s6ubgby37f	cmrnk2lcp000201s6eozlh8u2	cmrmre95k001401s662v8j8cf	1	4500.00	4500.00	pending	\N	\N	f	Samsung Galaxy A56	cmrmq5v0e000301s68rl1kxrs
cmrnk2lcu000601s67vup0qqc	cmrnk2lcp000201s6eozlh8u2	cmrmr5vue000v01s6rz47br6y	2	4000.00	8000.00	pending	\N	\N	f	Smart Video Doorbell	cmrmq5v0e000301s68rl1kxrs
cmrnlokjb000101s6i818yaf2	cmrnlokj5000001s6d7o14fzy	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrnlpoqf000601s6b4cokwkq	cmrnlpoq9000501s60am7rqhe	cmrmqk58o000d01s6fzatd6n0	1	3500.00	3500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrnuh3ni000201s6bx2xdy3p	cmrnuh3n6000101s65iq15izv	cmrmr1g5u000r01s6mogei2xn	2	4000.00	8000.00	pending	\N	\N	f	Fingerprint Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrnukmv3000701s6kr3d6grm	cmrnukmux000601s6ji6tkjht	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrozbw92000301s6njeay399	cmrozbw8n000201s6mytg8fbu	cmrmqv85x000k01s6btj8rupy	1	3500.00	3500.00	pending	\N	\N	f	Hikvision Bullet Camera	cmrmq5v0e000301s68rl1kxrs
cmrozbw92000401s6tjrsx78s	cmrozbw8n000201s6mytg8fbu	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrozbw92000501s6ii1su6kh	cmrozbw8n000201s6mytg8fbu	cmrmr5vue000v01s6rz47br6y	1	4000.00	4000.00	pending	\N	\N	f	Smart Video Doorbell	cmrmq5v0e000301s68rl1kxrs
cmrp41c5g000301s6boawug59	cmrp41c56000201s6t1ikwsjb	cmrmqys0v000o01s6xmwvel9d	4	5000.00	20000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrp41c5g000401s66c3tbu7i	cmrp41c56000201s6t1ikwsjb	cmrmqv85x000k01s6btj8rupy	5	3500.00	17500.00	pending	\N	\N	f	Hikvision Bullet Camera	cmrmq5v0e000301s68rl1kxrs
cmrp45msf000a01s6wxkptnxn	cmrp45mrc000901s681els1e5	cmrms5u6p001k01s6lghot16g	1	2000.00	2000.00	pending	\N	\N	f	\N	cmrmq5v0e000301s68rl1kxrs
cmrtah2ub000301s6h0jskpfv	cmrtah2u1000201s6ajasmzyt	cmrmqk58o000d01s6fzatd6n0	45	3500.00	157500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrtbc1ef000j01s6mpf0m49m	cmrtbc1e9000i01s6qg8g5mdr	cmrnkm34d000f01s66kijfnfa	1	25.00	25.00	pending	\N	\N	f	smart light	cmrmq5v0e000301s68rl1kxrs
cmrtbmitb000t01s6n398wh6y	cmrtbmit5000s01s6yxxln2ld	cmrmqk58o000d01s6fzatd6n0	38	3500.00	133000.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrte2ghe001c01s6lqmy1qg7	cmrte2gg7001b01s6h19o9mmq	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrukgnmb000201s6u88ii7ym	cmrukgnlz000101s6ztsst37m	cmrmqk58o000d01s6fzatd6n0	2	3500.00	7000.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrukgnmb000301s6liqv6k33	cmrukgnlz000101s6ztsst37m	cmrmr84ux000x01s65ogzv6cr	2	5999.00	11998.00	pending	\N	\N	f	Smart Door Sensor	cmrmq5v0e000301s68rl1kxrs
cmrukht91000b01s6auxn51iq	cmrukht8w000a01s6ydm208e0	cmrmr84ux000x01s65ogzv6cr	5	5999.00	29995.00	pending	\N	\N	f	Smart Door Sensor	cmrmq5v0e000301s68rl1kxrs
cmrukjzzk000g01s66p0pzpjv	cmrukjzzd000f01s6lucm1fh5	cmrmqk58o000d01s6fzatd6n0	43	3500.00	150500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrwqb0lm000168lnd0fbzljx	cmrwqb0fa000068ln9uuoomtn	cmrmqk58o000d01s6fzatd6n0	1	3500.00	3500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrwqccdx000668lnopndgqgk	cmrwqcc7e000568lnqna1umh5	cmrmqk58o000d01s6fzatd6n0	1	3500.00	3500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrxe2tek000501s6r8fb8yrf	cmrxe2tdb000401s6tr1slkog	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrxe2tek000601s6qgh8objt	cmrxe2tdb000401s6tr1slkog	cmrmre95k001401s662v8j8cf	1	4500.00	4500.00	pending	\N	\N	f	Samsung Galaxy A56	cmrmq5v0e000301s68rl1kxrs
cmrxe2tek000701s6zxwepcx5	cmrxe2tdb000401s6tr1slkog	cmrmrte1b001i01s64lsy6zwo	1	15000.00	15000.00	pending	\N	\N	f	Dell Latitude 5440	cmrmq5v0e000301s68rl1kxrs
cmryqly5j000201s6kglj75aj	cmryqly2c000101s6r4z5ct4q	cmrmqr19a000g01s6aqtfxfk6	1	4000.00	4000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cmryqob0l000701s65lf4p49r	cmryqob0f000601s6ntduyz51	cmrmqys0v000o01s6xmwvel9d	5	5000.00	25000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmrywmyn1000101s67olwensd	cmrywmylo000001s6eu82kppv	cmrmr9yev000z01s6llw0xrfx	1	4000.00	4000.00	pending	\N	\N	f	Smart Motion Sensor	cmrmq5v0e000301s68rl1kxrs
cmrywmyn1000201s60359ncyx	cmrywmylo000001s6eu82kppv	cmrmr84ux000x01s65ogzv6cr	1	5999.00	5999.00	pending	\N	\N	f	Smart Door Sensor	cmrmq5v0e000301s68rl1kxrs
cmrz8yn8o000201s6m0q9gnx6	cmrz8yn7b000101s694zyul6h	cmrmqk58o000d01s6fzatd6n0	2	3500.00	7000.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrzmr98j000501s60ta04jz1	cmrzmr987000401s6z17x93xd	cmrmqk58o000d01s6fzatd6n0	57	3500.00	199500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmrzmshvn000a01s6rg54v66f	cmrzmshvh000901s6ln1u6jmg	cmrmqk58o000d01s6fzatd6n0	1	3500.00	3500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cms09i1hi000m01s65prma7gu	cms09i1fz000l01s6og0906j1	cms08hjg7000301s6n8j1gozw	1	7000.00	7000.00	pending	\N	\N	f	Lenovo Tablet	cmrmq5v0e000301s68rl1kxrs
cms09i1hi000n01s6xd3nlx9a	cms09i1fz000l01s6og0906j1	cms08vv4n000b01s601d5tzua	2	1000.00	2000.00	pending	\N	\N	f	Smart Watches	cmrmq5v0e000301s68rl1kxrs
cms09i1hi000o01s6w084xrnc	cms09i1fz000l01s6og0906j1	cms08xymo000d01s6lcchaqfp	1	800.00	800.00	pending	\N	\N	f	Power Banks	cmrmq5v0e000301s68rl1kxrs
cms0co4te000201s6r6ektaf0	cms0co4s1000101s6a79j72q4	cms08sh4u000901s6z990hr8r	1	10000.00	10000.00	pending	\N	\N	f	Samsung 43-inch FHD Smart TV	cmrmq5v0e000301s68rl1kxrs
cms0co4tf000301s6vi2qqjyq	cms0co4s1000101s6a79j72q4	cms08xymo000d01s6lcchaqfp	1	800.00	800.00	pending	\N	\N	f	Power Banks	cmrmq5v0e000301s68rl1kxrs
cms0k2e0q000301s6vco4i48t	cms0k2e0a000201s6l307v52h	cmrmqv85x000k01s6btj8rupy	5	3500.00	17500.00	pending	\N	\N	f	Hikvision Bullet Camera	cmrmq5v0e000301s68rl1kxrs
cms0od2fy000r01s66qeg7ew6	cms0od2fo000q01s66n22o2g1	cmrmre95k001401s662v8j8cf	2	4500.00	9000.00	pending	\N	\N	f	Samsung Galaxy A56	cmrmq5v0e000301s68rl1kxrs
cms0od2fy000s01s6yl2zl7ua	cms0od2fo000q01s66n22o2g1	cmrmr84ux000x01s65ogzv6cr	2	6000.00	12000.00	pending	\N	\N	f	Smart Door Sensor	cmrmq5v0e000301s68rl1kxrs
cms54a6cd000301s62gbj79zz	cms54a6c3000201s6zk4ttarx	cms08xymo000d01s6lcchaqfp	1	800.00	800.00	pending	\N	\N	f	Power Banks	cmrmq5v0e000301s68rl1kxrs
cms54a814000801s66zl40xnx	cms54a80z000701s6zxwaa5az	cms08vv4n000b01s601d5tzua	1	1000.00	1000.00	pending	\N	\N	f	Smart Watches	cmrmq5v0e000301s68rl1kxrs
cms67p5al000201s6kt2ipu6u	cms67p5a8000101s6k4343x42	cmrmqr19a000g01s6aqtfxfk6	3	4000.00	12000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cms9ae6ym000d01s6pws615wx	cms9ae6y7000c01s6dzcrauo0	cmrmr1g5u000r01s6mogei2xn	1	4000.00	4000.00	pending	\N	\N	f	Fingerprint Door Lock	cmrmq5v0e000301s68rl1kxrs
cms9ae6ym000e01s6ga2ultnd	cms9ae6y7000c01s6dzcrauo0	cmrmr5vue000v01s6rz47br6y	1	4000.00	4000.00	pending	\N	\N	f	Smart Video Doorbell	cmrmq5v0e000301s68rl1kxrs
cms9ae6ym000f01s6rvu3s2cf	cms9ae6y7000c01s6dzcrauo0	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cms9mrrut000501s6t3979zlg	cms9mrrtu000401s68qye0m3n	cms08hjg7000301s6n8j1gozw	1	7000.00	7000.00	pending	\N	\N	f	Lenovo Tablet	cmrmq5v0e000301s68rl1kxrs
cms9mrrut000601s65qwhrhn8	cms9mrrtu000401s68qye0m3n	cmrwt5kvz000001s6oupurq0n	1	18000.00	18000.00	pending	\N	\N	f	hp laptop 15-dy2xxx	cmrmq5v0e000301s68rl1kxrs
cmsemo8bp000101s6z0k2d6oy	cmsemo8bd000001s60c26vp53	cms08vv4n000b01s601d5tzua	1	1000.00	1000.00	pending	\N	\N	f	Smart Watches	cmrmq5v0e000301s68rl1kxrs
cmsewl1tm000301s6tarwu5vg	cmsewl1sc000201s6964cokus	cmrmqr19a000g01s6aqtfxfk6	1	4000.00	4000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cmsg8oit000dy01s6elmv3oq3	cmsg8oisp00dx01s69t4dtuu4	cmsg5znvw005o01s6td0ltg7q	6	200.00	1200.00	pending	\N	\N	f	VACUUM CLEANER	cmsg3amla000x01s698usq8fn
cmsg8oit000dz01s6jf9845w0	cmsg8oisp00dx01s69t4dtuu4	cmsg5ti4h005601s6zqcdlnyl	7	14000.00	98000.00	pending	\N	\N	f	PLAYSTATION 5	cmsg3amla000x01s698usq8fn
cmsg8oit000e001s63l4kxpk8	cmsg8oisp00dx01s69t4dtuu4	cmsg5ri4a005101s60he6v9bu	7	17000.00	119000.00	pending	\N	\N	f	XBOX SERIES X	cmsg3amla000x01s698usq8fn
cmsg8oit000e101s6utqrwpbq	cmsg8oisp00dx01s69t4dtuu4	cmsg5ma2p004t01s6z1mechsf	7	4000.00	28000.00	pending	\N	\N	f	STEAM DECK	cmsg3amla000x01s698usq8fn
cmsg8oit000e201s61vys8tw7	cmsg8oisp00dx01s69t4dtuu4	cmsg57083004201s6m0lzae0k	6	30000.00	180000.00	pending	\N	\N	f	APPLE MACBOOK AIR	cmsg3amla000x01s698usq8fn
cmsg8oit000e301s6juq1jua1	cmsg8oisp00dx01s69t4dtuu4	cmsg5656e004001s6k4if24v3	6	20000.00	120000.00	pending	\N	\N	f	HP SPECTRE x360	cmsg3amla000x01s698usq8fn
cmsg8oit000e401s6bdl64md3	cmsg8oisp00dx01s69t4dtuu4	cmsg63e8j006801s6wjclc1gk	6	150.00	900.00	pending	\N	\N	f	TOASTER	cmsg3amla000x01s698usq8fn
cmsg8oit000e501s6g08ni0h8	cmsg8oisp00dx01s69t4dtuu4	cmsg6615l006i01s6d0dsx0g3	6	70.00	420.00	pending	\N	\N	f	COFFEE MAKER	cmsg3amla000x01s698usq8fn
cmsg8oit000e601s6fuknyosw	cmsg8oisp00dx01s69t4dtuu4	cmsg66qp5006k01s6umuf7ioi	6	70.00	420.00	pending	\N	\N	f	JUICER	cmsg3amla000x01s698usq8fn
cmsg8oit000e701s6nso6ys32	cmsg8oisp00dx01s69t4dtuu4	cmsg6lsfd008701s6jxn10tyo	7	1500.00	10500.00	pending	\N	\N	f	MODEM	cmsg3amla000x01s698usq8fn
cmsg8oit000e801s6qhqeyhro	cmsg8oisp00dx01s69t4dtuu4	cmsg6l4zv008501s62ztrajgj	1	1000.00	1000.00	pending	\N	\N	f	ETHERNET CABLE	cmsg3amla000x01s698usq8fn
cmsg8pfvx00eq01s6j1ixhjv4	cmsg8pfvq00ep01s6mwz2z8os	cmsg67o14006m01s67s6yaji6	3	450.00	1350.00	pending	\N	\N	f	Air Max	cmsg3mply001h01s6fbg9j6j0
cmsg8pfvx00er01s6iqa0w4iq	cmsg8pfvq00ep01s6mwz2z8os	cmsg6bex8007301s6gcc11zp5	3	450.00	1350.00	pending	\N	\N	f	Air Forces 	cmsg3mply001h01s6fbg9j6j0
cmsg8r5ro00f001s6f0s5pgb0	cmsg8r5ri00ez01s6ekbn14nb	cmsg4g34p003001s6z5h1cjxu	2	15.00	30.00	pending	\N	\N	f	Paracetamol 	cmsg3i0h4001801s67p002bbz
cmsg8rpzq00f501s6km4tl9l1	cmsg8rpzj00f401s67rtwz13a	cmsg4aukj002q01s6hz6jqye9	1	30000.00	30000.00	pending	\N	\N	f	TECNO PHANTOM V FOLD	cmsg3amla000x01s698usq8fn
cmsg8sha200fc01s6t0uxx4p1	cmsg8sh9w00fb01s6g8flovra	cmsg4gzq9003301s6e5dc9uxa	1	350.00	350.00	pending	\N	\N	f	Patex Philippe	cmsg3mply001h01s6fbg9j6j0
cmsg8skt600fi01s6hlgmm6cp	cmsg8skt000fh01s6vzi84mbj	cmsg451qn002c01s6y1vkdjq3	1	60000.00	60000.00	pending	\N	\N	f	IPHONE 17 PRO	cmsg3amla000x01s698usq8fn
cmsg8twbg00fq01s64rkosjil	cmsg8twba00fp01s6k17xuvy9	cmsg54cbf003q01s6kd00gec0	3	12.00	36.00	pending	\N	\N	f	Vitamin C	cmsg3i0h4001801s67p002bbz
cmsg93oor00g601s6sy57414z	cmsg93ool00g501s6c5fzinxd	cmsg49je5002i01s6cvarwut0	1	200.00	200.00	pending	\N	\N	f	Gucci	cmsg3mply001h01s6fbg9j6j0
cmsg9cdob00h301s63msds8bh	cmsg9cdo500h201s6n9dc25vk	cmsg458q8002e01s6478pm5l6	3	115.00	345.00	pending	\N	\N	f	white wine	cmsg38ejb000n01s66874af28
cmsg8h2ww00d201s6vuko824j	cmsg8h2wk00d101s6gzh3t3zc	cmsg49mq4002l01s6vhym2ei1	0	75000.00	0.00	pending	\N	\N	f	IPHONE 18	cmsg3amla000x01s698usq8fn
cmsg97afv00gd01s6mudtmxgr	cmsg97afp00gc01s6kte5xaox	cmsg40e83002301s6r8dz9yjf	1	110.00	110.00	pending	\N	\N	f	red wine	cmsg38ejb000n01s66874af28
cmsg98q3s00gq01s6627igt9d	cmsg98q3l00gp01s6p5dw76wk	cmsg40e83002301s6r8dz9yjf	5	110.00	550.00	pending	\N	\N	f	red wine	cmsg38ejb000n01s66874af28
cmsg98uo000gv01s69ews73gm	cmsg98unu00gu01s6dan9mn8h	cmsg49je5002i01s6cvarwut0	1	200.00	200.00	pending	\N	\N	f	Gucci	cmsg3mply001h01s6fbg9j6j0
cmsg983fv00gj01s6dxptd08j	cmsg983fq00gi01s61vhj4bsi	cmsg4g34p003001s6z5h1cjxu	2	15.00	30.00	pending	\N	\N	f	Paracetamol 	cmsg3i0h4001801s67p002bbz
cmsg9cs8400h901s65mbotic4	cmsg9cs7y00h801s6mlyzdnv8	cmsg5cbd3004d01s65xg4s2x1	2	20.00	40.00	pending	\N	\N	f	Benadryl 	cmsg3i0h4001801s67p002bbz
cmsg9ef7d00hh01s6awed05mp	cmsg9ef7600hg01s6omm24tna	cmsg61eos005v01s6rekxul60	1	100.00	100.00	pending	\N	\N	f	Kitten Heel	cmsg3mply001h01s6fbg9j6j0
cmsg9fxdk00ho01s6zls1a4em	cmsg9fxdc00hn01s6yzal8dei	cmrmqk58o000d01s6fzatd6n0	1	3500.00	3500.00	pending	\N	\N	f	Hikvision 2MP IP Camera	cmrmq5v0e000301s68rl1kxrs
cmsg9fxdk00hp01s6n9g3rx7g	cmsg9fxdc00hn01s6yzal8dei	cmrmqr19a000g01s6aqtfxfk6	1	4000.00	4000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cmsg9fxdk00hq01s6h22p08l5	cmsg9fxdc00hn01s6yzal8dei	cmrmqys0v000o01s6xmwvel9d	1	5000.00	5000.00	pending	\N	\N	f	Tuya Smart Door Lock	cmrmq5v0e000301s68rl1kxrs
cmsg9fxdk00hr01s6kar9imly	cmsg9fxdc00hn01s6yzal8dei	cmrmqv85x000k01s6btj8rupy	1	3500.00	3500.00	pending	\N	\N	f	Hikvision Bullet Camera	cmrmq5v0e000301s68rl1kxrs
cmshis29v001301s6zyxqxpzd	cmshis29k001201s6u8378dpv	\N	1	120.00	120.00	pending	\N	\N	f	Doctor Consultation Fee	cmshcxlvv000001s682ba2jim
cmshj90iz001601s6tz4fjo03	cmshj90ip001501s63ld0arrt	\N	1	50.00	50.00	pending	\N	\N	f	Lab Test: Complete running stomach check	cmshcxlvv000001s682ba2jim
cmshns2qw000c01s6hzr9l5wl	cmshns2pr000b01s6cl0ioyva	cmsg49je5002i01s6cvarwut0	1	200.00	200.00	pending	\N	\N	f	Gucci	cmsg3mply001h01s6fbg9j6j0
cmsqkdpqy000201s6vi6jk6cq	cmsqkdpqk000101s671f4p297	cmrmr1g5u000r01s6mogei2xn	1	4000.00	4000.00	pending	\N	\N	f	Fingerprint Door Lock	cmrmq5v0e000301s68rl1kxrs
cmsqkdpqy000301s6od6qrx10	cmsqkdpqk000101s671f4p297	cmrmqr19a000g01s6aqtfxfk6	1	4000.00	4000.00	pending	\N	\N	f	Hikvision 5MP Dome Camera	cmrmq5v0e000301s68rl1kxrs
cmsqkdpqy000401s6o2lloh4j	cmsqkdpqk000101s671f4p297	cmrmrmkog001a01s60ry9zqmk	1	5000.00	5000.00	pending	\N	\N	f	Infinix Note 50	cmrmq5v0e000301s68rl1kxrs
\.


--
-- Data for Name: SalesDraft; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesDraft" (id, "draftNumber", "businessId", "userId", "customerId", "customerName", "customerPhone", items, "totalAmount", notes, "createdAt", "updatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: SalesOrder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesOrder" (id, "soNumber", "orderDate", "expectedDate", "customerName", "customerEmail", "customerPhone", "deliveryAddress", "billingAddress", "paymentTerms", "deliveryMethod", notes, discount, tax, subtotal, "totalAmount", status, "convertedSaleId", "businessId", "userId", "customerId", "createdAt", "updatedAt", "deletedAt") FROM stdin;
cmrtb7gcn000b01s630mgafr7	SO-000001	2026-07-20 14:17:55.847	2026-07-20 00:00:00	king julian	\N	031389794	\N	\N	50% Upfront	Standard Delivery	\N	0.00	0.00	25.00	25.00	COMPLETED	cmrtbc1e9000i01s6qg8g5mdr	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	2026-07-20 14:17:55.847	2026-07-20 14:21:29.783	\N
cmrtbjt97000n01s6mkawku00	SO-000002	2026-07-20 14:27:32.443	2026-07-28 00:00:00	king julian	\N	031389794	\N	\N	Due on Receipt	Standard Delivery	\N	0.00	0.00	7500.00	7500.00	CANCELLED	\N	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	cmrnjtixj000101s6ccu7re0t	2026-07-20 14:27:32.443	2026-07-20 14:28:02.313	\N
\.


--
-- Data for Name: SalesOrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesOrderItem" (id, "salesOrderId", "productId", "productName", quantity, "unitPrice", total, "businessId") FROM stdin;
cmrtb7gcz000c01s69utkb730	cmrtb7gcn000b01s630mgafr7	cmrnkm34d000f01s66kijfnfa	smart light	1	25.00	25.00	cmrmq5v0e000301s68rl1kxrs
cmrtbjt9c000o01s68ic6ucb7	cmrtbjt97000n01s6mkawku00	cmrmrr1tt001g01s6jwz4x6j2	HP ProBook 450	1	7500.00	7500.00	cmrmq5v0e000301s68rl1kxrs
\.


--
-- Data for Name: SalesOrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesOrderStatusHistory" (id, "salesOrderId", status, note, "userId", "createdAt") FROM stdin;
cmrtb7gd8000d01s6vvtj5pbg	cmrtb7gcn000b01s630mgafr7	PENDING	Sales order submitted for approval	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:17:55.847
cmrtb9mb0000e01s64fqkzlgl	cmrtb7gcn000b01s630mgafr7	CONFIRMED	Status updated to CONFIRMED	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:19:36.871
cmrtbafui000f01s6eji5b3kn	cmrtb7gcn000b01s630mgafr7	PROCESSING	Status updated to PROCESSING	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:20:15.157
cmrtbat61000g01s64bi7ljlj	cmrtb7gcn000b01s630mgafr7	SHIPPED	Status updated to SHIPPED	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:20:32.421
cmrtbb5ow000h01s6j07gy4ey	cmrtb7gcn000b01s630mgafr7	DELIVERED	Status updated to DELIVERED	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:20:48.651
cmrtbc1fh000m01s6ts7kukce	cmrtb7gcn000b01s630mgafr7	COMPLETED	Converted to Invoice INV-SO-1784557289741	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:21:29.783
cmrtbjt9i000p01s6r01z7t8a	cmrtbjt97000n01s6mkawku00	PENDING	Sales order submitted for approval	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:27:32.443
cmrtbkbs6000q01s6ftylyp12	cmrtbjt97000n01s6mkawku00	CONFIRMED	Status updated to CONFIRMED	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:27:56.449
cmrtbkgb3000r01s6o9q27ao6	cmrtbjt97000n01s6mkawku00	CANCELLED	Order cancelled	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:28:02.313
\.


--
-- Data for Name: SchoolAttendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolAttendance" (id, "businessId", "studentId", "courseId", date, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolBookCheckout; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolBookCheckout" (id, "businessId", "bookId", "studentId", "checkoutDate", "dueDate", "returnDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolBroadcast; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolBroadcast" (id, "businessId", subject, content, channel, audience, status, "sentAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolBroadcastRecipient; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolBroadcastRecipient" (id, "broadcastId", "studentId", status, "errorReason", "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolCourse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolCourse" (id, "businessId", "courseName", "courseCode", description, duration, fee, schedule, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolEnrollment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolEnrollment" (id, "businessId", "studentId", "courseId", "enrollmentDate", "completionDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolGrade; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolGrade" (id, "businessId", "studentId", "courseId", "termId", score, grade, remarks, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolHostel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolHostel" (id, "businessId", "blockName", "roomNumber", capacity, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolHostelAllocation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolHostelAllocation" (id, "businessId", "hostelId", "studentId", "allocationDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolInvoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolInvoice" (id, "businessId", "studentId", title, description, "totalAmount", "dueDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolLeaveRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolLeaveRequest" (id, "businessId", "staffId", "leaveType", "startDate", "endDate", reason, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolLibraryBook; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolLibraryBook" (id, "businessId", title, author, isbn, category, "totalCopies", "availableCopies", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolPayment" (id, "businessId", "studentId", "courseId", amount, "paymentDate", "paymentMethod", status, "receiptNumber", "formType", "paymentReference", "guardianName", "guardianPhone", "createdAt", "updatedAt", "invoiceId") FROM stdin;
\.


--
-- Data for Name: SchoolPayslip; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolPayslip" (id, "businessId", "staffId", month, "baseSalary", deductions, bonuses, "netPay", status, "paymentDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolStaff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolStaff" (id, "businessId", "firstName", "lastName", email, phone, role, department, salary, "hireDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SchoolStudent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolStudent" (id, "businessId", "studentId", "firstName", "lastName", gender, "dateOfBirth", address, phone, email, "photoPath", "enrollmentDate", status, "applicationSource", "createdAt", "updatedAt", "guardianName", "guardianPhone", "guardianEmail", "guardianRelation", "bloodGroup", "medicalConditions", "currentLevel") FROM stdin;
\.


--
-- Data for Name: SchoolTerm; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SchoolTerm" (id, "businessId", name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StockMovement" (id, "productId", quantity, type, reason, "businessId", "userId", "createdAt", "deletedAt", "updatedAt") FROM stdin;
cmrnh9wxu000e01s6j0foyo6q	cmrmri2zt001601s6zqhoba8z	50	ADJUSTMENT	phycial count	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 12:21:11.298	\N	2026-07-16 12:21:11.298
cmrnhc0eh000f01s640vd9uh2	cmrmri2zt001601s6zqhoba8z	50	IN	physical	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 12:22:49.097	\N	2026-07-16 12:22:49.097
cmrnjuoq0000701s6dcgrpe0y	cmrmqys0v000o01s6xmwvel9d	2	OUT	Sale INV-1784208799565-566	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:33:19.656	\N	2026-07-16 13:33:19.656
cmrnk2ldk000901s6vz6sh832	cmrmqr19a000g01s6aqtfxfk6	2	OUT	Sale INV-1784209168518-44	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:39:28.568	\N	2026-07-16 13:39:28.568
cmrnk2ldy000a01s63hlr85td	cmrmr1g5u000r01s6mogei2xn	2	OUT	Sale INV-1784209168518-44	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:39:28.582	\N	2026-07-16 13:39:28.582
cmrnk2le8000b01s6w73a2wrk	cmrmre95k001401s662v8j8cf	1	OUT	Sale INV-1784209168518-44	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:39:28.592	\N	2026-07-16 13:39:28.592
cmrnk2lem000c01s6rkmatkgb	cmrmr5vue000v01s6rz47br6y	2	OUT	Sale INV-1784209168518-44	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 13:39:28.606	\N	2026-07-16 13:39:28.606
cmrnlokk1000301s68310jv2j	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1784211873498-196	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 14:24:33.553	\N	2026-07-16 14:24:33.553
cmrnlpor1000801s6jinnxzit	cmrmqk58o000d01s6fzatd6n0	1	OUT	Sale INV-1784211925613-658	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 14:25:25.645	\N	2026-07-16 14:25:25.645
cmrnuh3oe000401s6qesve8ce	cmrmr1g5u000r01s6mogei2xn	2	OUT	Sale INV-1784226641564-996	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 18:30:41.63	\N	2026-07-16 18:30:41.63
cmrnukmw5000a01s6k547jxue	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1784226806454-523	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-16 18:33:26.501	\N	2026-07-16 18:33:26.501
cmrozbwat000701s6mj7117ne	cmrmqv85x000k01s6btj8rupy	1	OUT	Sale INV-1784295262939-612	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-17 13:34:23.046	\N	2026-07-17 13:34:23.046
cmrozbwbd000801s6yocqwa86	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1784295262939-612	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-17 13:34:23.065	\N	2026-07-17 13:34:23.065
cmrozbwbp000901s6f9sko3sv	cmrmr5vue000v01s6rz47br6y	1	OUT	Sale INV-1784295262939-612	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-17 13:34:23.077	\N	2026-07-17 13:34:23.077
cmrp41c6c000601s67j7fsmok	cmrmqys0v000o01s6xmwvel9d	4	OUT	Sale INV-1784303168412-982	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-17 15:46:08.484	\N	2026-07-17 15:46:08.484
cmrp41c71000701s61neguhe8	cmrmqv85x000k01s6btj8rupy	5	OUT	Sale INV-1784303168412-982	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-17 15:46:08.509	\N	2026-07-17 15:46:08.509
cmrtah2wb000501s6m0eu9bci	cmrmqk58o000d01s6fzatd6n0	45	OUT	Sale INV-1784555845246-200	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 13:57:25.355	\N	2026-07-20 13:57:25.355
cmrtaltwp000901s67fxn05an	cmrmqk58o000d01s6fzatd6n0	30	IN	Purchase PO-2026-4940	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:01:06.985	\N	2026-07-20 14:01:06.985
cmrtbc1f4000l01s6r9zi17ro	cmrnkm34d000f01s66kijfnfa	1	OUT	Sales Order SO-000001 converted to Invoice INV-SO-1784557289741	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:21:29.776	\N	2026-07-20 14:21:29.776
cmrtbmiuv000v01s6b22j7teu	cmrmqk58o000d01s6fzatd6n0	38	OUT	Sale INV-1784557778871-756	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:29:38.935	\N	2026-07-20 14:29:38.935
cmrtbu0wd000z01s62umxrfy6	cmrmqk58o000d01s6fzatd6n0	50	IN	Purchase PO-2026-4622	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 14:35:28.909	\N	2026-07-20 14:35:28.909
cmrte2gi9001e01s68mbe6qs0	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1784561881541-126	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-20 15:38:01.617	\N	2026-07-20 15:38:01.617
cmrukgnnn000601s6xdyf1pxi	cmrmqk58o000d01s6fzatd6n0	2	OUT	Sale INV-1784633087855-906	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:24:47.939	\N	2026-07-21 11:24:47.939
cmrukgno4000701s6342f2zlc	cmrmr84ux000x01s65ogzv6cr	2	OUT	Sale INV-1784633087855-906	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:24:47.956	\N	2026-07-21 11:24:47.956
cmrukht9j000d01s66ai9hx7u	cmrmr84ux000x01s65ogzv6cr	5	OUT	Sale INV-1784633141836-310	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:25:41.863	\N	2026-07-21 11:25:41.863
cmrukk01b000i01s63rleml9a	cmrmqk58o000d01s6fzatd6n0	43	OUT	Sale INV-1784633243878-676	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-21 11:27:23.952	\N	2026-07-21 11:27:23.952
cmrwqb1uh000368ln5hrbrdtp	cmrmqk58o000d01s6fzatd6n0	1	OUT	Sale INV-1784763834570-140	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:43:56.441	\N	2026-07-22 23:43:56.441
cmrwqcdna000868lnl52r5xt5	cmrmqk58o000d01s6fzatd6n0	1	OUT	Sale INV-1784763896517-224	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-22 23:44:58.39	\N	2026-07-22 23:44:58.39
cmrxe2tfn000901s6e1ogqcjg	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1784803762966-862	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-23 10:49:23.075	\N	2026-07-23 10:49:23.075
cmrxe2tge000a01s6nyxsnf55	cmrmre95k001401s662v8j8cf	1	OUT	Sale INV-1784803762966-862	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-23 10:49:23.102	\N	2026-07-23 10:49:23.102
cmrxe2tgu000b01s6sfpgagop	cmrmrte1b001i01s64lsy6zwo	1	OUT	Sale INV-1784803762966-862	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-23 10:49:23.119	\N	2026-07-23 10:49:23.119
cmryqly8h000401s67xy9divk	cmrmqr19a000g01s6aqtfxfk6	1	OUT	Sale INV-1784885277017-564	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 09:27:57.329	\N	2026-07-24 09:27:57.329
cmryqob1h000901s60hqaeeoj	cmrmqys0v000o01s6xmwvel9d	5	OUT	Sale INV-1784885387195-143	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 09:29:47.237	\N	2026-07-24 09:29:47.237
cmrywmyo9000401s6kxdyxn9o	cmrmr9yev000z01s6llw0xrfx	1	OUT	Sale INV-1784895402123-743	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 12:16:42.249	\N	2026-07-24 12:16:42.249
cmrywmyoz000501s6ajndxncj	cmrmr84ux000x01s65ogzv6cr	1	OUT	Sale INV-1784895402123-743	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 12:16:42.275	\N	2026-07-24 12:16:42.275
cmrz8yn9x000401s69q12lsim	cmrmqk58o000d01s6fzatd6n0	2	OUT	Sale INV-1784916102621-356	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-24 18:01:42.741	\N	2026-07-24 18:01:42.741
cmrzmr9af000701s6z1zi77j7	cmrmqk58o000d01s6fzatd6n0	57	OUT	Sale INV-1784939272542-517	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 00:27:52.647	\N	2026-07-25 00:27:52.647
cmrzmshx0000c01s6b0ryzfnt	cmrmqk58o000d01s6fzatd6n0	1	OUT	Sale INV-1784939330425-598	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 00:28:50.484	\N	2026-07-25 00:28:50.484
cms09i1j2000q01s6qqsrdt71	cms08hjg7000301s6n8j1gozw	1	OUT	Sale INV-1784977473735-184	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 11:04:33.854	\N	2026-07-25 11:04:33.854
cms09i1jz000r01s6b2p48ivj	cms08vv4n000b01s601d5tzua	2	OUT	Sale INV-1784977473735-184	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 11:04:33.887	\N	2026-07-25 11:04:33.887
cms09i1kh000s01s6xtivkkcn	cms08xymo000d01s6lcchaqfp	1	OUT	Sale INV-1784977473735-184	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 11:04:33.905	\N	2026-07-25 11:04:33.905
cms0co4uy000501s6an0i5znj	cms08sh4u000901s6z990hr8r	1	OUT	Sale INV-1784982796815-826	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 12:33:16.954	\N	2026-07-25 12:33:16.954
cms0co4vz000601s65pqsc36x	cms08xymo000d01s6lcchaqfp	1	OUT	Sale INV-1784982796815-826	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 12:33:16.991	\N	2026-07-25 12:33:16.991
cms0k2e2b000501s6bvdmanoo	cmrmqv85x000k01s6btj8rupy	5	OUT	Sale INV-1784995219276-23	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 16:00:19.379	\N	2026-07-25 16:00:19.379
cms0oaf6l000n01s69hsy3fz3	cms08hjg7000301s6n8j1gozw	12	IN	Purchase PO-2026-7289	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 17:58:32.541	\N	2026-07-25 17:58:32.541
cms0od2hk000v01s66bt2tex8	cmrmre95k001401s662v8j8cf	2	OUT	Sale INV-1785002435982-288	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 18:00:36.056	\N	2026-07-25 18:00:36.056
cms0od2i0000w01s6ph7l739o	cmrmr84ux000x01s65ogzv6cr	2	OUT	Sale INV-1785002435982-288	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 18:00:36.072	\N	2026-07-25 18:00:36.072
cms0ynhpf000301s6m98n2was	cmrmqk58o000d01s6fzatd6n0	40	IN	Purchase PO-2026-715	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-25 22:48:38.5	\N	2026-07-25 22:48:38.5
cms54a6dg000501s6rzgrgn35	cms08xymo000d01s6lcchaqfp	1	OUT	Sale INV-1785271039612-717	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-28 20:37:19.684	\N	2026-07-28 20:37:19.684
cms54a87q000a01s62rqnejzy	cms08vv4n000b01s601d5tzua	1	OUT	Sale INV-1785271041823-973	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-28 20:37:22.07	\N	2026-07-28 20:37:22.07
cms67p5bt000401s6wc2qu4u0	cmrmqr19a000g01s6aqtfxfk6	3	OUT	Sale INV-1785337243113-418	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-29 15:00:43.193	\N	2026-07-29 15:00:43.193
cms9ae6zz000h01s6wwg1e8ly	cmrmr1g5u000r01s6mogei2xn	1	OUT	Sale INV-1785523169447-851	cmrmq5v0e000301s68rl1kxrs	cms9aa3k9000801s6phw014ay	2026-07-31 18:39:29.519	\N	2026-07-31 18:39:29.519
cms9ae70v000i01s6vlo7tolq	cmrmr5vue000v01s6rz47br6y	1	OUT	Sale INV-1785523169447-851	cmrmq5v0e000301s68rl1kxrs	cms9aa3k9000801s6phw014ay	2026-07-31 18:39:29.551	\N	2026-07-31 18:39:29.551
cms9ae71g000j01s69zrila6r	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1785523169447-851	cmrmq5v0e000301s68rl1kxrs	cms9aa3k9000801s6phw014ay	2026-07-31 18:39:29.572	\N	2026-07-31 18:39:29.572
cms9mrrvu000801s6cfpisnm8	cms08hjg7000301s6n8j1gozw	1	OUT	Sale INV-1785543958409-590	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-01 00:25:58.506	\N	2026-08-01 00:25:58.506
cms9mrrwm000901s6eiusuzso	cmrwt5kvz000001s6oupurq0n	1	OUT	Sale INV-1785543958409-590	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-01 00:25:58.534	\N	2026-08-01 00:25:58.534
cmsemo8cx000301s6swfh80c0	cms08vv4n000b01s601d5tzua	1	OUT	Sale INV-1785846124029-364	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-04 12:22:04.113	\N	2026-08-04 12:22:04.113
cmsewl1uw000501s6mc2ou2x3	cmrmqr19a000g01s6aqtfxfk6	1	OUT	Sale INV-1785862771763-544	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-04 16:59:31.88	\N	2026-08-04 16:59:31.88
cmsg8h2y400d401s68sr782wl	cmsg49mq4002l01s6vhym2ei1	6	OUT	Sale INV-1785943208176-380	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:20:08.236	\N	2026-08-05 15:20:08.236
cmsg8oiwj00ea01s64ws5txxn	cmsg5znvw005o01s6td0ltg7q	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.507	\N	2026-08-05 15:25:55.507
cmsg8oiz200eb01s6zdantrgo	cmsg5ti4h005601s6zqcdlnyl	7	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.598	\N	2026-08-05 15:25:55.598
cmsg8oizu00ec01s6y36hms5r	cmsg5ri4a005101s60he6v9bu	7	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.626	\N	2026-08-05 15:25:55.626
cmsg8oj0f00ed01s6lb8apywl	cmsg5ma2p004t01s6z1mechsf	7	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.647	\N	2026-08-05 15:25:55.647
cmsg8oj1300ee01s6wcyhpo5j	cmsg57083004201s6m0lzae0k	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.671	\N	2026-08-05 15:25:55.671
cmsg8oj1o00ef01s6ysjs82go	cmsg5656e004001s6k4if24v3	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.692	\N	2026-08-05 15:25:55.692
cmsg8oj2800eg01s6dmf97t1s	cmsg63e8j006801s6wjclc1gk	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.712	\N	2026-08-05 15:25:55.712
cmsg8oj2t00eh01s6loucl97d	cmsg6615l006i01s6d0dsx0g3	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.733	\N	2026-08-05 15:25:55.733
cmsg8oj3d00ei01s6razpiiij	cmsg66qp5006k01s6umuf7ioi	6	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.753	\N	2026-08-05 15:25:55.753
cmsg8oj3z00ej01s6ebgwen2h	cmsg6lsfd008701s6jxn10tyo	7	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.775	\N	2026-08-05 15:25:55.775
cmsg8oj4u00ek01s6007v6aus	cmsg6l4zv008501s62ztrajgj	1	OUT	Sale INV-1785943555365-519	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:25:55.806	\N	2026-08-05 15:25:55.806
cmsg8pfwy00et01s6dgp779v2	cmsg67o14006m01s67s6yaji6	3	OUT	Sale INV-1785943598244-151	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:26:38.29	\N	2026-08-05 15:26:38.29
cmsg8pfyq00eu01s6hch6ss2c	cmsg6bex8007301s6gcc11zp5	3	OUT	Sale INV-1785943598244-151	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:26:38.354	\N	2026-08-05 15:26:38.354
cmsg8r5si00f201s6d0up94n0	cmsg4g34p003001s6z5h1cjxu	2	OUT	Sale INV-1785943678444-622	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:27:58.482	\N	2026-08-05 15:27:58.482
cmsg8rq0l00f701s63ql4ih2n	cmsg4aukj002q01s6hz6jqye9	1	OUT	Sale INV-1785943704652-512	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:28:24.693	\N	2026-08-05 15:28:24.693
cmsg8shb600ff01s65a612fwi	cmsg4gzq9003301s6e5dc9uxa	1	OUT	Sale INV-1785943740017-154	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:29:00.066	\N	2026-08-05 15:29:00.066
cmsg8sku300fl01s6tsdxxmje	cmsg451qn002c01s6y1vkdjq3	1	OUT	Sale INV-1785943744594-680	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:29:04.635	\N	2026-08-05 15:29:04.635
cmsg8twci00ft01s6ddpzt9tn	cmsg54cbf003q01s6kd00gec0	3	OUT	Sale INV-1785943806164-302	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:30:06.21	\N	2026-08-05 15:30:06.21
cmsg93opk00g801s6qqq9elwb	cmsg49je5002i01s6cvarwut0	1	OUT	Sale INV-1785944262835-407	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:37:42.872	\N	2026-08-05 15:37:42.872
cmsg95wb200gb01s6y76v95oz	cmsg49mq4002l01s6vhym2ei1	6	RETURN	Customer Return	cmsg3amla000x01s698usq8fn	cmsg3ampe001301s6hyhcq613	2026-08-05 15:39:26.03	\N	2026-08-05 15:39:26.03
cmsg97agq00gf01s66uu1cp58	cmsg40e83002301s6r8dz9yjf	1	OUT	Sale INV-1785944430995-414	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:40:31.034	\N	2026-08-05 15:40:31.034
cmsg983gj00gl01s69ehcb50g	cmsg4g34p003001s6z5h1cjxu	5	OUT	Sale INV-1785944468580-106	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:41:08.611	\N	2026-08-05 15:41:08.611
cmsg98q4n00gs01s6i4xx3puq	cmsg40e83002301s6r8dz9yjf	5	OUT	Sale INV-1785944497951-917	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:41:37.992	\N	2026-08-05 15:41:37.992
cmsg98uov00gx01s6cc4jo9en	cmsg49je5002i01s6cvarwut0	1	OUT	Sale INV-1785944503866-522	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:41:43.903	\N	2026-08-05 15:41:43.903
cmsg9958800gz01s66bgssly0	cmsg4g34p003001s6z5h1cjxu	3	RETURN	Customer Return	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:41:57.56	\N	2026-08-05 15:41:57.56
cmsg9cdph00h601s6e8bxp4qi	cmsg458q8002e01s6478pm5l6	3	OUT	Sale INV-1785944668466-687	cmsg38ejb000n01s66874af28	cmsg38eqr000t01s66jjvivaf	2026-08-05 15:44:28.517	\N	2026-08-05 15:44:28.517
cmsg9cs8y00hb01s6fkp3y3pi	cmsg5cbd3004d01s65xg4s2x1	2	OUT	Sale INV-1785944687324-360	cmsg3i0h4001801s67p002bbz	cmsg3i0nt001e01s6vzkjqzy0	2026-08-05 15:44:47.362	\N	2026-08-05 15:44:47.362
cmsg9ef8a00hj01s6yhbd90xi	cmsg61eos005v01s6rekxul60	1	OUT	Sale INV-1785944763760-52	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-05 15:46:03.802	\N	2026-08-05 15:46:03.802
cmsg9fxeq00hu01s64qkh0pog	cmrmqk58o000d01s6fzatd6n0	1	OUT	Sale INV-1785944833965-380	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-05 15:47:14.018	\N	2026-08-05 15:47:14.018
cmsg9fxfa00hv01s6gdohapdg	cmrmqr19a000g01s6aqtfxfk6	1	OUT	Sale INV-1785944833965-380	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-05 15:47:14.038	\N	2026-08-05 15:47:14.038
cmsg9fxfv00hw01s6jvip6itd	cmrmqys0v000o01s6xmwvel9d	1	OUT	Sale INV-1785944833965-380	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-05 15:47:14.059	\N	2026-08-05 15:47:14.059
cmsg9fxgf00hx01s6un0hvcec	cmrmqv85x000k01s6btj8rupy	1	OUT	Sale INV-1785944833965-380	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-05 15:47:14.079	\N	2026-08-05 15:47:14.079
cmshns2ru000e01s64hx9zjca	cmsg49je5002i01s6cvarwut0	1	OUT	Sale INV-1786029381545-263	cmsg3mply001h01s6fbg9j6j0	cmsg3mpqm001n01s6uacw6clo	2026-08-06 15:16:21.642	\N	2026-08-06 15:16:21.642
cmsqkdpsh000601s6pv3el1br	cmrmr1g5u000r01s6mogei2xn	1	OUT	Sale INV-1786567868229-780	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-12 20:51:08.369	\N	2026-08-12 20:51:08.369
cmsqkdptb000701s6cpt45ou5	cmrmqr19a000g01s6aqtfxfk6	1	OUT	Sale INV-1786567868229-780	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-12 20:51:08.399	\N	2026-08-12 20:51:08.399
cmsqkdpts000801s6hygk3396	cmrmrmkog001a01s60ry9zqmk	1	OUT	Sale INV-1786567868229-780	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-08-12 20:51:08.416	\N	2026-08-12 20:51:08.416
\.


--
-- Data for Name: StockTransfer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StockTransfer" (id, "fromLocationId", "toLocationId", "productId", quantity, status, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subscription" (id, "businessId", plan, status, "startDate", "endDate", amount, currency, "paymentRef", "createdAt", "updatedAt") FROM stdin;
cmsc1sp8t000001s6f79bctvl	cmrmq5v0e000301s68rl1kxrs	ENTERPRISE	active	2026-08-02 17:02:08.328	2026-09-01 17:02:08.312	0.00	SLL	4J0H-0PG2-1I1C-TTK3	2026-08-02 17:02:08.333	2026-08-02 17:02:08.333
cmsg9ubr100ib01s6mm2f0j9r	cmsg3mply001h01s6fbg9j6j0	ENTERPRISE	active	2026-08-05 15:58:25.787	2026-09-04 15:58:25.775	0.00	SLL	F3LH-PJHD-O4F3-IH6M	2026-08-05 15:58:25.789	2026-08-05 15:58:25.789
cmsg9w1m200if01s6uihbh1l5	cmrmq5v0e000301s68rl1kxrs	BUSINESS	active	2026-08-05 15:59:45.96	2026-09-04 15:59:45.951	0.00	SLL	NP82-L65U-FHG9-ZTWP	2026-08-05 15:59:45.962	2026-08-05 15:59:45.962
cmsg9w3js00ih01s689pheswt	cmsg3i0h4001801s67p002bbz	ENTERPRISE	active	2026-08-05 15:59:48.471	2026-09-04 15:59:48.465	0.00	SLL	2OWB-1Z4H-8622-CBR3	2026-08-05 15:59:48.472	2026-08-05 15:59:48.472
cmshe6b08000301s613zb6ltx	cmshcxlvv000001s682ba2jim	ENTERPRISE	active	2026-08-06 10:47:29.332	2026-09-05 10:47:29.322	0.00	SLL	98F0-J7JE-W55A-4AZC	2026-08-06 10:47:29.336	2026-08-06 10:47:29.336
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Supplier" (id, name, contact, email, phone, "businessId", "createdAt", "updatedAt", "deletedAt", address, notes, "paymentTerms", "taxId") FROM stdin;
cmrndbmox000701s60mewvkbs	CTC	Mr. Moseray 		034955581	cmrmq5v0e000301s68rl1kxrs	2026-07-16 10:30:32.865	2026-07-16 10:30:32.865	\N	\N	\N	Net 30	\N
cmrwrn7yb00002wln0qr31tlu	Protech	Ishmael Steven Moseray	strangesteven001@gmail.com	+23230798318	cmrmq5v0e000301s68rl1kxrs	2026-07-23 00:21:23.843	2026-07-23 00:21:23.843	\N	25C old railway line Tengbeh Town	Tech	Net 30	
\.


--
-- Data for Name: SupplierPayment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupplierPayment" (id, "supplierId", amount, "paymentMethod", "referenceNumber", "paymentDate", notes, "businessId", "userId", "createdAt", "updatedAt") FROM stdin;
cmrwrshie00022wlnac9chbk1	cmrndbmox000701s60mewvkbs	5000.00	CASH	\N	2026-07-23 00:00:00	\N	cmrmq5v0e000301s68rl1kxrs	cmrmq5v3k000901s6lnumwy2c	2026-07-23 00:25:29.51	2026-07-23 00:25:29.51
\.


--
-- Data for Name: SupplierPriceList; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SupplierPriceList" (id, "supplierId", "productId", "unitCost", "minOrderQty", "leadTimeDays", notes, "businessId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSetting" (id, "registrationOpen", "defaultTrialDays", "announcementBanner", "announcementBannerUpdatedAt", "emailAlertsEnabled", "createdAt", "updatedAt") FROM stdin;
singleton	t	30	🎁 Refer a Business, Get 1 Month FREE! Invite businesses to Protech Assist Enterprise OS. Earn a FREE subscription month for every successful referral. [Refer Now]	2026-07-25T00:21:10.053Z	t	2026-07-14 12:30:25.589	2026-08-04 10:23:48.226
\.


--
-- Data for Name: TransactionTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransactionTag" (id, name, color, "businessId", "createdAt") FROM stdin;
cmrt55bkj000401s6ekdkwr0g	Marketing	#DC2626	cmrmq5v0e000301s68rl1kxrs	2026-07-20 11:28:18.643
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, username, email, "passwordHash", status, "businessId", "createdAt", "updatedAt", "deletedAt", "roleId", specialization, "hourlyRate", salary, "emailVerified", "verificationToken", department, "imageUrl", "jobTitle", phone, "failedLoginAttempts") FROM stdin;
cmrmdlu9f000101s6fu54q4y4	Ishmael Steven Moseray	@drstrange	stevenstrange001@outlook.com	$2b$10$4KIHexJUS9NMVo9fLNowvOsr3X.y/kMEaaeGOxRahKb36pdSz68PK	active	cmrjt12jq0000lcln3os8anz5	2026-07-15 17:50:43.059	2026-07-15 17:50:43.059	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	0
cmrnhyrpy000o01s66ob8mtyw	julian edwin felix smith	king julian	juel.love@gmailcom	$2b$10$dbOcAykVrzkHuaQqrps4WOOwxzaK38oFXXQ0xKLxvUz9P5YkoejpW	active	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:40:30.934	2026-07-16 12:40:30.934	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	0
cmsda4ufa000f01s6k3ak46m9	Ishmael S. Moseray	\N	strangesteven01@gmail.com	$2b$10$6csCXLvf5O5rJYYJC2asoeeAvInVuqnTsbscqe5Kj737drCPuULie	active	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:43:18.022	2026-08-03 13:43:18.022	\N	cmsd9hiod000201s6fw71e0g0	\N	\N	\N	\N	fe250ce0-b029-434d-b6a6-dcaa4b2aed52	IT / Engineering	https://res.cloudinary.com/daojpref4/image/upload/v1785764453/inventory/avatars/fyqsy2i6ozmdfpfb4y0p.webp	CEO	034955581	0
cmsg3ampe001301s6hyhcq613	Admin	\N	Electronic@gmail.com	$2b$10$l2aeBbkU/Fmyh5ASKJYL4OZv1MKQ0mWmQ8JcWRAoRFCOuRqUonF5.	active	cmsg3amla000x01s698usq8fn	2026-08-05 12:55:09.17	2026-08-12 21:00:52.662	\N	cmsg3amlo000y01s68i943xdm	\N	\N	\N	\N	b42e9cee-a139-4f47-987b-0eedcab3c856	\N	\N	\N	\N	0
cms9aa3k9000801s6phw014ay	Dr Moseray 	\N	moseray@gmail.com	$2b$10$q3PFtyIdJmWkyHtKYVDGVeI9At7ahkHZUYJTZUgPJohQLpXkGil6a	active	cmrmq5v0e000301s68rl1kxrs	2026-07-31 18:36:18.442	2026-07-31 18:36:18.442	\N	cms9a7hzw000701s67rlguzp7	\N	\N	\N	\N	0499cb24-1ba6-4508-bcd5-c62431f7e0de	\N	https://res.cloudinary.com/daojpref4/image/upload/v1785522943/inventory/avatars/w0u0yyaldfqusvlfbd9b.webp	\N	\N	0
cmrw19y5t000201s6tl660ld1	Ishmael Steven Moseray 	\N	steven@gmail.com	$2b$10$ddXmTAh/Vyv5QZ0S8Z7doOwhZ8oxhKsxnLGmUjXXciN36x/Eg709q	inactive	cmrmq5v0e000301s68rl1kxrs	2026-07-22 12:03:14.609	2026-08-01 00:18:59.795	2026-08-01 00:18:59.791	cmrmq5v2q000601s6hy4eis3z	\N	\N	\N	\N	b20a2bda-e322-4100-9b03-92a8e1458c51	\N	https://res.cloudinary.com/daojpref4/image/upload/v1784721717/inventory/avatars/axnah7owesgnxqoeejpj.webp	\N	\N	0
cmsd9hiri000701s6dc8942e0	Admin	\N	protechassist36@gmail.com	$2b$10$BpulZ4wsjG1QPYwM.yPTKeXDuRHWVE9DAB7/FB/KmkTI2sWKHIBK.	active	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:25:09.822	2026-08-03 13:25:09.822	\N	cmsd9hiod000201s6fw71e0g0	\N	\N	\N	\N	a9210767-7e7f-4d5d-8402-3df094f29b40	\N	\N	\N	\N	0
cmsdatzcb000m01s67uoi7tic	Abdul bineh kalokoh	\N	abdulbinehkalokoh@gmail.com	$2b$10$MCUOiBwbq/m5sc0CqUfRNOBPULIjCzgUNVLZNp.Ju3.zYI0jS6wwq	active	cmsd9himw000101s6z1fvs8fl	2026-08-03 14:02:50.795	2026-08-05 12:19:22.263	\N	cmsd9hiod000201s6fw71e0g0	\N	\N	\N	\N	327755a4-4f61-4fee-9bef-120ea617e3f3	Administration	https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=e2e8f0	Administrator	032678843	0
cmsdajq7x000k01s6wf9x5e1s	Julian Edwin Felix smith	\N	juel.love1@gmailcom	$2b$10$uIYKuj2aeRbVXJjIBj1Q8O.iGlDCu99a.ZBGj9.9HmHdDk280/XFq	inactive	cmsd9himw000101s6z1fvs8fl	2026-08-03 13:54:52.413	2026-08-05 12:23:23.662	\N	cmsd9hiod000201s6fw71e0g0	\N	\N	\N	\N	7fd9a456-6c51-4506-8f71-251cede0c5c0	Finance	https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=e2e8f0	Finance manager 	031389794	0
cmshcxm52000801s6xux31gzs	Admin	\N	clinic@gmail.com	$2b$10$vKimmeADCtL9z/0lCmFJM.w4gYfA2cV7ejL/GXlazwYefj71icpoS	active	cmshcxlvv000001s682ba2jim	2026-08-06 10:12:44.246	2026-08-06 10:12:44.246	\N	cmshcxly8000101s6ory43vyf	\N	\N	\N	\N	107289ff-2e56-4561-83ab-9328ae2cf47a	\N	\N	\N	\N	0
cmsg2hnri000b01s6wu161h2l	Alhaji Amadu Bah	Alhaji_bah	baha80305@gmail.com	$2b$10$EsKzUcnJnPHWkAyCF1FuBuYRVO15KkceUkamebyy5493gbcSRO2pq	active	cmrjt12jq0000lcln3os8anz5	2026-08-05 12:32:37.518	2026-08-05 12:32:37.518	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	0
cmshe96pv000501s6c0w9pf09	Ishmael Steven Moseray	\N	ishmaelsmoseray@gmail.com	$2b$10$0CFhvPu0oKc4jKhnKTjxNubW5XkrDSr6w40wujUVLNT3GMXL1c8ZK	active	cmshcxlvv000001s682ba2jim	2026-08-06 10:49:43.747	2026-08-06 10:49:43.747	\N	cmshcxm2a000401s67ht5uc6j	cardiologist 	\N	\N	\N	951f7a12-3641-42e9-be53-cfe90c612b6f	\N	https://res.cloudinary.com/daojpref4/image/upload/v1786013313/inventory/avatars/fvl0cncsetuxbjd81b0c.webp	\N	\N	0
cmrza5stq000d01s6mtfyhx70	Abdul Bineh Kalokoh	Abdul Bineh	abdulbineh@gmail.com	$2b$10$rMlZMhAmQPUzIuFuDEjKReMfYaWJZiSsUS8HA2cQu3VbjyY1znOrK	active	cmrjt12jq0000lcln3os8anz5	2026-07-24 18:35:16.142	2026-08-05 12:35:34.687	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	0
cmsg38eqr000t01s66jjvivaf	Admin	\N	bar@gmail.com	$2b$10$BqTYkZbl9AsgIkjhF3iRae8LOOc/sv0KVvMXvWEDYjDFuQOlY2AdO	active	cmsg38ejb000n01s66874af28	2026-08-05 12:53:25.539	2026-08-05 12:53:25.539	\N	cmsg38ell000o01s6zommxaq3	\N	\N	\N	\N	dec3d58b-6409-448d-b703-f9e62eb485a5	\N	\N	\N	\N	0
cmsg3mpqm001n01s6uacw6clo	Admin	\N	luxuryboutique001@gmail.com	$2b$10$r/Q.VBuKOMyLT3qgcSbxN.Ds48D.sRwa.QT0ZDfmno5gSN9wmh8fi	active	cmsg3mply001h01s6fbg9j6j0	2026-08-05 13:04:32.974	2026-08-05 13:04:32.974	\N	cmsg3mpmf001i01s6iy5pzbsu	\N	\N	\N	\N	841ea291-1da8-484f-af3d-8ab74c8634be	\N	\N	\N	\N	0
cmshhxfvv000601s6kej7h7v5	Ibrahim	\N	bah2halal@gmail.com	$2b$10$xq/LK65ZA9xuXAbYIaZUUux6/mwDprpjdpQvKyK1fOR/2C5hcSq/q	inactive	cmshcxlvv000001s682ba2jim	2026-08-06 12:32:34.219	2026-08-06 12:42:25.957	2026-08-06 12:42:25.957	cmshcxly8000101s6ory43vyf	\N	\N	\N	\N	83b75ed5-06a7-494c-b4e6-1b7394069a7e	\N	\N	\N	\N	0
cmrmq5v3k000901s6lnumwy2c	Admin	\N	shop@gmail.com	$2b$10$hPbqxd3aTHkieQ6mvWBFF.MoGxRy9n2GqgIoR8dITNOIzdLADoVdi	active	cmrmq5v0e000301s68rl1kxrs	2026-07-15 23:42:12.656	2026-08-12 21:13:11.01	\N	cmrmq5v1p000401s6y72lcc3w	\N	\N	\N	\N	a9a2e3bf-af29-4eae-a2c5-b4cf65c80908	\N	https://api.dicebear.com/7.x/notionists/svg?seed=Robert&backgroundColor=e2e8f0	\N	\N	0
cmrjt1vu80002lcln5oxlwhqy	Dr. Strange Admin	\N	strangesteven001@gmail.com	$2b$10$gIO7uCVWfvWodhoIN0BZ9e0Z6tFbSbn68gnQrxr5NEGF/R/DYUt3C	active	cmrjt12jq0000lcln3os8anz5	2026-07-13 22:39:47.312	2026-08-15 19:58:01.781	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	0
cmrnhyn91000m01s6y2ree9sj	ALPHA RAHIMTECH BAH	Rahim Tech	rahimtech007@gmail.com	$2b$10$uwIMoX1nqRlmsAB4jF8wReVBE7aBnOX/0RDD10En6r2qFedtmly36	blocked	cmrjt12jq0000lcln3os8anz5	2026-07-16 12:40:25.141	2026-08-15 13:02:09.262	\N	cmrjt1kr90001lclngzxcqgwv	\N	\N	\N	\N	\N	\N	\N	\N	\N	3
cmsg3i0nt001e01s6vzkjqzy0	Admin	\N	brightwave@gmail.com	$2b$10$Q58K9j5HwneNHVZfRGd/..MbHzrCuIiUIZv2dusnuzW6aQka8PMCK	active	cmsg3i0h4001801s67p002bbz	2026-08-05 13:00:53.849	2026-08-12 21:00:35.757	\N	cmsg3i0hm001901s6rlnbatlj	\N	\N	\N	\N	02342c81-8b4e-4998-a28d-0395863c8bf3	\N	\N	\N	\N	0
cmshi11qa000e01s6rvgf8lzt	Ibrahim	\N	6years@gmail.com	$2b$10$rVsUgmrRZ8z0mBqcaw4Vj.jeistt4JV5fo5kPym6mMVcPTuMheeEq	inactive	cmshcxlvv000001s682ba2jim	2026-08-06 12:35:22.498	2026-08-06 12:35:52.364	2026-08-06 12:35:52.36	cmshcxly8000101s6ory43vyf	\N	\N	\N	\N	9dbe42ca-3e74-4652-acb7-6d3b8362a696	\N	https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=e2e8f0	\N	\N	0
cmshicst8000o01s6sia7gbop	Ibrahim	\N	protect@gmail.com	$2b$10$.4e0cDTSwnSYSFfI/4skf.OvDCriSAqqjBYdgycpOGMUB2jMJlf1O	active	cmshcxlvv000001s682ba2jim	2026-08-06 12:44:30.812	2026-08-06 12:44:30.812	\N	cmshcxlzu000201s68xr0orvj	\N	\N	\N	\N	b10bc08d-3fe3-44a8-ad41-d62f9072f376	\N	https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=e2e8f0	\N	\N	0
\.


--
-- Data for Name: Wastage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wastage" (id, "productId", "productName", quantity, unit, reason, "costValue", notes, "businessId", "recordedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _ExpenseToTransactionTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ExpenseToTransactionTag" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _PermissionToRole; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_PermissionToRole" ("A", "B") FROM stdin;
cmrwj82rp0000lolnrwkhijda	cmrmq5v1p000401s6y72lcc3w
cmrwj83nb0001lolnso7nrlqe	cmrmq5v1p000401s6y72lcc3w
cmrwj84im0002lolnoa9cjgnv	cmrmq5v1p000401s6y72lcc3w
cmrwj85qp0003lolnvcnfwmag	cmrmq5v1p000401s6y72lcc3w
cmrwj86v40004loln7255kmxi	cmrmq5v1p000401s6y72lcc3w
cmrwj87px0005lolnfu0n7wvn	cmrmq5v1p000401s6y72lcc3w
cmrwj89fg0007lolndj8ypwye	cmrmq5v1p000401s6y72lcc3w
cmrwj8b3m0008lolnhyef758p	cmrmq5v1p000401s6y72lcc3w
cmrwj8c0v0009loln663y2jva	cmrmq5v1p000401s6y72lcc3w
cmrwj8cvu000alolnwomd20qc	cmrmq5v1p000401s6y72lcc3w
cmrwj8drg000blolnb0t56cm8	cmrmq5v1p000401s6y72lcc3w
cmrwj8ewq000cloln9vqj9z69	cmrmq5v1p000401s6y72lcc3w
cmrwj8g4d000dloln8u8954c5	cmrmq5v1p000401s6y72lcc3w
cmrwj8h7w000eloln7vlict9c	cmrmq5v1p000401s6y72lcc3w
cmrwj8i3m000flolngqscrvdl	cmrmq5v1p000401s6y72lcc3w
cmrwj8j2t000gloln2jc36mhz	cmrmq5v1p000401s6y72lcc3w
cmrwj8kbt000hloln5ojn12g1	cmrmq5v1p000401s6y72lcc3w
cmrwj8ld8000ilolnp49yj66h	cmrmq5v1p000401s6y72lcc3w
cmrwj8m8l000jloln5rgelj5q	cmrmq5v1p000401s6y72lcc3w
cmrwj8wub000qlolnyw9xcgih	cmrmq5v1p000401s6y72lcc3w
cmrwj8xpm000rlolnkild41kb	cmrmq5v1p000401s6y72lcc3w
cmrwj8yo9000sloln7m5om7ig	cmrmq5v1p000401s6y72lcc3w
cmrwj91qy000tlolnnredfudf	cmrmq5v1p000401s6y72lcc3w
cmrwj9372000uloln2e77htdq	cmrmq5v1p000401s6y72lcc3w
cmrwj98or000zlolnlhbiud9o	cmrmq5v1p000401s6y72lcc3w
cmrwj99y70010loln8deexla6	cmrmq5v1p000401s6y72lcc3w
cmrwj82rp0000lolnrwkhijda	cmsg38emx000p01s6b4e58pdw
cmrwj82rp0000lolnrwkhijda	cmsg38enj000q01s64een1qgt
cmrwj82rp0000lolnrwkhijda	cmsg38eo4000r01s61o1pri2l
cmrwj87px0005lolnfu0n7wvn	cmsg38eo4000r01s61o1pri2l
cmrwj82rp0000lolnrwkhijda	cmsg38eow000s01s6d9ou7j2z
cmrwj89fg0007lolndj8ypwye	cmsg38eow000s01s6d9ou7j2z
cmrwj8wub000qlolnyw9xcgih	cmsg38eow000s01s6d9ou7j2z
cmrwj82rp0000lolnrwkhijda	cmrmq5v2q000601s6hy4eis3z
cmrwj82rp0000lolnrwkhijda	cmsg38ell000o01s6zommxaq3
cmrwj83nb0001lolnso7nrlqe	cmsg38ell000o01s6zommxaq3
cmrwj84im0002lolnoa9cjgnv	cmsg38ell000o01s6zommxaq3
cmrwj85qp0003lolnvcnfwmag	cmsg38ell000o01s6zommxaq3
cmrwj86v40004loln7255kmxi	cmsg38ell000o01s6zommxaq3
cmrwj87px0005lolnfu0n7wvn	cmsg38ell000o01s6zommxaq3
cmrwj88ku0006lolnnbrsmlgc	cmsg38ell000o01s6zommxaq3
cmrwj89fg0007lolndj8ypwye	cmsg38ell000o01s6zommxaq3
cmrwj8b3m0008lolnhyef758p	cmsg38ell000o01s6zommxaq3
cmrwj8c0v0009loln663y2jva	cmsg38ell000o01s6zommxaq3
cmrwj8cvu000alolnwomd20qc	cmsg38ell000o01s6zommxaq3
cmrwj8drg000blolnb0t56cm8	cmsg38ell000o01s6zommxaq3
cmrwj8ewq000cloln9vqj9z69	cmsg38ell000o01s6zommxaq3
cmrwj8g4d000dloln8u8954c5	cmsg38ell000o01s6zommxaq3
cmrwj82rp0000lolnrwkhijda	cmrmq5v39000801s64b7eoaa8
cmrwj89fg0007lolndj8ypwye	cmrmq5v39000801s64b7eoaa8
cmrwj8wub000qlolnyw9xcgih	cmrmq5v39000801s64b7eoaa8
cmrwj8h7w000eloln7vlict9c	cmsg38ell000o01s6zommxaq3
cmrwj8i3m000flolngqscrvdl	cmsg38ell000o01s6zommxaq3
cmrwj8j2t000gloln2jc36mhz	cmsg38ell000o01s6zommxaq3
cmrwj8kbt000hloln5ojn12g1	cmsg38ell000o01s6zommxaq3
cmrwj8ld8000ilolnp49yj66h	cmsg38ell000o01s6zommxaq3
cmrwj8m8l000jloln5rgelj5q	cmsg38ell000o01s6zommxaq3
cmrwj8n4c000klolngz6sxg73	cmsg38ell000o01s6zommxaq3
cmrwj8oal000llolnu9uhhca5	cmsg38ell000o01s6zommxaq3
cmrwj8pyk000mlolnngnjt7ua	cmsg38ell000o01s6zommxaq3
cmrwj82rp0000lolnrwkhijda	cmsg3amlo000y01s68i943xdm
cmrwj82rp0000lolnrwkhijda	cmsg3amme000z01s65jutq8nq
cmrwj82rp0000lolnrwkhijda	cmsg3ammz001001s6ll3q1fwk
cmrwj82rp0000lolnrwkhijda	cmsg3amnk001101s6ds91z3js
cmrwj87px0005lolnfu0n7wvn	cmsg3amnk001101s6ds91z3js
cmrwj82rp0000lolnrwkhijda	cmsg3amo5001201s62cezj8bk
cmrwj89fg0007lolndj8ypwye	cmsg3amo5001201s62cezj8bk
cmrwj8wub000qlolnyw9xcgih	cmsg3amo5001201s62cezj8bk
cmrwj83nb0001lolnso7nrlqe	cmsg3amlo000y01s68i943xdm
cmrwj84im0002lolnoa9cjgnv	cmsg3amlo000y01s68i943xdm
cmrwj85qp0003lolnvcnfwmag	cmsg3amlo000y01s68i943xdm
cmrwj86v40004loln7255kmxi	cmsg3amlo000y01s68i943xdm
cmrwj87px0005lolnfu0n7wvn	cmsg3amlo000y01s68i943xdm
cmrwj88ku0006lolnnbrsmlgc	cmsg3amlo000y01s68i943xdm
cmrwj89fg0007lolndj8ypwye	cmsg3amlo000y01s68i943xdm
cmrwj8b3m0008lolnhyef758p	cmsg3amlo000y01s68i943xdm
cmrwj8c0v0009loln663y2jva	cmsg3amlo000y01s68i943xdm
cmrwj8ld8000ilolnp49yj66h	cmsd9hiod000201s6fw71e0g0
cmrwj8m8l000jloln5rgelj5q	cmsd9hiod000201s6fw71e0g0
cmrwj8n4c000klolngz6sxg73	cmsd9hiod000201s6fw71e0g0
cmrwj8oal000llolnu9uhhca5	cmsd9hiod000201s6fw71e0g0
cmrwj8pyk000mlolnngnjt7ua	cmsd9hiod000201s6fw71e0g0
cmrwj8rbl000nloln6qamz2o9	cmsd9hiod000201s6fw71e0g0
cmrwj8s7z000ololn4buldpvo	cmsd9hiod000201s6fw71e0g0
cmrwj8tlx000plolnaegmityw	cmsd9hiod000201s6fw71e0g0
cmrwj8wub000qlolnyw9xcgih	cmsd9hiod000201s6fw71e0g0
cmrwj8xpm000rlolnkild41kb	cmsd9hiod000201s6fw71e0g0
cmrwj8yo9000sloln7m5om7ig	cmsd9hiod000201s6fw71e0g0
cmrwj91qy000tlolnnredfudf	cmsd9hiod000201s6fw71e0g0
cmrwj9372000uloln2e77htdq	cmsd9hiod000201s6fw71e0g0
cmrwj94pq000vlolnevoeuass	cmsd9hiod000201s6fw71e0g0
cmrwj95rx000wlolncifbbxsi	cmsd9hiod000201s6fw71e0g0
cmrwj96ms000xloln92uifl6u	cmsd9hiod000201s6fw71e0g0
cmrwj97i9000ylolnxplk5ozy	cmsd9hiod000201s6fw71e0g0
cmrwj98or000zlolnlhbiud9o	cmsd9hiod000201s6fw71e0g0
cmrwj99y70010loln8deexla6	cmsd9hiod000201s6fw71e0g0
cmrwj8cvu000alolnwomd20qc	cmsg3amlo000y01s68i943xdm
cmrwj8drg000blolnb0t56cm8	cmsg3amlo000y01s68i943xdm
cmrwj8ewq000cloln9vqj9z69	cmsg3amlo000y01s68i943xdm
cmrwj8g4d000dloln8u8954c5	cmsg3amlo000y01s68i943xdm
cmrwj8h7w000eloln7vlict9c	cmsg3amlo000y01s68i943xdm
cmrwj8i3m000flolngqscrvdl	cmsg3amlo000y01s68i943xdm
cmrwj8j2t000gloln2jc36mhz	cmsg3amlo000y01s68i943xdm
cmrwj8kbt000hloln5ojn12g1	cmsg3amlo000y01s68i943xdm
cmrwj8ld8000ilolnp49yj66h	cmsg3amlo000y01s68i943xdm
cmrwj8m8l000jloln5rgelj5q	cmsg3amlo000y01s68i943xdm
cmrwj8n4c000klolngz6sxg73	cmsg3amlo000y01s68i943xdm
cmrwj8oal000llolnu9uhhca5	cmsg3amlo000y01s68i943xdm
cmrwj8pyk000mlolnngnjt7ua	cmsg3amlo000y01s68i943xdm
cmrwj8rbl000nloln6qamz2o9	cmsg3amlo000y01s68i943xdm
cmrwj8s7z000ololn4buldpvo	cmsg3amlo000y01s68i943xdm
cmrwj8tlx000plolnaegmityw	cmsg3amlo000y01s68i943xdm
cmrwj8wub000qlolnyw9xcgih	cmsg3amlo000y01s68i943xdm
cmrwj8xpm000rlolnkild41kb	cmsg3amlo000y01s68i943xdm
cmrwj8yo9000sloln7m5om7ig	cmsg3amlo000y01s68i943xdm
cmrwj91qy000tlolnnredfudf	cmsg3amlo000y01s68i943xdm
cmrwj9372000uloln2e77htdq	cmsg3amlo000y01s68i943xdm
cmrwj94pq000vlolnevoeuass	cmsg3amlo000y01s68i943xdm
cmrwj95rx000wlolncifbbxsi	cmsg3amlo000y01s68i943xdm
cmrwj96ms000xloln92uifl6u	cmsg3amlo000y01s68i943xdm
cmrwj97i9000ylolnxplk5ozy	cmsg3amlo000y01s68i943xdm
cmrwj98or000zlolnlhbiud9o	cmsg3amlo000y01s68i943xdm
cmrwj99y70010loln8deexla6	cmsg3amlo000y01s68i943xdm
cmrwj8rbl000nloln6qamz2o9	cmsg38ell000o01s6zommxaq3
cmrwj8s7z000ololn4buldpvo	cmsg38ell000o01s6zommxaq3
cmrwj8tlx000plolnaegmityw	cmsg38ell000o01s6zommxaq3
cmrwj8wub000qlolnyw9xcgih	cmsg38ell000o01s6zommxaq3
cmrwj8xpm000rlolnkild41kb	cmsg38ell000o01s6zommxaq3
cmrwj8yo9000sloln7m5om7ig	cmsg38ell000o01s6zommxaq3
cmrwj91qy000tlolnnredfudf	cmsg38ell000o01s6zommxaq3
cmrwj9372000uloln2e77htdq	cmsg38ell000o01s6zommxaq3
cmrwj94pq000vlolnevoeuass	cmsg38ell000o01s6zommxaq3
cmrwj95rx000wlolncifbbxsi	cmsg38ell000o01s6zommxaq3
cmrwj96ms000xloln92uifl6u	cmsg38ell000o01s6zommxaq3
cmrwj97i9000ylolnxplk5ozy	cmsg38ell000o01s6zommxaq3
cmrwj98or000zlolnlhbiud9o	cmsg38ell000o01s6zommxaq3
cmrwj99y70010loln8deexla6	cmsg38ell000o01s6zommxaq3
cmrwj82rp0000lolnrwkhijda	cmsg3mpol001l01s6pc6yibgy
cmrwj87px0005lolnfu0n7wvn	cmsg3mpol001l01s6pc6yibgy
cmrwj82rp0000lolnrwkhijda	cmsg3mpp6001m01s67po31qms
cmrwj89fg0007lolndj8ypwye	cmsg3mpp6001m01s67po31qms
cmrwj8wub000qlolnyw9xcgih	cmsg3mpp6001m01s67po31qms
cmrwj83nb0001lolnso7nrlqe	cmsg3mpmf001i01s6iy5pzbsu
cmrwj84im0002lolnoa9cjgnv	cmsg3mpmf001i01s6iy5pzbsu
cmrwj85qp0003lolnvcnfwmag	cmsg3mpmf001i01s6iy5pzbsu
cmrwj86v40004loln7255kmxi	cmsg3mpmf001i01s6iy5pzbsu
cmrwj87px0005lolnfu0n7wvn	cmsg3mpmf001i01s6iy5pzbsu
cmrwj88ku0006lolnnbrsmlgc	cmsg3mpmf001i01s6iy5pzbsu
cmrwj89fg0007lolndj8ypwye	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8b3m0008lolnhyef758p	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8c0v0009loln663y2jva	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8cvu000alolnwomd20qc	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8drg000blolnb0t56cm8	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8ewq000cloln9vqj9z69	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8g4d000dloln8u8954c5	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8h7w000eloln7vlict9c	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8i3m000flolngqscrvdl	cmsg3mpmf001i01s6iy5pzbsu
cmrwj82rp0000lolnrwkhijda	cmsg3i0hm001901s6rlnbatlj
cmrwj82rp0000lolnrwkhijda	cmsg3i0it001a01s6v4io89xf
cmrwj82rp0000lolnrwkhijda	cmsg3i0jg001b01s6dhatuv4h
cmrwj82rp0000lolnrwkhijda	cmsg3i0kb001c01s624jirtbl
cmrwj87px0005lolnfu0n7wvn	cmsg3i0kb001c01s624jirtbl
cmrwj89fg0007lolndj8ypwye	cmsg3i0kb001c01s624jirtbl
cmrwj8s7z000ololn4buldpvo	cmsg3i0kb001c01s624jirtbl
cmrwj8tlx000plolnaegmityw	cmsg3i0kb001c01s624jirtbl
cmrwj82rp0000lolnrwkhijda	cmsg3i0lb001d01s6ktq2fqav
cmrwj87px0005lolnfu0n7wvn	cmsg3i0lb001d01s6ktq2fqav
cmrwj83nb0001lolnso7nrlqe	cmsg3i0hm001901s6rlnbatlj
cmrwj84im0002lolnoa9cjgnv	cmsg3i0hm001901s6rlnbatlj
cmrwj85qp0003lolnvcnfwmag	cmsg3i0hm001901s6rlnbatlj
cmrwj86v40004loln7255kmxi	cmsg3i0hm001901s6rlnbatlj
cmrwj87px0005lolnfu0n7wvn	cmsg3i0hm001901s6rlnbatlj
cmrwj88ku0006lolnnbrsmlgc	cmsg3i0hm001901s6rlnbatlj
cmrwj89fg0007lolndj8ypwye	cmsg3i0hm001901s6rlnbatlj
cmrwj8b3m0008lolnhyef758p	cmsg3i0hm001901s6rlnbatlj
cmrwj8c0v0009loln663y2jva	cmsg3i0hm001901s6rlnbatlj
cmrwj8cvu000alolnwomd20qc	cmsg3i0hm001901s6rlnbatlj
cmrwj8drg000blolnb0t56cm8	cmsg3i0hm001901s6rlnbatlj
cmrwj8ewq000cloln9vqj9z69	cmsg3i0hm001901s6rlnbatlj
cmrwj8g4d000dloln8u8954c5	cmsg3i0hm001901s6rlnbatlj
cmrwj8h7w000eloln7vlict9c	cmsg3i0hm001901s6rlnbatlj
cmrwj8i3m000flolngqscrvdl	cmsg3i0hm001901s6rlnbatlj
cmrwj8j2t000gloln2jc36mhz	cmsg3i0hm001901s6rlnbatlj
cmrwj8kbt000hloln5ojn12g1	cmsg3i0hm001901s6rlnbatlj
cmrwj8ld8000ilolnp49yj66h	cmsg3i0hm001901s6rlnbatlj
cmrwj8m8l000jloln5rgelj5q	cmsg3i0hm001901s6rlnbatlj
cmrwj8n4c000klolngz6sxg73	cmsg3i0hm001901s6rlnbatlj
cmrwj8oal000llolnu9uhhca5	cmsg3i0hm001901s6rlnbatlj
cmrwj8pyk000mlolnngnjt7ua	cmsg3i0hm001901s6rlnbatlj
cmrwj8rbl000nloln6qamz2o9	cmsg3i0hm001901s6rlnbatlj
cmrwj8s7z000ololn4buldpvo	cmsg3i0hm001901s6rlnbatlj
cmrwj8tlx000plolnaegmityw	cmsg3i0hm001901s6rlnbatlj
cmrwj8wub000qlolnyw9xcgih	cmsg3i0hm001901s6rlnbatlj
cmrwj8xpm000rlolnkild41kb	cmsg3i0hm001901s6rlnbatlj
cmrwj8yo9000sloln7m5om7ig	cmsg3i0hm001901s6rlnbatlj
cmrwj91qy000tlolnnredfudf	cmsg3i0hm001901s6rlnbatlj
cmrwj9372000uloln2e77htdq	cmsg3i0hm001901s6rlnbatlj
cmrwj94pq000vlolnevoeuass	cmsg3i0hm001901s6rlnbatlj
cmrwj95rx000wlolncifbbxsi	cmsg3i0hm001901s6rlnbatlj
cmrwj96ms000xloln92uifl6u	cmsg3i0hm001901s6rlnbatlj
cmrwj97i9000ylolnxplk5ozy	cmsg3i0hm001901s6rlnbatlj
cmrwj98or000zlolnlhbiud9o	cmsg3i0hm001901s6rlnbatlj
cmrwj99y70010loln8deexla6	cmsg3i0hm001901s6rlnbatlj
cmrwj82rp0000lolnrwkhijda	cmsg3mpmf001i01s6iy5pzbsu
cmrwj82rp0000lolnrwkhijda	cmsg3mpn2001j01s6j94skhw6
cmrwj82rp0000lolnrwkhijda	cmsg3mpno001k01s64f9g0km1
cmrwj82rp0000lolnrwkhijda	cms9a7hzw000701s67rlguzp7
cmrwj83nb0001lolnso7nrlqe	cms9a7hzw000701s67rlguzp7
cmrwj84im0002lolnoa9cjgnv	cms9a7hzw000701s67rlguzp7
cmrwj85qp0003lolnvcnfwmag	cms9a7hzw000701s67rlguzp7
cmrwj86v40004loln7255kmxi	cms9a7hzw000701s67rlguzp7
cmrwj87px0005lolnfu0n7wvn	cms9a7hzw000701s67rlguzp7
cmrwj89fg0007lolndj8ypwye	cms9a7hzw000701s67rlguzp7
cmrwj8b3m0008lolnhyef758p	cms9a7hzw000701s67rlguzp7
cmrwj8c0v0009loln663y2jva	cms9a7hzw000701s67rlguzp7
cmrwj8cvu000alolnwomd20qc	cms9a7hzw000701s67rlguzp7
cmrwj8drg000blolnb0t56cm8	cms9a7hzw000701s67rlguzp7
cmrwj8ewq000cloln9vqj9z69	cms9a7hzw000701s67rlguzp7
cmrwj8h7w000eloln7vlict9c	cms9a7hzw000701s67rlguzp7
cmrwj8j2t000gloln2jc36mhz	cms9a7hzw000701s67rlguzp7
cmrwj8kbt000hloln5ojn12g1	cms9a7hzw000701s67rlguzp7
cmrwj8ld8000ilolnp49yj66h	cms9a7hzw000701s67rlguzp7
cmrwj8wub000qlolnyw9xcgih	cms9a7hzw000701s67rlguzp7
cmrwj8xpm000rlolnkild41kb	cms9a7hzw000701s67rlguzp7
cmrwj8yo9000sloln7m5om7ig	cms9a7hzw000701s67rlguzp7
cmrwj91qy000tlolnnredfudf	cms9a7hzw000701s67rlguzp7
cmrwj9372000uloln2e77htdq	cms9a7hzw000701s67rlguzp7
cmrwj98or000zlolnlhbiud9o	cms9a7hzw000701s67rlguzp7
cmrwj99y70010loln8deexla6	cms9a7hzw000701s67rlguzp7
cmrwj82rp0000lolnrwkhijda	cmsd9hiod000201s6fw71e0g0
cmrwj82rp0000lolnrwkhijda	cmsd9hip7000301s67inbuxgb
cmrwj82rp0000lolnrwkhijda	cmsd9hipk000401s64lys2xfy
cmrwj82rp0000lolnrwkhijda	cmsd9hipx000501s6g86o1uta
cmrwj87px0005lolnfu0n7wvn	cmsd9hipx000501s6g86o1uta
cmrwj82rp0000lolnrwkhijda	cmsd9hiqc000601s653sccrvr
cmrwj89fg0007lolndj8ypwye	cmsd9hiqc000601s653sccrvr
cmrwj8wub000qlolnyw9xcgih	cmsd9hiqc000601s653sccrvr
cmrwj83nb0001lolnso7nrlqe	cmsd9hiod000201s6fw71e0g0
cmrwj84im0002lolnoa9cjgnv	cmsd9hiod000201s6fw71e0g0
cmrwj85qp0003lolnvcnfwmag	cmsd9hiod000201s6fw71e0g0
cmrwj86v40004loln7255kmxi	cmsd9hiod000201s6fw71e0g0
cmrwj87px0005lolnfu0n7wvn	cmsd9hiod000201s6fw71e0g0
cmrwj88ku0006lolnnbrsmlgc	cmsd9hiod000201s6fw71e0g0
cmrwj89fg0007lolndj8ypwye	cmsd9hiod000201s6fw71e0g0
cmrwj8b3m0008lolnhyef758p	cmsd9hiod000201s6fw71e0g0
cmrwj8c0v0009loln663y2jva	cmsd9hiod000201s6fw71e0g0
cmrwj8cvu000alolnwomd20qc	cmsd9hiod000201s6fw71e0g0
cmrwj8drg000blolnb0t56cm8	cmsd9hiod000201s6fw71e0g0
cmrwj8ewq000cloln9vqj9z69	cmsd9hiod000201s6fw71e0g0
cmrwj8g4d000dloln8u8954c5	cmsd9hiod000201s6fw71e0g0
cmrwj8h7w000eloln7vlict9c	cmsd9hiod000201s6fw71e0g0
cmrwj8i3m000flolngqscrvdl	cmsd9hiod000201s6fw71e0g0
cmrwj8j2t000gloln2jc36mhz	cmsd9hiod000201s6fw71e0g0
cmrwj8kbt000hloln5ojn12g1	cmsd9hiod000201s6fw71e0g0
cmrwj8j2t000gloln2jc36mhz	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8kbt000hloln5ojn12g1	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8ld8000ilolnp49yj66h	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8m8l000jloln5rgelj5q	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8n4c000klolngz6sxg73	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8oal000llolnu9uhhca5	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8pyk000mlolnngnjt7ua	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8rbl000nloln6qamz2o9	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8s7z000ololn4buldpvo	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8tlx000plolnaegmityw	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8wub000qlolnyw9xcgih	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8xpm000rlolnkild41kb	cmsg3mpmf001i01s6iy5pzbsu
cmrwj8yo9000sloln7m5om7ig	cmsg3mpmf001i01s6iy5pzbsu
cmrwj91qy000tlolnnredfudf	cmsg3mpmf001i01s6iy5pzbsu
cmrwj9372000uloln2e77htdq	cmsg3mpmf001i01s6iy5pzbsu
cmrwj94pq000vlolnevoeuass	cmsg3mpmf001i01s6iy5pzbsu
cmrwj95rx000wlolncifbbxsi	cmsg3mpmf001i01s6iy5pzbsu
cmrwj96ms000xloln92uifl6u	cmsg3mpmf001i01s6iy5pzbsu
cmrwj97i9000ylolnxplk5ozy	cmsg3mpmf001i01s6iy5pzbsu
cmrwj98or000zlolnlhbiud9o	cmsg3mpmf001i01s6iy5pzbsu
cmrwj99y70010loln8deexla6	cmsg3mpmf001i01s6iy5pzbsu
cmrwj82rp0000lolnrwkhijda	cmshcxly8000101s6ory43vyf
cmrwj82rp0000lolnrwkhijda	cmshcxm0b000301s60gqzf682
cmrwj82rp0000lolnrwkhijda	cmshcxm2x000501s6ehhpvwtq
cmrwj8n4c000klolngz6sxg73	cmshcxm2x000501s6ehhpvwtq
cmrwj8oal000llolnu9uhhca5	cmshcxm2x000501s6ehhpvwtq
cmrwj8s7z000ololn4buldpvo	cmshcxm2x000501s6ehhpvwtq
cmrwj8tlx000plolnaegmityw	cmshcxm2x000501s6ehhpvwtq
cmrwj82rp0000lolnrwkhijda	cmshcxm3v000701s6hzhhjfqc
cmrwj87px0005lolnfu0n7wvn	cmshcxm3v000701s6hzhhjfqc
cmrwj8oal000llolnu9uhhca5	cmshcxm3v000701s6hzhhjfqc
cmrwj8tlx000plolnaegmityw	cmshcxm3v000701s6hzhhjfqc
cmrwj83nb0001lolnso7nrlqe	cmshcxly8000101s6ory43vyf
cmrwj84im0002lolnoa9cjgnv	cmshcxly8000101s6ory43vyf
cmrwj85qp0003lolnvcnfwmag	cmshcxly8000101s6ory43vyf
cmrwj86v40004loln7255kmxi	cmshcxly8000101s6ory43vyf
cmrwj87px0005lolnfu0n7wvn	cmshcxly8000101s6ory43vyf
cmrwj88ku0006lolnnbrsmlgc	cmshcxly8000101s6ory43vyf
cmrwj89fg0007lolndj8ypwye	cmshcxly8000101s6ory43vyf
cmrwj8b3m0008lolnhyef758p	cmshcxly8000101s6ory43vyf
cmrwj8c0v0009loln663y2jva	cmshcxly8000101s6ory43vyf
cmrwj8cvu000alolnwomd20qc	cmshcxly8000101s6ory43vyf
cmrwj8drg000blolnb0t56cm8	cmshcxly8000101s6ory43vyf
cmrwj8ewq000cloln9vqj9z69	cmshcxly8000101s6ory43vyf
cmrwj8g4d000dloln8u8954c5	cmshcxly8000101s6ory43vyf
cmrwj8h7w000eloln7vlict9c	cmshcxly8000101s6ory43vyf
cmrwj8i3m000flolngqscrvdl	cmshcxly8000101s6ory43vyf
cmrwj8j2t000gloln2jc36mhz	cmshcxly8000101s6ory43vyf
cmrwj8kbt000hloln5ojn12g1	cmshcxly8000101s6ory43vyf
cmrwj8ld8000ilolnp49yj66h	cmshcxly8000101s6ory43vyf
cmrwj8m8l000jloln5rgelj5q	cmshcxly8000101s6ory43vyf
cmrwj8n4c000klolngz6sxg73	cmshcxly8000101s6ory43vyf
cmrwj8oal000llolnu9uhhca5	cmshcxly8000101s6ory43vyf
cmrwj8pyk000mlolnngnjt7ua	cmshcxly8000101s6ory43vyf
cmrwj8rbl000nloln6qamz2o9	cmshcxly8000101s6ory43vyf
cmrwj8s7z000ololn4buldpvo	cmshcxly8000101s6ory43vyf
cmrwj8tlx000plolnaegmityw	cmshcxly8000101s6ory43vyf
cmrwj8wub000qlolnyw9xcgih	cmshcxly8000101s6ory43vyf
cmrwj8xpm000rlolnkild41kb	cmshcxly8000101s6ory43vyf
cmrwj8yo9000sloln7m5om7ig	cmshcxly8000101s6ory43vyf
cmrwj91qy000tlolnnredfudf	cmshcxly8000101s6ory43vyf
cmrwj9372000uloln2e77htdq	cmshcxly8000101s6ory43vyf
cmrwj94pq000vlolnevoeuass	cmshcxly8000101s6ory43vyf
cmrwj95rx000wlolncifbbxsi	cmshcxly8000101s6ory43vyf
cmrwj96ms000xloln92uifl6u	cmshcxly8000101s6ory43vyf
cmrwj97i9000ylolnxplk5ozy	cmshcxly8000101s6ory43vyf
cmrwj98or000zlolnlhbiud9o	cmshcxly8000101s6ory43vyf
cmrwj99y70010loln8deexla6	cmshcxly8000101s6ory43vyf
cmrwj82rp0000lolnrwkhijda	cmshcxm2a000401s67ht5uc6j
cmrwj83nb0001lolnso7nrlqe	cmshcxm2a000401s67ht5uc6j
cmrwj84im0002lolnoa9cjgnv	cmshcxm2a000401s67ht5uc6j
cmrwj85qp0003lolnvcnfwmag	cmshcxm2a000401s67ht5uc6j
cmrwj86v40004loln7255kmxi	cmshcxm2a000401s67ht5uc6j
cmrwj8n4c000klolngz6sxg73	cmshcxm2a000401s67ht5uc6j
cmrwj8oal000llolnu9uhhca5	cmshcxm2a000401s67ht5uc6j
cmrwj8pyk000mlolnngnjt7ua	cmshcxm2a000401s67ht5uc6j
cmrwj8rbl000nloln6qamz2o9	cmshcxm2a000401s67ht5uc6j
cmrwj8s7z000ololn4buldpvo	cmshcxm2a000401s67ht5uc6j
cmrwj8tlx000plolnaegmityw	cmshcxm2a000401s67ht5uc6j
cmrwj98or000zlolnlhbiud9o	cmshcxm2a000401s67ht5uc6j
cmrwj82rp0000lolnrwkhijda	cmshcxm3e000601s6zqtuwvbh
cmrwj83nb0001lolnso7nrlqe	cmshcxm3e000601s6zqtuwvbh
cmrwj84im0002lolnoa9cjgnv	cmshcxm3e000601s6zqtuwvbh
cmrwj85qp0003lolnvcnfwmag	cmshcxm3e000601s6zqtuwvbh
cmrwj86v40004loln7255kmxi	cmshcxm3e000601s6zqtuwvbh
cmrwj8rbl000nloln6qamz2o9	cmshcxm3e000601s6zqtuwvbh
cmrwj98or000zlolnlhbiud9o	cmshcxm3e000601s6zqtuwvbh
cmrwj82rp0000lolnrwkhijda	cmshcxlzu000201s68xr0orvj
cmrwj83nb0001lolnso7nrlqe	cmshcxlzu000201s68xr0orvj
cmrwj84im0002lolnoa9cjgnv	cmshcxlzu000201s68xr0orvj
cmrwj85qp0003lolnvcnfwmag	cmshcxlzu000201s68xr0orvj
cmrwj86v40004loln7255kmxi	cmshcxlzu000201s68xr0orvj
cmrwj87px0005lolnfu0n7wvn	cmshcxlzu000201s68xr0orvj
cmrwj89fg0007lolndj8ypwye	cmshcxlzu000201s68xr0orvj
cmrwj8b3m0008lolnhyef758p	cmshcxlzu000201s68xr0orvj
cmrwj8c0v0009loln663y2jva	cmshcxlzu000201s68xr0orvj
cmrwj8cvu000alolnwomd20qc	cmshcxlzu000201s68xr0orvj
cmrwj8drg000blolnb0t56cm8	cmshcxlzu000201s68xr0orvj
cmrwj8ewq000cloln9vqj9z69	cmshcxlzu000201s68xr0orvj
cmrwj8g4d000dloln8u8954c5	cmshcxlzu000201s68xr0orvj
cmrwj8h7w000eloln7vlict9c	cmshcxlzu000201s68xr0orvj
cmrwj8i3m000flolngqscrvdl	cmshcxlzu000201s68xr0orvj
cmrwj8j2t000gloln2jc36mhz	cmshcxlzu000201s68xr0orvj
cmrwj8kbt000hloln5ojn12g1	cmshcxlzu000201s68xr0orvj
cmrwj8ld8000ilolnp49yj66h	cmshcxlzu000201s68xr0orvj
cmrwj8m8l000jloln5rgelj5q	cmshcxlzu000201s68xr0orvj
cmrwj8n4c000klolngz6sxg73	cmshcxlzu000201s68xr0orvj
cmrwj8oal000llolnu9uhhca5	cmshcxlzu000201s68xr0orvj
cmrwj8pyk000mlolnngnjt7ua	cmshcxlzu000201s68xr0orvj
cmrwj8rbl000nloln6qamz2o9	cmshcxlzu000201s68xr0orvj
cmrwj8s7z000ololn4buldpvo	cmshcxlzu000201s68xr0orvj
cmrwj8tlx000plolnaegmityw	cmshcxlzu000201s68xr0orvj
cmrwj8wub000qlolnyw9xcgih	cmshcxlzu000201s68xr0orvj
cmrwj8xpm000rlolnkild41kb	cmshcxlzu000201s68xr0orvj
cmrwj8yo9000sloln7m5om7ig	cmshcxlzu000201s68xr0orvj
cmrwj91qy000tlolnnredfudf	cmshcxlzu000201s68xr0orvj
cmrwj9372000uloln2e77htdq	cmshcxlzu000201s68xr0orvj
cmrwj98or000zlolnlhbiud9o	cmshcxlzu000201s68xr0orvj
cmrwj99y70010loln8deexla6	cmshcxlzu000201s68xr0orvj
\.


--
-- Data for Name: _PurchaseToTransactionTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_PurchaseToTransactionTag" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _SaleToTransactionTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_SaleToTransactionTag" ("A", "B") FROM stdin;
\.


--
-- Name: ActivationTier ActivationTier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ActivationTier"
    ADD CONSTRAINT "ActivationTier_pkey" PRIMARY KEY (id);


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BankTransaction BankTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankTransaction"
    ADD CONSTRAINT "BankTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Batch Batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_pkey" PRIMARY KEY (id);


--
-- Name: BundleItem BundleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_pkey" PRIMARY KEY (id);


--
-- Name: Business Business_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Business"
    ADD CONSTRAINT "Business_pkey" PRIMARY KEY (id);


--
-- Name: CashRegisterSession CashRegisterSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashRegisterSession"
    ADD CONSTRAINT "CashRegisterSession_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Consultation Consultation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: DebtPayment DebtPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DebtPayment"
    ADD CONSTRAINT "DebtPayment_pkey" PRIMARY KEY (id);


--
-- Name: Debt Debt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Debt"
    ADD CONSTRAINT "Debt_pkey" PRIMARY KEY (id);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: GiftCardTransaction GiftCardTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCardTransaction"
    ADD CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY (id);


--
-- Name: GiftCard GiftCard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCard"
    ADD CONSTRAINT "GiftCard_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LabTest LabTest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_pkey" PRIMARY KEY (id);


--
-- Name: LicenseVoucher LicenseVoucher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LicenseVoucher"
    ADD CONSTRAINT "LicenseVoucher_pkey" PRIMARY KEY (id);


--
-- Name: LocationStock LocationStock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LocationStock"
    ADD CONSTRAINT "LocationStock_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyCampaign LoyaltyCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyCampaign"
    ADD CONSTRAINT "LoyaltyCampaign_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTier LoyaltyTier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Patient Patient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Payroll Payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- Name: ProductBundle ProductBundle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBundle"
    ADD CONSTRAINT "ProductBundle_pkey" PRIMARY KEY (id);


--
-- Name: ProductUnit ProductUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductUnit"
    ADD CONSTRAINT "ProductUnit_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseItem PurchaseItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: PushSubscription PushSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY (id);


--
-- Name: QuoteItem QuoteItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuoteItem"
    ADD CONSTRAINT "QuoteItem_pkey" PRIMARY KEY (id);


--
-- Name: Quote Quote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quote"
    ADD CONSTRAINT "Quote_pkey" PRIMARY KEY (id);


--
-- Name: ReferralCode ReferralCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCode"
    ADD CONSTRAINT "ReferralCode_pkey" PRIMARY KEY (id);


--
-- Name: Referral Referral_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_pkey" PRIMARY KEY (id);


--
-- Name: RestaurantTable RestaurantTable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RestaurantTable"
    ADD CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SaleItem SaleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: SalesDraft SalesDraft_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesDraft"
    ADD CONSTRAINT "SalesDraft_pkey" PRIMARY KEY (id);


--
-- Name: SalesOrderItem SalesOrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderItem"
    ADD CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY (id);


--
-- Name: SalesOrderStatusHistory SalesOrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderStatusHistory"
    ADD CONSTRAINT "SalesOrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: SalesOrder SalesOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_pkey" PRIMARY KEY (id);


--
-- Name: SchoolAttendance SchoolAttendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolAttendance"
    ADD CONSTRAINT "SchoolAttendance_pkey" PRIMARY KEY (id);


--
-- Name: SchoolBookCheckout SchoolBookCheckout_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBookCheckout"
    ADD CONSTRAINT "SchoolBookCheckout_pkey" PRIMARY KEY (id);


--
-- Name: SchoolBroadcastRecipient SchoolBroadcastRecipient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBroadcastRecipient"
    ADD CONSTRAINT "SchoolBroadcastRecipient_pkey" PRIMARY KEY (id);


--
-- Name: SchoolBroadcast SchoolBroadcast_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBroadcast"
    ADD CONSTRAINT "SchoolBroadcast_pkey" PRIMARY KEY (id);


--
-- Name: SchoolCourse SchoolCourse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolCourse"
    ADD CONSTRAINT "SchoolCourse_pkey" PRIMARY KEY (id);


--
-- Name: SchoolEnrollment SchoolEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolEnrollment"
    ADD CONSTRAINT "SchoolEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: SchoolGrade SchoolGrade_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolGrade"
    ADD CONSTRAINT "SchoolGrade_pkey" PRIMARY KEY (id);


--
-- Name: SchoolHostelAllocation SchoolHostelAllocation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostelAllocation"
    ADD CONSTRAINT "SchoolHostelAllocation_pkey" PRIMARY KEY (id);


--
-- Name: SchoolHostel SchoolHostel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostel"
    ADD CONSTRAINT "SchoolHostel_pkey" PRIMARY KEY (id);


--
-- Name: SchoolInvoice SchoolInvoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolInvoice"
    ADD CONSTRAINT "SchoolInvoice_pkey" PRIMARY KEY (id);


--
-- Name: SchoolLeaveRequest SchoolLeaveRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolLeaveRequest"
    ADD CONSTRAINT "SchoolLeaveRequest_pkey" PRIMARY KEY (id);


--
-- Name: SchoolLibraryBook SchoolLibraryBook_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolLibraryBook"
    ADD CONSTRAINT "SchoolLibraryBook_pkey" PRIMARY KEY (id);


--
-- Name: SchoolPayment SchoolPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayment"
    ADD CONSTRAINT "SchoolPayment_pkey" PRIMARY KEY (id);


--
-- Name: SchoolPayslip SchoolPayslip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayslip"
    ADD CONSTRAINT "SchoolPayslip_pkey" PRIMARY KEY (id);


--
-- Name: SchoolStaff SchoolStaff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolStaff"
    ADD CONSTRAINT "SchoolStaff_pkey" PRIMARY KEY (id);


--
-- Name: SchoolStudent SchoolStudent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolStudent"
    ADD CONSTRAINT "SchoolStudent_pkey" PRIMARY KEY (id);


--
-- Name: SchoolTerm SchoolTerm_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolTerm"
    ADD CONSTRAINT "SchoolTerm_pkey" PRIMARY KEY (id);


--
-- Name: StockMovement StockMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_pkey" PRIMARY KEY (id);


--
-- Name: StockTransfer StockTransfer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: SupplierPayment SupplierPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY (id);


--
-- Name: SupplierPriceList SupplierPriceList_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPriceList"
    ADD CONSTRAINT "SupplierPriceList_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: TransactionTag TransactionTag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionTag"
    ADD CONSTRAINT "TransactionTag_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Wastage Wastage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wastage"
    ADD CONSTRAINT "Wastage_pkey" PRIMARY KEY (id);


--
-- Name: _ExpenseToTransactionTag _ExpenseToTransactionTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ExpenseToTransactionTag"
    ADD CONSTRAINT "_ExpenseToTransactionTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PermissionToRole _PermissionToRole_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PermissionToRole"
    ADD CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _PurchaseToTransactionTag _PurchaseToTransactionTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PurchaseToTransactionTag"
    ADD CONSTRAINT "_PurchaseToTransactionTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _SaleToTransactionTag _SaleToTransactionTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SaleToTransactionTag"
    ADD CONSTRAINT "_SaleToTransactionTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: Appointment_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Appointment_businessId_idx" ON public."Appointment" USING btree ("businessId");


--
-- Name: Appointment_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Appointment_doctorId_idx" ON public."Appointment" USING btree ("doctorId");


--
-- Name: Appointment_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Appointment_patientId_idx" ON public."Appointment" USING btree ("patientId");


--
-- Name: Attendance_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_businessId_idx" ON public."Attendance" USING btree ("businessId");


--
-- Name: Attendance_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Attendance_userId_idx" ON public."Attendance" USING btree ("userId");


--
-- Name: AuditLog_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_businessId_idx" ON public."AuditLog" USING btree ("businessId");


--
-- Name: BankTransaction_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BankTransaction_businessId_idx" ON public."BankTransaction" USING btree ("businessId");


--
-- Name: Batch_businessId_expiryDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Batch_businessId_expiryDate_idx" ON public."Batch" USING btree ("businessId", "expiryDate");


--
-- Name: Batch_productId_batchNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Batch_productId_batchNumber_key" ON public."Batch" USING btree ("productId", "batchNumber");


--
-- Name: BundleItem_bundleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BundleItem_bundleId_idx" ON public."BundleItem" USING btree ("bundleId");


--
-- Name: BundleItem_bundleId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BundleItem_bundleId_productId_key" ON public."BundleItem" USING btree ("bundleId", "productId");


--
-- Name: Business_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Business_slug_idx" ON public."Business" USING btree (slug);


--
-- Name: Business_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Business_slug_key" ON public."Business" USING btree (slug);


--
-- Name: CashRegisterSession_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CashRegisterSession_businessId_idx" ON public."CashRegisterSession" USING btree ("businessId");


--
-- Name: CashRegisterSession_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CashRegisterSession_userId_idx" ON public."CashRegisterSession" USING btree ("userId");


--
-- Name: Category_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Category_businessId_deletedAt_idx" ON public."Category" USING btree ("businessId", "deletedAt");


--
-- Name: Category_businessId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_businessId_name_key" ON public."Category" USING btree ("businessId", name);


--
-- Name: Consultation_appointmentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Consultation_appointmentId_key" ON public."Consultation" USING btree ("appointmentId");


--
-- Name: Consultation_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Consultation_businessId_idx" ON public."Consultation" USING btree ("businessId");


--
-- Name: Consultation_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Consultation_doctorId_idx" ON public."Consultation" USING btree ("doctorId");


--
-- Name: Consultation_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Consultation_patientId_idx" ON public."Consultation" USING btree ("patientId");


--
-- Name: Consultation_saleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Consultation_saleId_key" ON public."Consultation" USING btree ("saleId");


--
-- Name: Customer_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Customer_businessId_deletedAt_idx" ON public."Customer" USING btree ("businessId", "deletedAt");


--
-- Name: Customer_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Customer_businessId_idx" ON public."Customer" USING btree ("businessId");


--
-- Name: DebtPayment_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DebtPayment_businessId_deletedAt_idx" ON public."DebtPayment" USING btree ("businessId", "deletedAt");


--
-- Name: Debt_businessId_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Debt_businessId_customerId_idx" ON public."Debt" USING btree ("businessId", "customerId");


--
-- Name: Debt_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Debt_businessId_deletedAt_idx" ON public."Debt" USING btree ("businessId", "deletedAt");


--
-- Name: Debt_saleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Debt_saleId_key" ON public."Debt" USING btree ("saleId");


--
-- Name: Expense_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Expense_businessId_idx" ON public."Expense" USING btree ("businessId");


--
-- Name: GiftCardTransaction_giftCardId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GiftCardTransaction_giftCardId_idx" ON public."GiftCardTransaction" USING btree ("giftCardId");


--
-- Name: GiftCard_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GiftCard_businessId_idx" ON public."GiftCard" USING btree ("businessId");


--
-- Name: GiftCard_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GiftCard_code_idx" ON public."GiftCard" USING btree (code);


--
-- Name: GiftCard_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GiftCard_code_key" ON public."GiftCard" USING btree (code);


--
-- Name: InvoiceItem_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InvoiceItem_invoiceId_idx" ON public."InvoiceItem" USING btree ("invoiceId");


--
-- Name: InvoiceItem_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InvoiceItem_productId_idx" ON public."InvoiceItem" USING btree ("productId");


--
-- Name: Invoice_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_businessId_deletedAt_idx" ON public."Invoice" USING btree ("businessId", "deletedAt");


--
-- Name: Invoice_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_businessId_idx" ON public."Invoice" USING btree ("businessId");


--
-- Name: Invoice_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_customerId_idx" ON public."Invoice" USING btree ("customerId");


--
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- Name: LabTest_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LabTest_businessId_idx" ON public."LabTest" USING btree ("businessId");


--
-- Name: LabTest_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LabTest_doctorId_idx" ON public."LabTest" USING btree ("doctorId");


--
-- Name: LabTest_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LabTest_patientId_idx" ON public."LabTest" USING btree ("patientId");


--
-- Name: LabTest_saleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LabTest_saleId_key" ON public."LabTest" USING btree ("saleId");


--
-- Name: LicenseVoucher_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LicenseVoucher_code_idx" ON public."LicenseVoucher" USING btree (code);


--
-- Name: LicenseVoucher_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LicenseVoucher_code_key" ON public."LicenseVoucher" USING btree (code);


--
-- Name: LicenseVoucher_tierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LicenseVoucher_tierId_idx" ON public."LicenseVoucher" USING btree ("tierId");


--
-- Name: LocationStock_locationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LocationStock_locationId_idx" ON public."LocationStock" USING btree ("locationId");


--
-- Name: LocationStock_locationId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "LocationStock_locationId_productId_key" ON public."LocationStock" USING btree ("locationId", "productId");


--
-- Name: LocationStock_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LocationStock_productId_idx" ON public."LocationStock" USING btree ("productId");


--
-- Name: Location_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Location_businessId_idx" ON public."Location" USING btree ("businessId");


--
-- Name: Notification_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_businessId_idx" ON public."Notification" USING btree ("businessId");


--
-- Name: OrderStatusHistory_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderStatusHistory_businessId_idx" ON public."OrderStatusHistory" USING btree ("businessId");


--
-- Name: OrderStatusHistory_saleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderStatusHistory_saleId_idx" ON public."OrderStatusHistory" USING btree ("saleId");


--
-- Name: Patient_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Patient_businessId_idx" ON public."Patient" USING btree ("businessId");


--
-- Name: Payment_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payment_businessId_deletedAt_idx" ON public."Payment" USING btree ("businessId", "deletedAt");


--
-- Name: Payment_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payment_businessId_idx" ON public."Payment" USING btree ("businessId");


--
-- Name: Payroll_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payroll_businessId_idx" ON public."Payroll" USING btree ("businessId");


--
-- Name: Payroll_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payroll_userId_idx" ON public."Payroll" USING btree ("userId");


--
-- Name: Permission_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Permission_key_key" ON public."Permission" USING btree (key);


--
-- Name: Prescription_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prescription_businessId_idx" ON public."Prescription" USING btree ("businessId");


--
-- Name: Prescription_patientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prescription_patientId_idx" ON public."Prescription" USING btree ("patientId");


--
-- Name: Prescription_prescriptionNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Prescription_prescriptionNumber_key" ON public."Prescription" USING btree ("prescriptionNumber");


--
-- Name: Prescription_saleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Prescription_saleId_key" ON public."Prescription" USING btree ("saleId");


--
-- Name: ProductBundle_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductBundle_businessId_idx" ON public."ProductBundle" USING btree ("businessId");


--
-- Name: ProductUnit_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductUnit_productId_idx" ON public."ProductUnit" USING btree ("productId");


--
-- Name: Product_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_businessId_deletedAt_idx" ON public."Product" USING btree ("businessId", "deletedAt");


--
-- Name: Product_businessId_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_businessId_sku_idx" ON public."Product" USING btree ("businessId", sku);


--
-- Name: Product_isNetworkAvailable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_isNetworkAvailable_idx" ON public."Product" USING btree ("isNetworkAvailable");


--
-- Name: Promotion_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Promotion_businessId_idx" ON public."Promotion" USING btree ("businessId");


--
-- Name: Promotion_businessId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Promotion_businessId_status_idx" ON public."Promotion" USING btree ("businessId", status);


--
-- Name: PurchaseItem_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseItem_businessId_idx" ON public."PurchaseItem" USING btree ("businessId");


--
-- Name: Purchase_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_businessId_deletedAt_idx" ON public."Purchase" USING btree ("businessId", "deletedAt");


--
-- Name: Purchase_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Purchase_businessId_idx" ON public."Purchase" USING btree ("businessId");


--
-- Name: PushSubscription_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PushSubscription_businessId_idx" ON public."PushSubscription" USING btree ("businessId");


--
-- Name: PushSubscription_endpoint_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON public."PushSubscription" USING btree (endpoint);


--
-- Name: QuoteItem_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuoteItem_productId_idx" ON public."QuoteItem" USING btree ("productId");


--
-- Name: QuoteItem_quoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "QuoteItem_quoteId_idx" ON public."QuoteItem" USING btree ("quoteId");


--
-- Name: Quote_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Quote_businessId_idx" ON public."Quote" USING btree ("businessId");


--
-- Name: Quote_businessId_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Quote_businessId_reference_key" ON public."Quote" USING btree ("businessId", reference);


--
-- Name: Quote_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Quote_customerId_idx" ON public."Quote" USING btree ("customerId");


--
-- Name: ReferralCode_businessId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ReferralCode_businessId_key" ON public."ReferralCode" USING btree ("businessId");


--
-- Name: ReferralCode_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferralCode_code_idx" ON public."ReferralCode" USING btree (code);


--
-- Name: ReferralCode_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ReferralCode_code_key" ON public."ReferralCode" USING btree (code);


--
-- Name: Referral_referredBusinessId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Referral_referredBusinessId_key" ON public."Referral" USING btree ("referredBusinessId");


--
-- Name: Referral_referrerBusinessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Referral_referrerBusinessId_idx" ON public."Referral" USING btree ("referrerBusinessId");


--
-- Name: Referral_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Referral_status_idx" ON public."Referral" USING btree (status);


--
-- Name: RestaurantTable_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "RestaurantTable_businessId_deletedAt_idx" ON public."RestaurantTable" USING btree ("businessId", "deletedAt");


--
-- Name: RestaurantTable_businessId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RestaurantTable_businessId_name_key" ON public."RestaurantTable" USING btree ("businessId", name);


--
-- Name: Role_businessId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Role_businessId_name_key" ON public."Role" USING btree ("businessId", name);


--
-- Name: SaleItem_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SaleItem_businessId_idx" ON public."SaleItem" USING btree ("businessId");


--
-- Name: Sale_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Sale_businessId_deletedAt_idx" ON public."Sale" USING btree ("businessId", "deletedAt");


--
-- Name: Sale_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Sale_businessId_idx" ON public."Sale" USING btree ("businessId");


--
-- Name: Sale_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Sale_invoiceNumber_key" ON public."Sale" USING btree ("invoiceNumber");


--
-- Name: SalesDraft_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesDraft_businessId_idx" ON public."SalesDraft" USING btree ("businessId");


--
-- Name: SalesDraft_draftNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SalesDraft_draftNumber_key" ON public."SalesDraft" USING btree ("draftNumber");


--
-- Name: SalesDraft_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesDraft_userId_idx" ON public."SalesDraft" USING btree ("userId");


--
-- Name: SalesOrderItem_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrderItem_businessId_idx" ON public."SalesOrderItem" USING btree ("businessId");


--
-- Name: SalesOrderItem_salesOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON public."SalesOrderItem" USING btree ("salesOrderId");


--
-- Name: SalesOrderStatusHistory_salesOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrderStatusHistory_salesOrderId_idx" ON public."SalesOrderStatusHistory" USING btree ("salesOrderId");


--
-- Name: SalesOrder_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrder_businessId_deletedAt_idx" ON public."SalesOrder" USING btree ("businessId", "deletedAt");


--
-- Name: SalesOrder_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrder_businessId_idx" ON public."SalesOrder" USING btree ("businessId");


--
-- Name: SalesOrder_businessId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrder_businessId_status_idx" ON public."SalesOrder" USING btree ("businessId", status);


--
-- Name: SalesOrder_soNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SalesOrder_soNumber_idx" ON public."SalesOrder" USING btree ("soNumber");


--
-- Name: SalesOrder_soNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SalesOrder_soNumber_key" ON public."SalesOrder" USING btree ("soNumber");


--
-- Name: SchoolAttendance_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolAttendance_businessId_idx" ON public."SchoolAttendance" USING btree ("businessId");


--
-- Name: SchoolAttendance_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolAttendance_courseId_idx" ON public."SchoolAttendance" USING btree ("courseId");


--
-- Name: SchoolAttendance_studentId_courseId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolAttendance_studentId_courseId_date_key" ON public."SchoolAttendance" USING btree ("studentId", "courseId", date);


--
-- Name: SchoolAttendance_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolAttendance_studentId_idx" ON public."SchoolAttendance" USING btree ("studentId");


--
-- Name: SchoolBookCheckout_bookId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBookCheckout_bookId_idx" ON public."SchoolBookCheckout" USING btree ("bookId");


--
-- Name: SchoolBookCheckout_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBookCheckout_businessId_idx" ON public."SchoolBookCheckout" USING btree ("businessId");


--
-- Name: SchoolBookCheckout_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBookCheckout_studentId_idx" ON public."SchoolBookCheckout" USING btree ("studentId");


--
-- Name: SchoolBroadcastRecipient_broadcastId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBroadcastRecipient_broadcastId_idx" ON public."SchoolBroadcastRecipient" USING btree ("broadcastId");


--
-- Name: SchoolBroadcastRecipient_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBroadcastRecipient_studentId_idx" ON public."SchoolBroadcastRecipient" USING btree ("studentId");


--
-- Name: SchoolBroadcast_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolBroadcast_businessId_idx" ON public."SchoolBroadcast" USING btree ("businessId");


--
-- Name: SchoolCourse_businessId_courseCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolCourse_businessId_courseCode_key" ON public."SchoolCourse" USING btree ("businessId", "courseCode");


--
-- Name: SchoolCourse_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolCourse_businessId_idx" ON public."SchoolCourse" USING btree ("businessId");


--
-- Name: SchoolEnrollment_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolEnrollment_businessId_idx" ON public."SchoolEnrollment" USING btree ("businessId");


--
-- Name: SchoolEnrollment_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolEnrollment_courseId_idx" ON public."SchoolEnrollment" USING btree ("courseId");


--
-- Name: SchoolEnrollment_studentId_courseId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolEnrollment_studentId_courseId_key" ON public."SchoolEnrollment" USING btree ("studentId", "courseId");


--
-- Name: SchoolEnrollment_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolEnrollment_studentId_idx" ON public."SchoolEnrollment" USING btree ("studentId");


--
-- Name: SchoolGrade_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolGrade_businessId_idx" ON public."SchoolGrade" USING btree ("businessId");


--
-- Name: SchoolGrade_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolGrade_courseId_idx" ON public."SchoolGrade" USING btree ("courseId");


--
-- Name: SchoolGrade_studentId_courseId_termId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolGrade_studentId_courseId_termId_key" ON public."SchoolGrade" USING btree ("studentId", "courseId", "termId");


--
-- Name: SchoolGrade_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolGrade_studentId_idx" ON public."SchoolGrade" USING btree ("studentId");


--
-- Name: SchoolGrade_termId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolGrade_termId_idx" ON public."SchoolGrade" USING btree ("termId");


--
-- Name: SchoolHostelAllocation_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolHostelAllocation_businessId_idx" ON public."SchoolHostelAllocation" USING btree ("businessId");


--
-- Name: SchoolHostelAllocation_hostelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolHostelAllocation_hostelId_idx" ON public."SchoolHostelAllocation" USING btree ("hostelId");


--
-- Name: SchoolHostelAllocation_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolHostelAllocation_studentId_idx" ON public."SchoolHostelAllocation" USING btree ("studentId");


--
-- Name: SchoolHostel_businessId_blockName_roomNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolHostel_businessId_blockName_roomNumber_key" ON public."SchoolHostel" USING btree ("businessId", "blockName", "roomNumber");


--
-- Name: SchoolHostel_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolHostel_businessId_idx" ON public."SchoolHostel" USING btree ("businessId");


--
-- Name: SchoolInvoice_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolInvoice_businessId_idx" ON public."SchoolInvoice" USING btree ("businessId");


--
-- Name: SchoolInvoice_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolInvoice_studentId_idx" ON public."SchoolInvoice" USING btree ("studentId");


--
-- Name: SchoolLeaveRequest_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolLeaveRequest_businessId_idx" ON public."SchoolLeaveRequest" USING btree ("businessId");


--
-- Name: SchoolLeaveRequest_staffId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolLeaveRequest_staffId_idx" ON public."SchoolLeaveRequest" USING btree ("staffId");


--
-- Name: SchoolLibraryBook_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolLibraryBook_businessId_idx" ON public."SchoolLibraryBook" USING btree ("businessId");


--
-- Name: SchoolPayment_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolPayment_businessId_idx" ON public."SchoolPayment" USING btree ("businessId");


--
-- Name: SchoolPayment_courseId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolPayment_courseId_idx" ON public."SchoolPayment" USING btree ("courseId");


--
-- Name: SchoolPayment_receiptNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolPayment_receiptNumber_key" ON public."SchoolPayment" USING btree ("receiptNumber");


--
-- Name: SchoolPayment_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolPayment_studentId_idx" ON public."SchoolPayment" USING btree ("studentId");


--
-- Name: SchoolPayslip_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolPayslip_businessId_idx" ON public."SchoolPayslip" USING btree ("businessId");


--
-- Name: SchoolPayslip_staffId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolPayslip_staffId_idx" ON public."SchoolPayslip" USING btree ("staffId");


--
-- Name: SchoolStaff_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolStaff_businessId_idx" ON public."SchoolStaff" USING btree ("businessId");


--
-- Name: SchoolStudent_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolStudent_businessId_idx" ON public."SchoolStudent" USING btree ("businessId");


--
-- Name: SchoolStudent_businessId_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SchoolStudent_businessId_studentId_key" ON public."SchoolStudent" USING btree ("businessId", "studentId");


--
-- Name: SchoolTerm_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SchoolTerm_businessId_idx" ON public."SchoolTerm" USING btree ("businessId");


--
-- Name: StockMovement_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockMovement_businessId_deletedAt_idx" ON public."StockMovement" USING btree ("businessId", "deletedAt");


--
-- Name: StockMovement_businessId_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockMovement_businessId_productId_idx" ON public."StockMovement" USING btree ("businessId", "productId");


--
-- Name: StockTransfer_fromLocationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockTransfer_fromLocationId_idx" ON public."StockTransfer" USING btree ("fromLocationId");


--
-- Name: StockTransfer_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockTransfer_productId_idx" ON public."StockTransfer" USING btree ("productId");


--
-- Name: StockTransfer_toLocationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StockTransfer_toLocationId_idx" ON public."StockTransfer" USING btree ("toLocationId");


--
-- Name: SupplierPayment_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierPayment_businessId_idx" ON public."SupplierPayment" USING btree ("businessId");


--
-- Name: SupplierPayment_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierPayment_supplierId_idx" ON public."SupplierPayment" USING btree ("supplierId");


--
-- Name: SupplierPriceList_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierPriceList_businessId_idx" ON public."SupplierPriceList" USING btree ("businessId");


--
-- Name: SupplierPriceList_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierPriceList_supplierId_idx" ON public."SupplierPriceList" USING btree ("supplierId");


--
-- Name: SupplierPriceList_supplierId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SupplierPriceList_supplierId_productId_key" ON public."SupplierPriceList" USING btree ("supplierId", "productId");


--
-- Name: Supplier_businessId_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplier_businessId_deletedAt_idx" ON public."Supplier" USING btree ("businessId", "deletedAt");


--
-- Name: Supplier_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Supplier_businessId_idx" ON public."Supplier" USING btree ("businessId");


--
-- Name: TransactionTag_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TransactionTag_businessId_idx" ON public."TransactionTag" USING btree ("businessId");


--
-- Name: TransactionTag_businessId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TransactionTag_businessId_name_key" ON public."TransactionTag" USING btree ("businessId", name);


--
-- Name: User_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_businessId_idx" ON public."User" USING btree ("businessId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_roleId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_roleId_idx" ON public."User" USING btree ("roleId");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: User_verificationToken_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_verificationToken_idx" ON public."User" USING btree ("verificationToken");


--
-- Name: Wastage_businessId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Wastage_businessId_idx" ON public."Wastage" USING btree ("businessId");


--
-- Name: Wastage_businessId_reason_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Wastage_businessId_reason_idx" ON public."Wastage" USING btree ("businessId", reason);


--
-- Name: Wastage_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Wastage_productId_idx" ON public."Wastage" USING btree ("productId");


--
-- Name: _ExpenseToTransactionTag_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_ExpenseToTransactionTag_B_index" ON public."_ExpenseToTransactionTag" USING btree ("B");


--
-- Name: _PermissionToRole_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_PermissionToRole_B_index" ON public."_PermissionToRole" USING btree ("B");


--
-- Name: _PurchaseToTransactionTag_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_PurchaseToTransactionTag_B_index" ON public."_PurchaseToTransactionTag" USING btree ("B");


--
-- Name: _SaleToTransactionTag_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_SaleToTransactionTag_B_index" ON public."_SaleToTransactionTag" USING btree ("B");


--
-- Name: Appointment Appointment_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Appointment Appointment_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Appointment Appointment_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Attendance Attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BankTransaction BankTransaction_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankTransaction"
    ADD CONSTRAINT "BankTransaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Batch Batch_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Batch Batch_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Batch"
    ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BundleItem BundleItem_bundleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES public."ProductBundle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BundleItem BundleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BundleItem"
    ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Business Business_activationTierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Business"
    ADD CONSTRAINT "Business_activationTierId_fkey" FOREIGN KEY ("activationTierId") REFERENCES public."ActivationTier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Consultation Consultation_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Consultation Consultation_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Consultation Consultation_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Consultation Consultation_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Consultation Consultation_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Customer Customer_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DebtPayment DebtPayment_debtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DebtPayment"
    ADD CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES public."Debt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Debt Debt_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Debt"
    ADD CONSTRAINT "Debt_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Debt Debt_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Debt"
    ADD CONSTRAINT "Debt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Debt Debt_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Debt"
    ADD CONSTRAINT "Debt_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Expense Expense_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Expense Expense_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GiftCardTransaction GiftCardTransaction_giftCardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCardTransaction"
    ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES public."GiftCard"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GiftCard GiftCard_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GiftCard"
    ADD CONSTRAINT "GiftCard_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LabTest LabTest_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabTest LabTest_consultationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES public."Consultation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LabTest LabTest_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabTest LabTest_labTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_labTechnicianId_fkey" FOREIGN KEY ("labTechnicianId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LabTest LabTest_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabTest LabTest_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LicenseVoucher LicenseVoucher_redeemedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LicenseVoucher"
    ADD CONSTRAINT "LicenseVoucher_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LicenseVoucher LicenseVoucher_tierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LicenseVoucher"
    ADD CONSTRAINT "LicenseVoucher_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES public."ActivationTier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LocationStock LocationStock_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LocationStock"
    ADD CONSTRAINT "LocationStock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LocationStock LocationStock_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LocationStock"
    ADD CONSTRAINT "LocationStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Location Location_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LoyaltyCampaign LoyaltyCampaign_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyCampaign"
    ADD CONSTRAINT "LoyaltyCampaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LoyaltyTier LoyaltyTier_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoyaltyTier"
    ADD CONSTRAINT "LoyaltyTier_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderStatusHistory OrderStatusHistory_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderStatusHistory OrderStatusHistory_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderStatusHistory OrderStatusHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Patient Patient_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payroll Payroll_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payroll Payroll_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payroll"
    ADD CONSTRAINT "Payroll_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductBundle ProductBundle_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBundle"
    ADD CONSTRAINT "ProductBundle_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductUnit ProductUnit_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductUnit"
    ADD CONSTRAINT "ProductUnit_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Promotion Promotion_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItem PurchaseItem_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItem PurchaseItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseItem PurchaseItem_purchaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseItem"
    ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchase Purchase_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Purchase Purchase_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Purchase Purchase_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PushSubscription PushSubscription_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushSubscription"
    ADD CONSTRAINT "PushSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuoteItem QuoteItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuoteItem"
    ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuoteItem QuoteItem_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QuoteItem"
    ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public."Quote"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quote Quote_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quote"
    ADD CONSTRAINT "Quote_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quote Quote_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Quote"
    ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReferralCode ReferralCode_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralCode"
    ADD CONSTRAINT "ReferralCode_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referral Referral_referredBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referredBusinessId_fkey" FOREIGN KEY ("referredBusinessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referral Referral_referrerBusinessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Referral"
    ADD CONSTRAINT "Referral_referrerBusinessId_fkey" FOREIGN KEY ("referrerBusinessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RestaurantTable RestaurantTable_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RestaurantTable"
    ADD CONSTRAINT "RestaurantTable_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Role Role_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SaleItem SaleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SaleItem SaleItem_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sale Sale_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sale Sale_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."RestaurantTable"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Sale Sale_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesDraft SalesDraft_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesDraft"
    ADD CONSTRAINT "SalesDraft_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesDraft SalesDraft_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesDraft"
    ADD CONSTRAINT "SalesDraft_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesDraft SalesDraft_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesDraft"
    ADD CONSTRAINT "SalesDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrderItem SalesOrderItem_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderItem"
    ADD CONSTRAINT "SalesOrderItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesOrderItem SalesOrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderItem"
    ADD CONSTRAINT "SalesOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesOrderItem SalesOrderItem_salesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderItem"
    ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES public."SalesOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesOrderStatusHistory SalesOrderStatusHistory_salesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderStatusHistory"
    ADD CONSTRAINT "SalesOrderStatusHistory_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES public."SalesOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesOrderStatusHistory SalesOrderStatusHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrderStatusHistory"
    ADD CONSTRAINT "SalesOrderStatusHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrder SalesOrder_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SalesOrder SalesOrder_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesOrder SalesOrder_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SchoolAttendance SchoolAttendance_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolAttendance"
    ADD CONSTRAINT "SchoolAttendance_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolAttendance SchoolAttendance_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolAttendance"
    ADD CONSTRAINT "SchoolAttendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."SchoolCourse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolAttendance SchoolAttendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolAttendance"
    ADD CONSTRAINT "SchoolAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBookCheckout SchoolBookCheckout_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBookCheckout"
    ADD CONSTRAINT "SchoolBookCheckout_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."SchoolLibraryBook"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBookCheckout SchoolBookCheckout_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBookCheckout"
    ADD CONSTRAINT "SchoolBookCheckout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBookCheckout SchoolBookCheckout_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBookCheckout"
    ADD CONSTRAINT "SchoolBookCheckout_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBroadcastRecipient SchoolBroadcastRecipient_broadcastId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBroadcastRecipient"
    ADD CONSTRAINT "SchoolBroadcastRecipient_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES public."SchoolBroadcast"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBroadcastRecipient SchoolBroadcastRecipient_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBroadcastRecipient"
    ADD CONSTRAINT "SchoolBroadcastRecipient_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolBroadcast SchoolBroadcast_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolBroadcast"
    ADD CONSTRAINT "SchoolBroadcast_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolCourse SchoolCourse_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolCourse"
    ADD CONSTRAINT "SchoolCourse_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolEnrollment SchoolEnrollment_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolEnrollment"
    ADD CONSTRAINT "SchoolEnrollment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolEnrollment SchoolEnrollment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolEnrollment"
    ADD CONSTRAINT "SchoolEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."SchoolCourse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolEnrollment SchoolEnrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolEnrollment"
    ADD CONSTRAINT "SchoolEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolGrade SchoolGrade_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolGrade"
    ADD CONSTRAINT "SchoolGrade_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolGrade SchoolGrade_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolGrade"
    ADD CONSTRAINT "SchoolGrade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."SchoolCourse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolGrade SchoolGrade_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolGrade"
    ADD CONSTRAINT "SchoolGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolGrade SchoolGrade_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolGrade"
    ADD CONSTRAINT "SchoolGrade_termId_fkey" FOREIGN KEY ("termId") REFERENCES public."SchoolTerm"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolHostelAllocation SchoolHostelAllocation_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostelAllocation"
    ADD CONSTRAINT "SchoolHostelAllocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolHostelAllocation SchoolHostelAllocation_hostelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostelAllocation"
    ADD CONSTRAINT "SchoolHostelAllocation_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES public."SchoolHostel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolHostelAllocation SchoolHostelAllocation_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostelAllocation"
    ADD CONSTRAINT "SchoolHostelAllocation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolHostel SchoolHostel_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolHostel"
    ADD CONSTRAINT "SchoolHostel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolInvoice SchoolInvoice_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolInvoice"
    ADD CONSTRAINT "SchoolInvoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolInvoice SchoolInvoice_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolInvoice"
    ADD CONSTRAINT "SchoolInvoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolLeaveRequest SchoolLeaveRequest_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolLeaveRequest"
    ADD CONSTRAINT "SchoolLeaveRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolLeaveRequest SchoolLeaveRequest_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolLeaveRequest"
    ADD CONSTRAINT "SchoolLeaveRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."SchoolStaff"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolLibraryBook SchoolLibraryBook_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolLibraryBook"
    ADD CONSTRAINT "SchoolLibraryBook_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayment SchoolPayment_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayment"
    ADD CONSTRAINT "SchoolPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayment SchoolPayment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayment"
    ADD CONSTRAINT "SchoolPayment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."SchoolCourse"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayment SchoolPayment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayment"
    ADD CONSTRAINT "SchoolPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."SchoolInvoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayment SchoolPayment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayment"
    ADD CONSTRAINT "SchoolPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."SchoolStudent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayslip SchoolPayslip_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayslip"
    ADD CONSTRAINT "SchoolPayslip_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolPayslip SchoolPayslip_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolPayslip"
    ADD CONSTRAINT "SchoolPayslip_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public."SchoolStaff"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolStaff SchoolStaff_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolStaff"
    ADD CONSTRAINT "SchoolStaff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolStudent SchoolStudent_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolStudent"
    ADD CONSTRAINT "SchoolStudent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolTerm SchoolTerm_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SchoolTerm"
    ADD CONSTRAINT "SchoolTerm_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockMovement StockMovement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovement"
    ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockTransfer StockTransfer_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockTransfer StockTransfer_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockTransfer StockTransfer_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockTransfer"
    ADD CONSTRAINT "StockTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierPayment SupplierPayment_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierPayment SupplierPayment_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierPayment SupplierPayment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPayment"
    ADD CONSTRAINT "SupplierPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupplierPriceList SupplierPriceList_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPriceList"
    ADD CONSTRAINT "SupplierPriceList_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierPriceList SupplierPriceList_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPriceList"
    ADD CONSTRAINT "SupplierPriceList_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupplierPriceList SupplierPriceList_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierPriceList"
    ADD CONSTRAINT "SupplierPriceList_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Supplier Supplier_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransactionTag TransactionTag_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionTag"
    ADD CONSTRAINT "TransactionTag_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wastage Wastage_businessId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wastage"
    ADD CONSTRAINT "Wastage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES public."Business"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wastage Wastage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wastage"
    ADD CONSTRAINT "Wastage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ExpenseToTransactionTag _ExpenseToTransactionTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ExpenseToTransactionTag"
    ADD CONSTRAINT "_ExpenseToTransactionTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."Expense"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ExpenseToTransactionTag _ExpenseToTransactionTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_ExpenseToTransactionTag"
    ADD CONSTRAINT "_ExpenseToTransactionTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."TransactionTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PermissionToRole _PermissionToRole_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PermissionToRole"
    ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PermissionToRole _PermissionToRole_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PermissionToRole"
    ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PurchaseToTransactionTag _PurchaseToTransactionTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PurchaseToTransactionTag"
    ADD CONSTRAINT "_PurchaseToTransactionTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."Purchase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _PurchaseToTransactionTag _PurchaseToTransactionTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_PurchaseToTransactionTag"
    ADD CONSTRAINT "_PurchaseToTransactionTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."TransactionTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SaleToTransactionTag _SaleToTransactionTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SaleToTransactionTag"
    ADD CONSTRAINT "_SaleToTransactionTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _SaleToTransactionTag _SaleToTransactionTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_SaleToTransactionTag"
    ADD CONSTRAINT "_SaleToTransactionTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."TransactionTag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict HvDXIlbNcTkUkws9kjdL1hXLuNOmvZC50lTJd8J6NWd2Tz3xiEnxLD9NUakZVJD

