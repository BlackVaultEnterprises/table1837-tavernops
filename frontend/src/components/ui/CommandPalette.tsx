import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';

interface Command {
  id: string;
  label: string;
  category: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  userRole 
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { results, search: performSearch } = useFuzzySearch();

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Home',
      category: 'Navigation',
      icon: '🏠',
      action: () => navigate('/'),
    },
    {
      id: 'nav-cocktails',
      label: 'View Cocktails',
      category: 'Navigation',
      icon: '🍸',
      action: () => navigate('/cocktails'),
    },
    {
      id: 'nav-wine',
      label: 'View Wine List',
      category: 'Navigation',
      icon: '🍷',
      action: () => navigate('/wine'),
    },
    {
      id: 'nav-86',
      label: 'View 86 List',
      category: 'Navigation',
      icon: '⛔',
      shortcut: 'Cmd+8',
      action: () => navigate('/86-list'),
    },
    
    // Quick Actions
    {
      id: 'add-86',
      label: 'Add Item to 86 List',
      category: 'Quick Actions',
      icon: '➕',
      keywords: ['out', 'unavailable', 'finished'],
      action: () => {
        navigate('/86-list');
        setTimeout(() => {
          document.querySelector('.add-button')?.click();
        }, 100);
      },
    },
    
    // Admin Actions (role-based)
    ...(userRole === 'Manager' || userRole === 'Owner' ? [
      {
        id: 'add-cocktail',
        label: 'Add New Cocktail',
        category: 'Admin',
        icon: '🍹',
        action: () => navigate('/admin/cocktails/new'),
      },
      {
        id: 'add-wine',
        label: 'Add New Wine',
        category: 'Admin',
        icon: '🍾',
        action: () => navigate('/admin/wine/new'),
      },
      {
        id: 'edit-happy-hour',
        label: 'Edit Happy Hour Specials',
        category: 'Admin',
        icon: '🎉',
        action: () => navigate('/admin/happy-hour'),
      },
      {
        id: 'view-costs',
        label: 'View Pour Costs',
        category: 'Admin',
        icon: '💰',
        shortcut: 'Cmd+$',
        action: () => navigate('/admin/costs'),
      },
      {
        id: 'schedule-content',
        label: 'Schedule Content',
        category: 'Admin',
        icon: '📅',
        action: () => navigate('/admin/schedule'),
      },
    ] : []),
    
    // Search Commands
    {
      id: 'search-cocktail',
      label: 'Search Cocktails...',
      category: 'Search',
      icon: '🔍',
      action: () => {
        onClose();
        setTimeout(() => {
          document.querySelector('.main-search')?.focus();
        }, 100);
      },
    },
    
    // System Commands
    {
      id: 'toggle-dark',
      label: 'Toggle Dark Mode',
      category: 'System',
      icon: '🌙',
      action: () => document.body.classList.toggle('light-mode'),
    },
    {
      id: 'print-menu',
      label: 'Print Current Menu',
      category: 'System',
      icon: '🖨️',
      shortcut: 'Cmd+P',
      action: () => window.print(),
    },
  ] as Command[];

  const filteredCommands = search
    ? commands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return cmd.label.toLowerCase().includes(searchLower) ||
               cmd.category.toLowerCase().includes(searchLower) ||
               cmd.keywords?.some(k => k.toLowerCase().includes(searchLower));
      })
    : commands;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const executeCommand = useCallback((command: Command) => {
    command.action();
    onClose();
    setSearch('');
    setSelectedIndex(0);
  }, [onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % filteredCommands.length);
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, executeCommand, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="command-palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="command-palette-header">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="command-palette-input"
              />
            </div>
            
            <div className="command-palette-results">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="command-category">
                  <div className="category-label">{category}</div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <motion.button
                        key={cmd.id}
                        className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                        onClick={() => executeCommand(cmd)}
                        whileHover={{ x: 4 }}
                      >
                        <span className="command-icon">{cmd.icon}</span>
                        <span className="command-label">{cmd.label}</span>
                        {cmd.shortcut && (
                          <span className="command-shortcut">{cmd.shortcut}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};