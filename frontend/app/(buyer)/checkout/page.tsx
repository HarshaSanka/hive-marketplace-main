"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, CreditCard, Smartphone, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cartStore";
import { useBuyNowStore } from "@/store/buyNowStore";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface CartItemData {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
    seller: {
      id: string;
      business_name: string;
    };
  };
  quantity: number;
  subtotal: number;
}

interface CartData {
  id: string;
  items: CartItemData[];
  total_items: number;
  total_amount: number;
}

interface ShippingAddress {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
}

const SHIPPING_COST = 50;

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh"
];

export default function CheckoutPage() {
  return (
    <AuthRequiredGuard>
      <CheckoutContent />
    </AuthRequiredGuard>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const toast = useToast();
  const { clearCart } = useCartStore();
  const { item: buyNowItem, clearItem: clearBuyNowItem } = useBuyNowStore();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card");
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  useEffect(() => {
    // Check if we're in buy now mode
    if (buyNowItem) {
      setIsBuyNowMode(true);
      // Create cart-like structure from buy now item
      setCart({
        id: "buy-now",
        items: [{
          id: "buy-now-item",
          product: {
            id: buyNowItem.productId,
            title: buyNowItem.title,
            price: buyNowItem.price,
            images: buyNowItem.images,
            stock_quantity: 999, // Not relevant for display
            seller: buyNowItem.seller,
          },
          quantity: buyNowItem.quantity,
          subtotal: buyNowItem.price * buyNowItem.quantity,
        }],
        total_items: buyNowItem.quantity,
        total_amount: buyNowItem.price * buyNowItem.quantity,
      });
      setLoading(false);
    } else {
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await api.get<CartData>("/api/cart");
      if (!data || data.items.length === 0) {
        router.push("/cart");
        return;
      }
      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const validateShipping = () => {
    const newErrors: Partial<ShippingAddress> = {};
    
    if (!shippingAddress.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!shippingAddress.address_line1.trim()) {
      newErrors.address_line1 = "Address is required";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!shippingAddress.state) {
      newErrors.state = "State is required";
    }
    if (!shippingAddress.pincode.trim() || !/^\d{6}$/.test(shippingAddress.pincode)) {
      newErrors.pincode = "Valid 6-digit pincode is required";
    }
    if (!shippingAddress.mobile.trim() || !/^\d{10}$/.test(shippingAddress.mobile)) {
      newErrors.mobile = "Valid 10-digit mobile number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToSummary = () => {
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handleContinueToPayment = () => {
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      toast.info("Processing your payment...");
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let order: { id: string };
      
      if (isBuyNowMode && buyNowItem) {
        // Buy Now order
        const orderData = {
          product_id: buyNowItem.productId,
          quantity: buyNowItem.quantity,
          shipping_address: {
            name: shippingAddress.name,
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            mobile: shippingAddress.mobile,
          },
          payment_method: paymentMethod,
        };
        
        order = await api.post<{ id: string }>("/api/orders/buy-now", orderData);
        
        // Clear buy now item
        clearBuyNowItem();
      } else {
        // Cart order
        const orderData = {
          shipping_address: {
            name: shippingAddress.name,
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            mobile: shippingAddress.mobile,
          },
          payment_method: paymentMethod,
        };
        
        order = await api.post<{ id: string }>("/api/orders", orderData);
        
        // Clear cart in store
        clearCart();
      }
      
      toast.success("Order placed successfully!");
      
      // Redirect to confirmation
      router.push(`/orders/${order.id}?confirmation=true`);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-16 ml-2" />
              {s < 3 && <Skeleton className="w-12 h-0.5 mx-4" />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-11" />
                <Skeleton className="h-11" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  const subtotal = cart.total_amount;
  const total = subtotal + SHIPPING_COST;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111827] mb-6">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-black text-white"
                  : "bg-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span
              className={`ml-2 text-sm ${
                step >= s ? "text-[#111827]" : "text-[#6B7280]"
              }`}
            >
              {s === 1 ? "Shipping" : s === 2 ? "Review" : "Payment"}
            </span>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  step > s ? "bg-black" : "bg-[#E5E7EB]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">
                Shipping Address
              </h2>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  error={errors.name}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Address Line 1"
                  value={shippingAddress.address_line1}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address_line1: e.target.value,
                    })
                  }
                  error={errors.address_line1}
                  placeholder="House/Building number, Street name"
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={shippingAddress.address_line2}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address_line2: e.target.value,
                    })
                  }
                  placeholder="Apartment, suite, unit, etc."
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    error={errors.city}
                    placeholder="City"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-1.5">
                      State
                    </label>
                    <select
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          state: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:border-black ${
                        errors.state ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-sm text-[#EF4444] mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    error={errors.pincode}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />

                  <Input
                    label="Mobile Number"
                    value={shippingAddress.mobile}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    error={errors.mobile}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>

                <Button
                  onClick={handleContinueToSummary}
                  className="w-full mt-4"
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Order Summary */}
          {step === 2 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">
                Review Your Order
              </h2>

              {/* Shipping Address Summary */}
              <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-[#111827]">
                      Shipping to:
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {shippingAddress.name}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {shippingAddress.address_line1}
                      {shippingAddress.address_line2 &&
                        `, ${shippingAddress.address_line2}`}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.pincode}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      Mobile: {shippingAddress.mobile}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-black underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-[#E5E7EB] last:border-0"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E5E7EB]">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F3F4F6]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#111827] line-clamp-1">
                        {item.product.title}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-[#111827]">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleContinueToPayment} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">
                Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 ${
                    paymentMethod === "card"
                      ? "border-black bg-[#F9FAFB]"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Credit / Debit Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 ${
                    paymentMethod === "upi"
                      ? "border-black bg-[#F9FAFB]"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="font-medium">UPI</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 ${
                    paymentMethod === "wallet"
                      ? "border-black bg-[#F9FAFB]"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <span className="font-medium">Wallet</span>
                    <p className="text-sm text-[#6B7280]">
                      Balance: {formatPrice(10000)}
                    </p>
                  </div>
                </button>
              </div>

              {/* Mock Payment Form */}
              {paymentMethod === "card" && (
                <div className="space-y-4 mb-6 p-4 bg-[#F9FAFB] rounded-lg">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry" placeholder="MM/YY" maxLength={5} />
                    <Input label="CVV" placeholder="123" maxLength={4} />
                  </div>
                  <Input label="Cardholder Name" placeholder="Name on card" />
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg">
                  <Input label="UPI ID" placeholder="yourname@upi" />
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg text-center">
                  <p className="text-[#6B7280]">
                    Amount will be deducted from your wallet balance
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                  className="flex-1"
                  disabled={processing}
                >
                  Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  isLoading={processing}
                  className="flex-1"
                >
                  {processing ? "Processing..." : `Pay ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">
                  Items ({cart.total_items})
                </span>
                <span className="text-[#111827]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Shipping</span>
                <span className="text-[#111827]">
                  {formatPrice(SHIPPING_COST)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="flex justify-between font-semibold text-base">
                <span className="text-[#111827]">Total</span>
                <span className="text-[#111827]">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] mt-4">
              Expected delivery: 7 days from order date
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
