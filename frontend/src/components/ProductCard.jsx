import { toast } from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const { addToCart } = useCartStore();

    const handleAddToCart = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        addToCart(product);
    };

    return (
        <div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
            <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
                <img
                    src={product?.image}
                    alt={product?.name}
                    className="h-full w-full object-cover"
                />
                {product.countInStock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-semibold">
                        Out of countInStock
                    </div>
                )}
            </div>

            <div className='mt-4 px-5 pb-5'>
                <h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
                <div className='mt-2 mb-2 flex items-center justify-between'>
                    <p>
                        <span className='text-3xl font-bold text-emerald-400'>₹{product.price}</span>
                    </p>
                </div>
                <p className="mb-3 text-sm text-gray-300">
                    {product.countInStock > 0 ? `${product.countInStock} in Stock` : "Out of Stock"}
                </p>
                <button
                    className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
                     text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50'
                    onClick={handleAddToCart}
                    disabled={product.countInStock <= 0}
                >
                    <ShoppingCart size={22} className='mr-2' />
                    Add to cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
