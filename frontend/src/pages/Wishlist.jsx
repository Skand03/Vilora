import React, { useEffect } from 'react';
import { PageWrapper, Button, StarRating } from '../components';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useWishlistStore from '../store/useWishlistStore';
import useCartStore from '../store/useCartStore';
import toast from 'react-hot-toast';

const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const Wishlist = () => {
  const navigate = useNavigate();
  const { items, loading, fetchWishlist, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = (item) => {
    addToCart({ id: item.productId, name: item.name, price: item.price, image: item.image }, 1);
    toast.success('Added to cart');
  };

  const handleRemove = (productId) => {
    removeItem(productId);
    toast.success('Removed from wishlist');
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-cream py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-display font-semibold text-forest">My Wishlist</h1>
            <span className="text-forest/60 text-sm">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gold/20 shadow-sm">
              <FiHeart className="mx-auto text-6xl text-gold/40 mb-4" />
              <h2 className="text-2xl font-display font-semibold text-forest mb-2">Your wishlist is empty</h2>
              <p className="text-forest/60 mb-6">Explore our curated collection and save your favorite organic essentials.</p>
              <Button onClick={() => navigate('/shop')}>Explore Shop</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gold/20 overflow-hidden shadow-sm flex flex-col hover:border-gold/60 transition-all">
                  <div 
                    className="relative h-48 bg-sage cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <img 
                      src={item.image || 'https://via.placeholder.com/240'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.productId);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white hover:text-red-700 transition-colors shadow-sm"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        className="font-semibold text-forest text-sm cursor-pointer hover:text-gold transition-colors line-clamp-1"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        {item.name}
                      </h3>
                      {item.rating != null && (
                        <div className="mt-1 flex items-center">
                          <StarRating rating={item.rating} size="sm" />
                        </div>
                      )}
                      <p className="font-mono font-semibold text-forest mt-2">{money(item.price)}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gold/15 flex gap-2">
                      <Button 
                        size="sm" 
                        className="w-full text-xs flex items-center justify-center gap-1.5"
                        onClick={() => handleAddToCart(item)}
                      >
                        <FiShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Wishlist;
