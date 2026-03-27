import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Cart = () => {
  const { items, removeFromCart, clearCartList, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 bg-background text-foreground flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Your Cart</h1>
        <p className="text-lg text-foreground/80 mb-8">Your cart is currently empty.</p>
        <Button
          asChild
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 transition-all"
        >
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-background text-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground text-center md:text-left">
            Shopping Cart
          </h1>
          <Button
            variant="destructive"
            className="mt-4 md:mt-0 text-background hover:bg-foreground bg-foreground"
            onClick={clearCartList}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* === Cart Items === */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <Card
                key={`${item.product._id}-${item.selectedColor || 'default'}`}
                className="p-5 bg-background border border-foreground/30 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full sm:w-28 h-28 object-cover rounded-lg shadow-sm"
                  />

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item.product._id}`}>
                        <h3 className="font-serif text-foreground font-bold text-xl mb-1 hover:text-foreground/80 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      {item.selectedColor && (
                        <p className="text-sm text-foreground/70 mb-1">
                          Color: {item.selectedColor}
                        </p>
                      )}
                      <p className="text-sm text-foreground/70 mb-2 capitalize">
                        {item.product.category}
                      </p>

                    {/* Price with discount handling */}
<div className="flex items-center gap-2">
  {(() => {
    let basePrice = item.product.price;

    // Use variant price if exists
    if (item.selectedColor && item.product.colors?.length) {
      const colorVariant = item.product.colors.find(c => c.hex === item.selectedColor);
      if (colorVariant?.price) basePrice = colorVariant.price;
    }

    if (item.selectedLitre && item.product.litres?.length) {
      const litreVariant = item.product.litres.find(l => l.amount.trim() === item.selectedLitre);
      if (litreVariant?.price) basePrice = litreVariant.price;
    }

    const discount = item.product.discount || 0;
    const discountedPrice = discount ? basePrice - (basePrice * discount) / 100 : basePrice;

    return discount ? (
      <>
        <p className="text-lg font-bold text-green-400">Rs {discountedPrice.toFixed(0)}</p>
        <p className="text-sm line-through text-primary">Rs {basePrice.toFixed(0)}</p>
      </>
    ) : (
      <p className="text-lg font-semibold text-foreground">Rs {basePrice.toFixed(0)}</p>
    );
  })()}
</div>

                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1,
                              item.selectedColor,
                              item.selectedLitre
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="border border-background bg-foreground text-background hover:bg-foreground hover:text-background"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-foreground font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1,
                              item.selectedColor,
                              item.selectedLitre
                            )
                          }
                          disabled={item.quantity >= item.stock}
                          className="border border-secondary bg-foreground text-background hover:bg-foreground hover:text-background"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFromCart(item.product._id, item.selectedColor, item.selectedLitre)
                        }
                        className="text-foreground/80 bg-background hover:text-background hover:bg-foreground transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* === Order Summary === */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-background border border-foreground/30 rounded-2xl shadow-md sticky top-24">
              <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal</span>
                  <span>Rs {totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-foreground/20 pt-4">
                  <div className="flex justify-between font-semibold text-xl text-foreground">
                    <span>Total</span>
                    <span>Rs {totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all"
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full mt-3 border border-secondary hover:bg-foreground hover:text-background"
              >
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
