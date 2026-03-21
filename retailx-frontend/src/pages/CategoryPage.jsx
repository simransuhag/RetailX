import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "../Components/ui/button";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = categoryName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
   fetch(`http://localhost:5000/api/products/category/${categoryName}`)
    .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryName]);

  if (loading) {
    return <div className="pt-28 text-center">Loading...</div>;
  }

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{displayName}</h1>

      {products.length === 0 ? (
        <p className="text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.name}
              whileHover={{ y: -4 }}
              className="bg-white border rounded-2xl p-4 shadow-sm"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full object-cover rounded-xl mb-3"
              />

              <h3 className="text-sm font-semibold">{product.name}</h3>
              <p className="text-emerald-600 font-bold mt-1">
                ₹{product.price}
              </p>

              <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}