import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { add } from "date-fns";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [method, setMethod] = useState("jazzcash");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [minOrder, setMinOrder] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [placeOrder, setPlaceOrder] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [phoneError, setPhoneError] = useState("");


  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    state: "",
    additionalNotes: "",
    jazzcashName: "",
    jazzcashNumber: "",
    jazzcashScreenshot: null,
    easypaisaName: "",
    easypaisaNumber: "",
    easypaisaScreenshot: null,
  });

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items, navigate]);

  // Fetch minimum order value
  useEffect(() => {
    const fetchMinOrder = async () => {
      try {
        const res = await fetch("https://skinmusebackend-delta.vercel.app/api/minorder");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setMinOrder(data[0].price);
      } catch (error) {
        console.error("Failed to fetch min order", error);
      }
    };
    fetchMinOrder();

  }, []);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await fetch("https://skinmusebackend-delta.vercel.app/api/shipping");
        const data = await res.json();

        if (data && data.shippingPrice != null) {
          // Ensure it's a number
          const price = Number(data.shippingPrice);
          setShippingPrice(price);
          console.log("Shipping Price:", price);
        } else {
          console.warn("Shipping price not found in response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch shipping", err);
      }
    };

    fetchShipping();
  }, []);


  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return toast.error("Please enter a promo code");

    try {
      setLoading(true);
      const res = await fetch(`https://skinmusebackend-delta.vercel.app/api/promocodes/verify/${promoCode}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid promo code");

      // Check expiry (frontend-side extra validation)
      const now = new Date();
      if (data.expiryDate && new Date(data.expiryDate) < now) {
        return toast.error("This promo code has expired");
      }

      setDiscount(data.discountPercentage);
      toast.success(`Promo applied! You got ${data.discountPercentage}% off`);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify promo code");
    } finally {
      setLoading(false)
    }
  };


  // Final total after discount
  const finalTotal = discount ? totalPrice - (totalPrice * discount) / 100 : totalPrice;
  // Shipping Logic
  const shippingCost =
    minOrder && finalTotal < minOrder ? shippingPrice : 0;

  // Final Payable Amount (total + shipping)
  const payableAmount = finalTotal + shippingCost;


  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }



    // 🧩 Check if non-COD requires screenshot
    if (method !== "cod") {
      const requiredScreenshot =
        method === "jazzcash"
          ? formData.jazzcashScreenshot
          : formData.easypaisaScreenshot;

      if (!requiredScreenshot) {
        toast.error(`Please upload ${method} payment screenshot`);
        return;
      }
    }

    try {
      setPlaceOrder(true);

      // 🧾 Use FormData instead of JSON
      const form = new FormData();

      // Add all text-based fields
      form.append("email", formData.email);
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("address", formData.address);
      form.append("city", formData.city);
      form.append("zipCode", formData.zipCode);
      form.append("method", method);
      form.append("province", formData.state);
      form.append("additionalNotes", formData.additionalNotes || "");
      form.append("phone", formData.phone);
      form.append("totalPrice", finalTotal.toString());
      form.append("promoCode", promoCode || "");
      form.append("discount", discount.toString());

      // Add items array as JSON string
      form.append(
        "items",
        JSON.stringify(
          items.map((i) => {
            const discountedPrice = i.product.discount
              ? i.product.price - (i.product.price * i.product.discount) / 100
              : i.product.price;

            return {
              productId: i.product._id,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
              selectedLitre: i.selectedLitre || null, // ✅ Add this
              price: discountedPrice,
            };
          })
        )
      );

      // 🖼 Attach payment screenshot if not COD
      if (method === "jazzcash" && formData.jazzcashScreenshot) {
        form.append("paymentScreenshot", formData.jazzcashScreenshot);
      } else if (method === "easypaisa" && formData.easypaisaScreenshot) {
        form.append("paymentScreenshot", formData.easypaisaScreenshot);
      }

      const response = await fetch("https://skinmusebackend-delta.vercel.app/api/orders", {
        method: "POST",
        body: form, // no JSON headers — browser will handle boundary
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/welcome");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setPlaceOrder(false);
    }
  };

  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch provinces on load
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states");
        const data = await res.json();

        const pakistan = data.data.find((c: any) => c.name === "Pakistan");

        if (pakistan) {
          setProvinces(pakistan.states.map((s: any) => s.name));
        }
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      }
    };

    fetchProvinces();
  }, []);

  const isValidPhone = (phone: string) => {
    return /^\+92[0-9]{10}$/.test(phone);
  };

  // Fetch cities when province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) return;

      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: "Pakistan",
            state: formData.state
          })
        });

        const data = await res.json();
        setCities(data.data || []);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    fetchCities();
  }, [formData.state]);


  return (
    <div className="min-h-screen py-16 bg-background text-foreground">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-serif font-bold mb-12 text-center">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* === Contact Info === */}
          <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-serif font-bold mb-6">Contact Information</h2>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="placeholder:text-foreground/50"
              />
            </CardContent>
          </Card>

          {/* === Shipping === */}
          <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-serif font-bold mb-6">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { id: "firstName", label: "First Name *", placeholder: "First Name" },
                  { id: "lastName", label: "Last Name *", placeholder: "Last Name" },
                  { id: "address", label: "Address *", placeholder: "Enter Your Address", span: 2 },
                  { id: "phone", label: "Phone Number *", placeholder: "Enter Your Phone Number" },
                  {
                    id: "state",
                    label: "State/Province *",
                    type: "province"
                  },
                  {
                    id: "city",
                    label: "City *",
                    type: "city"
                  },

                  { id: "zipCode", label: "ZIP Code", placeholder: "Postal Code (optional)" },
                  { id: "additionalNotes", label: "Additional Notes", placeholder: "Any additional information (optional)", span: 2, type: "textarea" },
                ].map(({ id, label, span, placeholder, type }) => (
                  <div key={id} className={span ? "md:col-span-2" : ""}>
                    <Label htmlFor={id}>{label}</Label>
                    {type === "province" ? (
                      <select
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value, city: "" })
                        }
                        className="w-full p-2 rounded-md border bg-background"
                      >
                        <option value="">Select Province</option>
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : type === "city" ? (
                      <select
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full p-2 rounded-md border bg-background"
                      >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : type === "textarea" ? (
                      <textarea
                        id={id}
                        placeholder={placeholder}
                        value={formData[id as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                        className="w-full p-2 rounded-md border bg-background placeholder:text-foreground/50"
                        rows={4}
                      />
                    ) : (
                      id === "phone" ? (
  <div>
    <Input
      id="phone"
      placeholder="+923XXXXXXXXX"
      required
      value={formData.phone}
      onChange={(e) => {
        let value = e.target.value;

        // Remove all non-digit characters except leading +
        value = value.replace(/[^\d+]/g, "");

        // Remove leading 0 if user typed it after +
        if (value.startsWith("+920")) {
          value = "+92" + value.slice(4);
        }

        // Ensure it always starts with +92
        if (!value.startsWith("+92")) {
          value = "+92" + value.replace(/^\+?/, "");
        }

        // Keep only 10 digits after +92
        const digits = value.replace("+92", "").slice(0, 10);
        value = "+92" + digits;

        setFormData({ ...formData, phone: value });

        // Validation
        if (!/^\+92\d{10}$/.test(value)) {
          setPhoneError("Phone number must be valid");
        } else {
          setPhoneError("");
        }
      }}
      className="placeholder:text-foreground/50"
    />

    {phoneError && (
      <p className="text-red-600 text-sm mt-1">{phoneError}</p>
    )}
  </div>
) : (
  <Input
    id={id}
    placeholder={placeholder}
    required={label.includes("*")}
    value={formData[id as keyof typeof formData]}
    onChange={(e) =>
      setFormData({ ...formData, [id]: e.target.value })
    }
    className="placeholder:text-foreground/50"
  />
)

                    )
                    }

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif font-bold">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Label>Select Payment Method</Label>

              <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* JazzCash */}
                <Label
                  htmlFor="jazzcash"
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center space-y-2 transition ${method === "jazzcash" ? "border-foreground bg-foreground/10" : "hover:bg-foreground/10"
                    }`}
                >
                  <RadioGroupItem value="jazzcash" id="jazzcash" className="hidden" />
                  <img src="/jazzcash-logo.png" alt="JazzCash" className="h-6 w-6" />
                  <span>JazzCash</span>
                </Label>

                {/* EasyPaisa
                <Label
                  htmlFor="easypaisa"
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center space-y-2 transition ${method === "easypaisa" ? "border-foreground bg-foreground/10" : "hover:bg-foreground/10"
                    }`}
                >
                  <RadioGroupItem value="easypaisa" id="easypaisa" className="hidden" />
                  <img src="/easypaisa-logo.png" alt="EasyPaisa" className="h-6 w-6" />
                  <span>EasyPaisa</span>
                </Label> */}

                {/* Cash on Delivery */}
                <Label
                  htmlFor="cod"
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center space-y-2 transition ${method === "cod" ? "border-foreground bg-foreground/10" : "hover:bg-foreground/10"
                    }`}
                >
                  <RadioGroupItem value="cod" id="cod" className="hidden" />
                  <Banknote className="h-6 w-6" />
                  <span>Cash on Delivery</span>
                </Label>
              </RadioGroup>

              {/* === JazzCash Info === */}
              {method === "jazzcash" && (
                <div className="space-y-5 animate-fadeIn">
                  <p className="text-sm text-muted-foreground">
                    Please send payment to the official <strong>JazzCash account</strong> below, then upload your payment screenshot as proof.
                  </p>

                  <div className="bg-muted/40 rounded-lg">
                    <p><strong>Account Holder:</strong> Muhammad Yasir Uddin</p>
                    <p><strong>Account Number:</strong> 0301-7171369</p>
                  </div>

                  <p className="text-primary">Upload Payment Screenshot *</p>
                  <Input
                    id="jazzcashScreenshot"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFormData({ ...formData, jazzcashScreenshot: e.target.files?.[0] })}
                    className="placeholder:text-foreground/50"
                  />

                  {formData.jazzcashScreenshot && (
                    <img
                      src={URL.createObjectURL(formData.jazzcashScreenshot)}
                      alt="JazzCash Payment Proof"
                      className="mt-3 w-48 h-auto rounded-md border"
                    />
                  )}
                </div>
              )}

              {/* === EasyPaisa Info === */}
              {/* {method === "easypaisa" && (
                <div className="space-y-5 animate-fadeIn">
                  <p className="text-sm text-muted-foreground">
                    Please send payment to the official <strong>EasyPaisa account</strong> below, then upload your payment screenshot as proof.
                  </p>

                  <div className="bg-muted/40 p-4 rounded-lg space-y-2">
                    <p><strong>Account Holder:</strong> SkinMuse Official</p>
                    <p><strong>Account Number:</strong> 0311-7654321</p>
                  </div>

                  <Label htmlFor="easypaisaScreenshot">Upload Payment Screenshot *</Label>
                  <Input
                    id="easypaisaScreenshot"
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setFormData({ ...formData, easypaisaScreenshot: e.target.files?.[0] })}
                  />

                  {formData.easypaisaScreenshot && (
                    <img
                      src={URL.createObjectURL(formData.easypaisaScreenshot)}
                      alt="EasyPaisa Payment Proof"
                      className="mt-3 w-48 h-auto rounded-md border"
                    />
                  )}
                </div>
              )} */}
            </CardContent>
          </Card>


          {/* === Promo Code + Order Summary === */}
          <Card className="border border-foreground/30 bg-background shadow-md rounded-2xl">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-serif font-bold">Order Summary</h2>

              <div className="flex gap-3">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="placeholder:text-foreground/50"
                />
                <Button className="bg-foreground text-background hover:bg-foreground" type="button" onClick={applyPromoCode} variant="outline">
                  {loading ? "Applying" : "Apply"}
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  // Determine base price based on selected variant
                  let variantPrice = item.product.price;

                  if (item.selectedColor && item.product.colors?.length) {
                    const colorVariant = item.product.colors.find(c => c.hex === item.selectedColor);
                    if (colorVariant?.price) variantPrice = colorVariant.price;
                  }

                  if (item.selectedLitre && item.product.litres?.length) {
                    const litreVariant = item.product.litres.find(l => l.amount.trim() === item.selectedLitre);
                    if (litreVariant?.price) variantPrice = litreVariant.price;
                  }

                  // Total for quantity
                  const originalPrice = variantPrice * item.quantity;

                  // Check discount
                  const discountPercentage = item.product.discount || 0;
                  const discountedPrice = discountPercentage > 0
                    ? variantPrice * (1 - discountPercentage / 100) * item.quantity
                    : originalPrice;

                  const hasDiscount = discountPercentage > 0;

                  return (
                    <div key={item.product._id} className="flex justify-between">
                      <span>
                        {item.product.name} × {item.quantity}
                        {item.selectedColor && (
                          <span className="ml-2 text-sm text-foreground/70">({item.selectedColor})</span>
                        )}
                        {item.selectedLitre && (
                          <span className="ml-2 text-sm text-foreground/70">({item.selectedLitre}ml)</span>
                        )}
                        {hasDiscount && (
                          <span className="ml-2 text-sm text-green-600">({discountPercentage}% off)</span>
                        )}
                      </span>
                      <span>
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              Rs {originalPrice.toFixed(0)}
                            </span>
                            <span className="text-green-600 font-medium">
                              Rs {discountedPrice.toFixed(0)}
                            </span>
                          </>
                        ) : (
                          <>Rs {originalPrice.toFixed(0)}</>
                        )}
                      </span>
                    </div>
                  );
                })}


                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `Rs ${shippingCost}`
                    )}
                  </span>
                </div>




                <div className="pt-4">
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>- Rs {(totalPrice * discount / 100).toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
                    <span>Payable Amount</span>
                    <span>Rs {payableAmount.toFixed(0)}</span>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-foreground text-background hover:bg-foreground/90 transition font-semibold py-6 rounded-xl"
          >
            {placeOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
