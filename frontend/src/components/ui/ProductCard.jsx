import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useWishlistStore from '../../store/useWishlistStore';
import StarRating from './StarRating';
import Badge from './Badge';
import Button from './Button';
import toast from 'react-hot-toast';

const ProductCard = ({ product, layout = 'grid' }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const removeFromWishlist = useWishlistStore((state) => state.removeItem);
  const wishlisted = useWishlistStore((state) => state.items.some((item) => (item.productId || item.id) === product.id));

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      className={`${layout === 'list' ? 'flex flex-row' : ''} bg-white rounded-xl border border-gold/20 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden`}
      onClick={handleCardClick}
    >
      {/* Image Area */}
      <div className={`${layout === 'list' ? 'h-auto min-h-[200px] w-[200px] shrink-0' : 'h-[240px] w-full'} relative bg-sage overflow-hidden`}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Organic Badge */}
        {product.isOrganic && (
          <div className="absolute top-3 left-3">
            <Badge variant="organic">Organic</Badge>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-12 left-3">
            <Badge variant="sale">{product.discount}% OFF</Badge>
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-md transition-all duration-200 hover:scale-110 active:scale-90 z-10 flex items-center justify-center group"
        >
          {wishlisted ? (
            <FaHeart className="text-red-500 fill-red-500 text-lg transition-transform animate-scale" />
          ) : (
            <FaRegHeart className="text-forest/70 group-hover:text-red-500 text-lg transition-colors" />
          )}
        </button>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-forest/60 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-pill font-semibold text-forest">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={`${layout === 'list' ? 'flex flex-1 flex-col justify-center' : ''} p-4 space-y-3`}>
        {/* Product Name */}
        <h3 className="font-display text-xl text-forest font-semibold line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-forest/70 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating !== undefined && (
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl text-gold font-semibold">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <>
              <span className="font-mono text-sm text-forest/50 line-through">
                ₹{product.originalPrice}
              </span>
              {product.discount && (
                <span className="text-xs font-semibold text-green-600">
                  {product.discount}% off
                </span>
              )}
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
