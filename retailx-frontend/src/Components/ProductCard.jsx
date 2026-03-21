export default function ProductCard({ item }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl duration-200 cursor-pointer">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-40 object-contain mb-3"
      />

      <h3 className="font-semibold text-lg">{item.name}</h3>
      <p className="text-gray-700 font-medium mt-1">₹ {item.price}</p>

      <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 duration-200">
        Add to Cart
      </button>
    </div>
  );
}