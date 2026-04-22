"""
Email Service for Hive Marketplace

Provides email notifications for:
- Welcome emails on registration (buyer/seller)
- Order confirmation (to buyer)
- New order notification (to seller)
- Shipping confirmation with tracking (to buyer)
- Out of stock alerts (to seller)

Configure SMTP settings in .env for production email delivery.
Falls back to console logging for development.
"""

import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        logger.info(
            "email_service.__init__.start",
            extra={
                "context": {
                    "smtp_configured": bool(
                        settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD
                    ),
                    "smtp_host": settings.SMTP_HOST,
                    "smtp_port": settings.SMTP_PORT,
                    "smtp_from_domain": (
                        settings.SMTP_FROM.split("@")[-1]
                        if getattr(settings, "SMTP_FROM", None) and "@" in settings.SMTP_FROM
                        else None
                    ),
                }
            },
        )
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM
        self.smtp_configured = bool(
            self.smtp_host and 
            self.smtp_user and 
            self.smtp_password
        )
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str
    ) -> bool:
        """
        Send an email via SMTP. Falls back to console logging if SMTP not configured.
        
        Args:
            to_email: Recipient email address
            subject: Email subject line
            html_content: HTML email body
            
        Returns:
            True if email sent successfully, False otherwise
        """
        logger.info(
            "email_service.send_email.start",
            extra={
                "context": {
                    "smtp_configured": self.smtp_configured,
                    "to_domain": to_email.split("@")[-1] if "@" in to_email else None,
                    "subject": subject,
                    "html_len": len(html_content) if html_content is not None else None,
                }
            },
        )
        if self.smtp_configured:
            try:
                # Create the email message
                message = MIMEMultipart("alternative")
                message["From"] = self.smtp_from
                message["To"] = to_email
                message["Subject"] = subject
                
                # Create plain text version (fallback)
                import re
                plain_text = re.sub(r'<[^>]+>', '', html_content)
                plain_text = re.sub(r'\s+', ' ', plain_text).strip()
                
                # Attach both plain text and HTML versions
                part1 = MIMEText(plain_text, "plain")
                part2 = MIMEText(html_content, "html")
                message.attach(part1)
                message.attach(part2)
                
                # Send email via SMTP
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password,
                    start_tls=True
                )
                
                logger.info(f"✓ Email sent successfully to {to_email}: {subject}")
                return True
                
            except aiosmtplib.SMTPException as e:
                logger.error(f"✗ SMTP error sending email to {to_email}: {str(e)}")
                # Log the email content for debugging
                self._log_email(to_email, subject, html_content, error=str(e))
                return False
            except Exception as e:
                logger.error(f"✗ Unexpected error sending email to {to_email}: {str(e)}")
                self._log_email(to_email, subject, html_content, error=str(e))
                return False
        else:
            # Log email for development (no SMTP configured)
            self._log_email(to_email, subject, html_content)
            return True
    
    def _log_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        error: Optional[str] = None
    ):
        """Log email content to console for development/debugging"""
        logger.info(
            "email_service._log_email.start",
            extra={
                "context": {
                    "to_domain": to_email.split("@")[-1] if "@" in to_email else None,
                    "subject": subject,
                    "html_len": len(html_content) if html_content is not None else None,
                    "has_error": bool(error),
                }
            },
        )
        logger.info("=" * 60)
        if error:
            logger.info(f"⚠ EMAIL FAILED - Error: {error}")
        else:
            logger.info("📧 EMAIL (Development Mode - SMTP not configured)")
        logger.info(f"TO: {to_email}")
        logger.info(f"FROM: {self.smtp_from}")
        logger.info(f"SUBJECT: {subject}")
        logger.info("-" * 60)
        # Show truncated content
        content_preview = html_content[:800] if len(html_content) > 800 else html_content
        logger.info(f"CONTENT:\n{content_preview}")
        if len(html_content) > 800:
            logger.info("... [truncated]")
        logger.info("=" * 60)

    def _get_base_template(self, content: str) -> str:
        """
        Returns the base HTML email template with consistent styling.
        Uses Hive's brand colors and modern design.
        """
        logger.info(
            "email_service._get_base_template.start",
            extra={"context": {"content_len": len(content) if content is not None else None}},
        )
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
                            <!-- Header -->
                            <tr>
                                <td style="text-align: center; padding-bottom: 32px;">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">
                                        🐝 Hive
                                    </h1>
                                </td>
                            </tr>
                            <!-- Main Content -->
                            <tr>
                                <td style="background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 40px 32px;">
                                                {content}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding-top: 32px; text-align: center;">
                                    <p style="margin: 0; font-size: 14px; color: #9CA3AF;">
                                        © 2025 Hive Marketplace. All rights reserved.
                                    </p>
                                    <p style="margin: 8px 0 0; font-size: 12px; color: #9CA3AF;">
                                        This is a transactional email from Hive.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    async def send_welcome_email(self, email: str, name: str, account_type: str) -> bool:
        """Send welcome email after registration"""
        logger.info(
            "email_service.send_welcome_email.start",
            extra={
                "context": {
                    "to_domain": email.split("@")[-1] if "@" in email else None,
                    "account_type": account_type,
                    "name_len": len(name) if name is not None else None,
                }
            },
        )
        subject = "Welcome to Hive! 🎉"
        
        if account_type == "seller":
            cta_text = "Start Selling"
            message = "Start listing your products and reach thousands of buyers across India!"
            next_steps = """
                <ul style="color: #6B7280; padding-left: 20px; margin: 16px 0;">
                    <li style="margin-bottom: 8px;">Upload your first product</li>
                    <li style="margin-bottom: 8px;">Set up your seller profile</li>
                    <li style="margin-bottom: 8px;">Enable notifications for new orders</li>
                </ul>
            """
        else:
            cta_text = "Start Shopping"
            message = "Discover amazing products from independent sellers and small businesses!"
            next_steps = """
                <ul style="color: #6B7280; padding-left: 20px; margin: 16px 0;">
                    <li style="margin-bottom: 8px;">Browse trending products</li>
                    <li style="margin-bottom: 8px;">Save your favorite items</li>
                    <li style="margin-bottom: 8px;">Enjoy fast checkout</li>
                </ul>
            """
        
        content = f"""
            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">
                Welcome to Hive, {name}! 👋
            </h2>
            <p style="margin: 0 0 16px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Your <strong>{account_type}</strong> account has been created successfully.
            </p>
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                {message}
            </p>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #111827;">
                    Here's what you can do next:
                </p>
                {next_steps}
            </div>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Best regards,<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(email, subject, html)

    async def send_order_confirmation(
        self, 
        buyer_email: str, 
        buyer_name: str,
        order_id: str, 
        total_amount: float,
        items: list
    ) -> bool:
        """Send order confirmation to buyer after checkout"""
        logger.info(
            "email_service.send_order_confirmation.start",
            extra={
                "context": {
                    "to_domain": buyer_email.split("@")[-1] if "@" in buyer_email else None,
                    "order_id_prefix": order_id[:8].upper() if order_id else None,
                    "total_amount": total_amount,
                    "items_count": len(items) if items is not None else None,
                    "buyer_name_len": len(buyer_name) if buyer_name is not None else None,
                }
            },
        )
        subject = f"Order Confirmed! #{order_id[:8].upper()}"
        
        items_html = "".join([
            f"""
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span style="color: #111827; font-weight: 500;">{item['title']}</span>
                    <br>
                    <span style="color: #9CA3AF; font-size: 14px;">Qty: {item['quantity']}</span>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">
                    ₹{item['subtotal']:.2f}
                </td>
            </tr>
            """
            for item in items
        ])
        
        subtotal = total_amount - 50  # Shipping is ₹50
        
        content = f"""
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #111827;">
                Order Confirmed! ✅
            </h2>
            <p style="margin: 0 0 24px; font-size: 14px; color: #6B7280;">
                Order ID: <strong style="color: #111827;">#{order_id[:8].upper()}</strong>
            </p>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Hi {buyer_name}, thank you for your order! We've received your payment and your order is being processed.
            </p>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                    Order Summary
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    {items_html}
                    <tr>
                        <td style="padding: 12px 0; color: #6B7280;">Subtotal</td>
                        <td style="padding: 12px 0; text-align: right; color: #6B7280;">₹{subtotal:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6B7280;">Shipping</td>
                        <td style="padding: 12px 0; text-align: right; color: #6B7280;">₹50.00</td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 0 0; font-size: 18px; font-weight: 600; color: #111827;">Total</td>
                        <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 600; color: #111827;">₹{total_amount:.2f}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #ECFDF5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #065F46;">
                    📦 <strong>Expected Delivery:</strong> 7 days from order date
                </p>
            </div>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                You'll receive another email when your order ships with tracking information.
            </p>
            
            <p style="margin: 24px 0 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Best regards,<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(buyer_email, subject, html)

    async def send_new_order_notification(
        self, 
        seller_email: str,
        seller_name: str,
        order_id: str,
        buyer_name: str,
        items: list
    ) -> bool:
        """Send new order notification to seller when buyer places an order"""
        logger.info(
            "email_service.send_new_order_notification.start",
            extra={
                "context": {
                    "to_domain": seller_email.split("@")[-1] if "@" in seller_email else None,
                    "order_id_prefix": order_id[:8].upper() if order_id else None,
                    "items_count": len(items) if items is not None else None,
                    "seller_name_len": len(seller_name) if seller_name is not None else None,
                    "buyer_name_len": len(buyer_name) if buyer_name is not None else None,
                }
            },
        )
        subject = f"🔔 New Order Received! #{order_id[:8].upper()}"
        
        items_html = "".join([
            f"""
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #111827;">
                    {item['title']}
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; text-align: right; color: #6B7280;">
                    Qty: {item['quantity']}
                </td>
            </tr>
            """
            for item in items
        ])
        
        content = f"""
            <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #92400E;">
                    🔔 New Order Requires Action
                </p>
            </div>
            
            <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #111827;">
                You Have a New Order!
            </h2>
            <p style="margin: 0 0 24px; font-size: 14px; color: #6B7280;">
                Order ID: <strong style="color: #111827;">#{order_id[:8].upper()}</strong>
            </p>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Hi {seller_name}, great news! <strong>{buyer_name}</strong> just placed an order for your products.
            </p>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                    Products Ordered
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    {items_html}
                </table>
            </div>
            
            <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #1E40AF;">
                    📦 <strong>Action Required:</strong> Please process and ship this order as soon as possible to ensure timely delivery.
                </p>
            </div>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Log in to your seller dashboard to view order details and mark as shipped.
            </p>
            
            <p style="margin: 24px 0 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Best regards,<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(seller_email, subject, html)

    async def send_shipping_notification(
        self, 
        buyer_email: str,
        buyer_name: str,
        order_id: str,
        tracking_number: str
    ) -> bool:
        """Send shipping notification to buyer when seller ships the order"""
        logger.info(
            "email_service.send_shipping_notification.start",
            extra={
                "context": {
                    "to_domain": buyer_email.split("@")[-1] if "@" in buyer_email else None,
                    "order_id_prefix": order_id[:8].upper() if order_id else None,
                    "tracking_last4": tracking_number[-4:] if tracking_number else None,
                    "buyer_name_len": len(buyer_name) if buyer_name is not None else None,
                }
            },
        )
        subject = f"🚚 Your Order is On Its Way! #{order_id[:8].upper()}"
        
        content = f"""
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                    Your Order Has Shipped!
                </h2>
            </div>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6; text-align: center;">
                Hi {buyer_name}, great news! Your order <strong>#{order_id[:8].upper()}</strong> is on its way to you.
            </p>
            
            <div style="background: #F9FAFB; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                    Tracking Number
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827; font-family: monospace;">
                    {tracking_number}
                </p>
            </div>
            
            <div style="background: #ECFDF5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <table role="presentation" style="width: 100%;">
                    <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 20px;">🚚</span>
                        </td>
                        <td style="vertical-align: top;">
                            <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #065F46;">
                                Expected Delivery
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #065F46;">
                                5-7 business days
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <p style="margin: 0 0 24px; font-size: 14px; color: #9CA3AF; line-height: 1.6; text-align: center;">
                You can track your package using the tracking number above.
            </p>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Best regards,<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(buyer_email, subject, html)

    async def send_out_of_stock_alert(
        self, 
        seller_email: str,
        seller_name: str,
        product_title: str,
        product_id: str
    ) -> bool:
        """Send out of stock alert to seller when a product reaches zero inventory"""
        logger.info(
            "email_service.send_out_of_stock_alert.start",
            extra={
                "context": {
                    "to_domain": seller_email.split("@")[-1] if "@" in seller_email else None,
                    "product_id": product_id,
                    "product_title_len": len(product_title) if product_title is not None else None,
                    "seller_name_len": len(seller_name) if seller_name is not None else None,
                }
            },
        )
        subject = f"⚠️ Stock Alert: {product_title} is Out of Stock"
        
        content = f"""
            <div style="background: #FEE2E2; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <table role="presentation" style="width: 100%;">
                    <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 24px;">⚠️</span>
                        </td>
                        <td style="vertical-align: top;">
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #991B1B;">
                                Stock Alert: Product Out of Stock
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111827;">
                Inventory Update Required
            </h2>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Hi {seller_name}, this is to inform you that one of your products has run out of stock.
            </p>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                    Product
                </p>
                <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                    {product_title}
                </p>
                <div style="display: inline-block; background: #FEE2E2; color: #991B1B; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500;">
                    Out of Stock
                </div>
            </div>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                To continue selling this product, please update your inventory as soon as possible. Buyers will not be able to purchase this item until stock is replenished.
            </p>
            
            <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #1E40AF;">
                    💡 <strong>Tip:</strong> Keep track of your inventory levels to avoid missing sales. Consider setting up low-stock reminders.
                </p>
            </div>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Best regards,<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(seller_email, subject, html)

    async def send_order_delivered_notification(
        self, 
        buyer_email: str,
        buyer_name: str,
        order_id: str
    ) -> bool:
        """Send delivery confirmation to buyer (optional - for future use)"""
        logger.info(
            "email_service.send_order_delivered_notification.start",
            extra={
                "context": {
                    "to_domain": buyer_email.split("@")[-1] if "@" in buyer_email else None,
                    "order_id_prefix": order_id[:8].upper() if order_id else None,
                    "buyer_name_len": len(buyer_name) if buyer_name is not None else None,
                }
            },
        )
        subject = f"✅ Your Order Has Been Delivered! #{order_id[:8].upper()}"
        
        content = f"""
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                    Order Delivered!
                </h2>
            </div>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6; text-align: center;">
                Hi {buyer_name}, your order <strong>#{order_id[:8].upper()}</strong> has been delivered!
            </p>
            
            <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 16px; color: #065F46;">
                    ✓ Successfully Delivered
                </p>
            </div>
            
            <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280; line-height: 1.6;">
                We hope you love your purchase! If you have a moment, we'd appreciate it if you could leave a review to help other buyers.
            </p>
            
            <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                Thank you for shopping with us!<br>
                <strong>The Hive Team</strong>
            </p>
        """
        
        html = self._get_base_template(content)
        return await self.send_email(buyer_email, subject, html)


# Singleton instance
email_service = EmailService()
