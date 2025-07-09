import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { GlassmorphicCard } from '../ui/GlassmorphicCard';
import { formatDistanceToNow } from 'date-fns';

type ItemCategory = 'food' | 'cocktail' | 'wine' | 'beer' | 'spirit';

interface EightySixItem {
  id: string;
  name: string;
  category: ItemCategory;
  addedBy: string;
  addedAt: Date;
  reason?: string;
  estimatedReturn?: Date;
}

interface EightySixListProps {
  userRole: string;
  userName: string;
}

interface NewItemForm {
  name: string;
  category: ItemCategory;
  reason: string;
}

/**
 * Real-time 86 list component with WebSocket updates
 * Allows staff to track unavailable items
 */
export const EightySixList: React.FC<EightySixListProps> = ({ userRole, userName }) => {
  const [items, setItems] = useState<EightySixItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({ 
    name: '', 
    category: 'food', 
    reason: '' 
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { sendMessage, lastMessage } = useWebSocket('ws://localhost:8080/ws/86-list');

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        switch (data.type) {
          case 'ITEM_ADDED':
            setItems(prev => [...prev, data.item]);
            showNotification(`${data.item.name} has been 86'd by ${data.item.addedBy}`);
            break;
          
          case 'ITEM_REMOVED':
            setItems(prev => prev.filter(item => item.id !== data.itemId));
            break;
          
          case 'FULL_SYNC':
            setItems(data.items);
            break;
        }
        
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const canEdit = ['Manager', 'Owner', 'Bartender', 'Kitchen'].includes(userRole);

  const add86Item = useCallback(() => {
    if (!newItem.name.trim()) return;

    const item: EightySixItem = {
      id: `86-${Date.now()}`,
      name: newItem.name,
      category: newItem.category,
      addedBy: userName,
      addedAt: new Date(),
      reason: newItem.reason || undefined,
    };

    sendMessage(JSON.stringify({
      type: 'ADD_ITEM',
      item,
    }));

    setNewItem({ name: '', category: 'food', reason: '' });
    setIsAddingItem(false);
  }, [newItem, userName, sendMessage]);

  const remove86Item = useCallback((itemId: string) => {
    sendMessage(JSON.stringify({
      type: 'REMOVE_ITEM',
      itemId,
      removedBy: userName,
    }));
  }, [userName, sendMessage]);

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('86 List Update', {
        body: message,
        icon: '/icon-192x192.png',
        tag: '86-update',
      });
    }
  };

  const categoryColors: Record<ItemCategory, string> = {
    food: '#e74c3c',
    cocktail: '#3498db',
    wine: '#9b59b6',
    beer: '#f39c12',
    spirit: '#1abc9c',
  };

  return (
    <GlassmorphicCard className="eighty-six-list">
      <div className="eighty-six-header">
        <h2>86 List</h2>
        <div className="header-info">
          <span className="last-update">
            Updated {formatDistanceToNow(lastUpdate)} ago
          </span>
          {canEdit && (
            <motion.button
              className="add-button"
              onClick={() => setIsAddingItem(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Add Item
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {isAddingItem && canEdit && (
          <motion.div
            className="add-item-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              autoFocus
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ 
                ...newItem, 
                category: e.target.value as ItemCategory 
              })}
            >
              <option value="food">Food</option>
              <option value="cocktail">Cocktail</option>
              <option value="wine">Wine</option>
              <option value="beer">Beer</option>
              <option value="spirit">Spirit</option>
            </select>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={newItem.reason}
              onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })}
            />
            <div className="form-actions">
              <button onClick={add86Item}>Add</button>
              <button onClick={() => setIsAddingItem(false)}>Cancel</button>
            </div>
          </motion.div>
        )}

        {items.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>All items are available! 🎉</p>
          </motion.div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="eighty-six-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                style={{
                  borderColor: categoryColors[item.category],
                }}
              >
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: categoryColors[item.category] }}
                  >
                    {item.category}
                  </span>
                </div>
                
                {item.reason && (
                  <p className="item-reason">{item.reason}</p>
                )}
                
                <div className="item-footer">
                  <span className="added-by">
                    86'd by {item.addedBy} • {formatDistanceToNow(item.addedAt)} ago
                  </span>
                  {canEdit && (
                    <motion.button
                      className="remove-button"
                      onClick={() => remove86Item(item.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✓
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </GlassmorphicCard>
  );
};