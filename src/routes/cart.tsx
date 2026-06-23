import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Layout } from "../components/Layout";
import { useCart } from "../context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart ChocoLux" },
      { name: "description", content: "Review your handcrafted chocolate selections and checkout securely with ChocoLux." },
      { property: "og:title", content: "Your Cart ChocoLux" },
      { property: "og:description", content: "Review your handcrafted chocolate selections and checkout securely with ChocoLux." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://web-muse-fix.lovable.app/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://web-muse-fix.lovable.app/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const subtotal = cart.total;
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 7.99;
  const total = subtotal + shipping;

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
        {cart.items.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/shop" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold inline-block">Shop Now</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((it) => (
                <div key={it.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-contain"/> : <div className="w-full h-full flex items-center justify-center text-3xl">🍫</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it.name}</div>
                    <div className="text-sm text-muted-foreground">${it.price.toFixed(2)} each</div>
                    <div className="mt-2 inline-flex items-center glass rounded-full">
                      <button aria-label={`Decrease quantity of ${it.name}`} onClick={() => cart.setQty(it.id, it.qty - 1)} className="p-2"><Minus className="w-3 h-3" aria-hidden="true"/></button>
                      <span className="px-3 text-sm" aria-live="polite">{it.qty}</span>
                      <button aria-label={`Increase quantity of ${it.name}`} onClick={() => cart.setQty(it.id, it.qty + 1)} className="p-2"><Plus className="w-3 h-3" aria-hidden="true"/></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold gold-text">${(it.price * it.qty).toFixed(2)}</div>
                    <button aria-label={`Remove ${it.name} from cart`} onClick={() => cart.remove(it.id)} className="mt-2 text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" aria-hidden="true"/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span></div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold"><span>Total</span><span className="gold-text">${total.toFixed(2)}</span></div>
              </div>
              <button
                onClick={() => router.navigate({ to: "/checkout" })}
                className="mt-6 w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}