import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, Star } from 'lucide-react';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    // Generate consistent star rating from product id
    const rating = ((product.id % 5) * 0.4 + 3.6).toFixed(1);
    const reviews = (product.id * 7 % 80 + 20);

    return (
        <div className="glass glass-hover group flex flex-col h-full overflow-hidden animate-fade-in">
            {/* Image */}
            <Link to={`/products/${product.id}`} className="block relative overflow-hidden h-52">
                <img
                    src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                    <span className="badge-violet text-[10px] capitalize">{product.category}</span>
                </div>

                {/* Quick view on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="flex items-center gap-2 glass-sm px-4 py-2 text-sm font-medium text-white">
                        <Eye className="w-4 h-4" /> Quick View
                    </span>
                </div>

                {/* Stock indicator */}
                {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="badge-red">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <Link to={`/products/${product.id}`}>
                    <h3 className="font-display font-semibold text-white hover:text-violet-300 transition-colors line-clamp-1 mb-1 text-base">
                        {product.name}
                    </h3>
                </Link>

                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(parseFloat(rating)) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                            />
                        ))}
                    </div>
                    <span className="text-white/40 text-xs">({reviews})</span>
                </div>

                <div className="mt-auto">
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold gradient-text">${product.price.toFixed(2)}</span>
                        <span className="text-white/30 line-through text-sm">${(product.price * 1.25).toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock_quantity === 0}
                        className="btn-primary w-full justify-center text-sm !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
