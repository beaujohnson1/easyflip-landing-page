import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, DollarSign, Tag, Package, Star } from 'lucide-react';
import { supabase, type Item } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [editedItem, setEditedItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId || !authUser) return;

      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', itemId)
          .eq('user_id', authUser.id)
          .single();

        if (error) throw error;

        setItem(data);
        setEditedItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load item details.');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, authUser, navigate]);

  const handleSave = async () => {
    if (!editedItem || !itemId || !authUser) return;

    try {
      const { error } = await supabase
        .from('items')
        .update({
          title: editedItem.title,
          description: editedItem.description,
          category: editedItem.category,
          condition: editedItem.condition,
          brand: editedItem.brand,
          size: editedItem.size,
          suggested_price: editedItem.suggested_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', authUser.id);

      if (error) throw error;

      setItem(editedItem);
      setIsEditing(false);
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleContinue = () => {
    if (itemId) {
      navigate(`/preview/${itemId}`);
    }
  };

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/capture"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <img
              src={item.primary_image_url || item.images[0]}
              alt={item.title}
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* AI Confidence */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  AI Confidence: {Math.round(item.ai_confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                High confidence detection - details should be accurate
              </p>
            </div>

            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedItem?.title || ''}
                  onChange={(e) => setEditedItem(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              )}
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Price
              </label>
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={editedItem?.suggested_price || 0}
                      onChange={(e) => setEditedItem(prev => prev ? {...prev, suggested_price: parseFloat(e.target.value)} : null)}
                      className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-green-600">
                    ${item.suggested_price}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Range: ${item.price_range_min} - ${item.price_range_max}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                {isEditing ? (
                  <select
                    value={editedItem?.category || ''}
                    onChange={(e) => setEditedItem(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="home_garden">Home & Garden</option>
                    <option value="toys_games">Toys & Games</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{item.category.replace('_', ' ')}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                {isEditing ? (
                  <select
                    value={editedItem?.condition || ''}
                    onChange={(e) => setEditedItem(prev => prev ? {...prev, condition: e.target.value} : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{item.condition.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Brand & Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem?.brand || ''}
                    onChange={(e) => setEditedItem(prev => prev ? {...prev, brand: e.target.value} : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <span className="font-medium">{item.brand}</span>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem?.size || ''}
                    onChange={(e) => setEditedItem(prev => prev ? {...prev, size: e.target.value} : null)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <span className="font-medium">{item.size}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedItem?.description || ''}
                  onChange={(e) => setEditedItem(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditedItem(item);
                      setIsEditing(false);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Continue to Listing Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetails;