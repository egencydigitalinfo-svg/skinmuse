"use client";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart(); // ✅ hook used at top level
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      // ✅ Check if we came from "add-to-cart"
      if (location.state?.from === "add-to-cart" && location.state?.product) {
        const {
          product,
          selectedColor,
          selectedSize,
          quantity = 1,
        } = location.state;

        // ✅ Make sure color/size are included
       
        toast.success(
          `${product.name}${selectedColor ? ` (${selectedColor}` : ""}${
            selectedSize ? `, ${selectedSize})` : selectedColor ? ")" : ""
          } added to cart`
        );

        navigate("/cart", { replace: true });
        return; // stop further navigation
      }

     if (location.state?.from === "/checkout") {
  const savedCheckout = localStorage.getItem("pendingCheckout");

  if (savedCheckout) {
    try {
      const parsed = JSON.parse(savedCheckout);


      localStorage.removeItem("pendingCheckout");
    } catch (err) {
      console.error("Failed to parse saved checkout:", err);
    }
  }

  navigate("/checkout", { replace: true });
  return;
}


      // check all localStorage keys
      const storedUser = localStorage.getItem("skinmuse_user");
      const storedAdmin = localStorage.getItem("skinmuse_admin_user");
      const storedSuperAdmin = localStorage.getItem(
        "skinmuse_superadmin_user"
      );

      if (storedSuperAdmin) {
        // superadmin has the highest priority
        navigate("/admin", { replace: true });
      } else if (storedAdmin) {
        // then admin
        navigate("/admin", { replace: true });
      } else if (storedUser) {
        // normal user goes back to profile or previous page
        navigate("/profile", { replace: true });
      } else {
        // fallback if nothing found
        navigate("/", { replace: true });
      }
    } else {
      // ❌ wrong email or password
      setError(result.error || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute bg-foreground text-background hover:bg-foreground right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                   <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              state={{
                from: location.state?.from || "/login",
                product: location.state?.product,
              }}
              className="text-foreground hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
