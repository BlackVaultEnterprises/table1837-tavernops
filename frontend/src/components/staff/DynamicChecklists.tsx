import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphicCard } from '../ui/GlassmorphicCard';
import { format } from 'date-fns';

interface ChecklistItem {
  id: string;
  task: string;
  category: 'cleaning' | 'prep' | 'inventory' | 'safety' | 'customer';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  dependencies?: string[]; // IDs of tasks that must be completed first
  completedBy?: string;
  completedAt?: Date;
  notes?: string;
}

interface Checklist {
  id: string;
  name: string;
  type: 'opening' | 'mid-shift' | 'closing' | 'daily' | 'weekly';
  items: ChecklistItem[];
  activeTime?: { start: string; end: string };
  lastCompleted?: Date;
  completionRate: number;
}

interface DynamicChecklistsProps {
  userRole: string;
  userName: string;
  currentShift: string;
}

export const DynamicChecklists: React.FC<DynamicChecklistsProps> = ({
  userRole,
  userName,
  currentShift,
}) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [teamProgress, setTeamProgress] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Load checklists based on current time and shift
    loadContextualChecklists();
  }, [currentShift]);

  const loadContextualChecklists = () => {
    const hour = new Date().getHours();
    
    // Example checklists - would be loaded from API
    const mockChecklists: Checklist[] = [
      {
        id: 'opening-1',
        name: 'Opening Checklist',
        type: 'opening',
        activeTime: { start: '06:00', end: '11:00' },
        completionRate: 0,
        items: [
          {
            id: 'o1',
            task: 'Unlock doors and disable alarm',
            category: 'safety',
            priority: 'high',
            estimatedTime: 2,
          },
          {
            id: 'o2',
            task: 'Turn on all equipment and check temperatures',
            category: 'safety',
            priority: 'high',
            estimatedTime: 5,
            dependencies: ['o1'],
          },
          {
            id: 'o3',
            task: 'Stock bar with ice and garnishes',
            category: 'prep',
            priority: 'high',
            estimatedTime: 15,
            dependencies: ['o2'],
          },
          {
            id: 'o4',
            task: 'Review 86 list and update specials board',
            category: 'customer',
            priority: 'medium',
            estimatedTime: 5,
          },
          {
            id: 'o5',
            task: 'Polish glassware and arrange bar tools',
            category: 'cleaning',
            priority: 'medium',
            estimatedTime: 10,
          },
        ],
      },
      {
        id: 'mid-shift-1',
        name: 'Mid-Shift Tasks',
        type: 'mid-shift',
        activeTime: { start: '14:00', end: '16:00' },
        completionRate: 0,
        items: [
          {
            id: 'm1',
            task: 'Restock garnishes and napkins',
            category: 'prep',
            priority: 'medium',
            estimatedTime: 10,
          },
          {
            id: 'm2',
            task: 'Update 86 list based on inventory',
            category: 'inventory',
            priority: 'high',
            estimatedTime: 5,
          },
          {
            id: 'm3',
            task: 'Prep Happy Hour specials station',
            category: 'prep',
            priority: 'high',
            estimatedTime: 15,
          },
        ],
      },
    ];

    // Filter based on current time
    const relevantChecklists = mockChecklists.filter(checklist => {
      if (!checklist.activeTime) return true;
      
      const [startHour] = checklist.activeTime.start.split(':').map(Number);
      const [endHour] = checklist.activeTime.end.split(':').map(Number);
      
      return hour >= startHour && hour < endHour;
    });

    setChecklists(relevantChecklists);
    if (relevantChecklists.length > 0 && !activeChecklist) {
      setActiveChecklist(relevantChecklists[0]);
    }
  };

  const toggleTaskCompletion = (checklistId: string, taskId: string) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id !== checklistId) return checklist;

      const updatedItems = checklist.items.map(item => {
        if (item.id === taskId) {
          if (item.completedBy) {
            // Uncomplete
            return { ...item, completedBy: undefined, completedAt: undefined };
          } else {
            // Complete
            return {
              ...item,
              completedBy: userName,
              completedAt: new Date(),
            };
          }
        }
        return item;
      });

      const completedCount = updatedItems.filter(item => item.completedBy).length;
      const completionRate = (completedCount / updatedItems.length) * 100;

      return {
        ...checklist,
        items: updatedItems,
        completionRate,
      };
    }));
  };

  const canCompleteTask = (task: ChecklistItem, checklist: Checklist): boolean => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    
    return task.dependencies.every(depId => {
      const depTask = checklist.items.find(item => item.id === depId);
      return depTask?.completedBy !== undefined;
    });
  };

  const getFilteredTasks = (items: ChecklistItem[]) => {
    switch (filter) {
      case 'completed':
        return items.filter(item => item.completedBy);
      case 'pending':
        return items.filter(item => !item.completedBy);
      default:
        return items;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cleaning': return '🧹';
      case 'prep': return '🔪';
      case 'inventory': return '📦';
      case 'safety': return '⚠️';
      case 'customer': return '👥';
      default: return '📋';
    }
  };

  return (
    <div className="dynamic-checklists">
      <div className="checklists-header">
        <h2>Team Checklists</h2>
        <div className="header-controls">
          <div className="filter-buttons">
            {(['all', 'pending', 'completed'] as const).map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="checklists-layout">
        <div className="checklist-tabs">
          {checklists.map(checklist => (
            <motion.button
              key={checklist.id}
              className={`checklist-tab ${activeChecklist?.id === checklist.id ? 'active' : ''}`}
              onClick={() => setActiveChecklist(checklist)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="tab-name">{checklist.name}</span>
              <div className="tab-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${checklist.completionRate}%` }}
                />
                <span className="progress-text">
                  {Math.round(checklist.completionRate)}%
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {activeChecklist && (
          <GlassmorphicCard className="checklist-content">
            <div className="checklist-info">
              <h3>{activeChecklist.name}</h3>
              <div className="checklist-meta">
                <span>Total time: {
                  activeChecklist.items.reduce((sum, item) => sum + item.estimatedTime, 0)
                } min</span>
                <span>Progress: {
                  activeChecklist.items.filter(item => item.completedBy).length
                }/{activeChecklist.items.length}</span>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="tasks-list">
                {getFilteredTasks(activeChecklist.items).map((task, index) => {
                  const canComplete = canCompleteTask(task, activeChecklist);
                  const isCompleted = !!task.completedBy;

                  return (
                    <motion.div
                      key={task.id}
                      className={`task-item ${isCompleted ? 'completed' : ''} ${!canComplete ? 'locked' : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="task-main">
                        <button
                          className="task-checkbox"
                          onClick={() => toggleTaskCompletion(activeChecklist.id, task.id)}
                          disabled={!canComplete}
                        >
                          {isCompleted && '✓'}
                        </button>
                        
                        <div className="task-content">
                          <div className="task-header">
                            <span className="task-icon">{getCategoryIcon(task.category)}</span>
                            <span className="task-name">{task.task}</span>
                            <span 
                              className="task-priority"
                              style={{ color: getPriorityColor(task.priority) }}
                            >
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.completedBy && (
                            <div className="task-completion">
                              Completed by {task.completedBy} at{' '}
                              {format(task.completedAt!, 'h:mm a')}
                            </div>
                          )}
                          
                          {!canComplete && !isCompleted && (
                            <div className="task-locked">
                              Complete required tasks first
                            </div>
                          )}
                        </div>
                        
                        <span className="task-time">{task.estimatedTime} min</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
};