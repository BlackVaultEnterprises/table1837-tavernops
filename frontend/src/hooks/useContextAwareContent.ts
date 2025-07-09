import { useState, useEffect } from 'react';
import { addMinutes, isWithinInterval, format } from 'date-fns';

interface TimeContext {
  isHappyHour: boolean;
  isPreShift: boolean;
  isServiceTime: boolean;
  isDayTransition: boolean;
  currentShift: 'morning' | 'afternoon' | 'evening' | 'late-night';
  suggestedContent: ContentSuggestion[];
}

interface ContentSuggestion {
  type: 'alert' | 'prompt' | 'feature';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: () => void;
}

interface ServiceHours {
  happyHour: { start: string; end: string; days: number[] };
  shifts: {
    morning: { start: string; end: string };
    afternoon: { start: string; end: string };
    evening: { start: string; end: string };
    lateNight: { start: string; end: string };
  };
}

const DEFAULT_SERVICE_HOURS: ServiceHours = {
  happyHour: {
    start: '16:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5], // Monday-Friday
  },
  shifts: {
    morning: { start: '06:00', end: '11:00' },
    afternoon: { start: '11:00', end: '16:00' },
    evening: { start: '16:00', end: '22:00' },
    lateNight: { start: '22:00', end: '02:00' },
  },
};

export const useContextAwareContent = (serviceHours = DEFAULT_SERVICE_HOURS) => {
  const [context, setContext] = useState<TimeContext>({
    isHappyHour: false,
    isPreShift: false,
    isServiceTime: false,
    isDayTransition: false,
    currentShift: 'morning',
    suggestedContent: [],
  });

  useEffect(() => {
    const updateContext = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      // Check Happy Hour
      const isHappyHour = serviceHours.happyHour.days.includes(currentDay) &&
        isTimeInRange(currentTime, serviceHours.happyHour.start, serviceHours.happyHour.end);

      // Check if approaching Happy Hour (15 minutes before)
      const happyHourApproaching = serviceHours.happyHour.days.includes(currentDay) &&
        isTimeInRange(
          currentTime,
          subtractMinutes(serviceHours.happyHour.start, 15),
          serviceHours.happyHour.start
        );

      // Determine current shift
      const currentShift = determineShift(currentTime, serviceHours.shifts);

      // Pre-shift check (30 minutes before shift changes)
      const isPreShift = isTimeBeforeShift(currentTime, serviceHours.shifts);

      // Service time (restaurant is open)
      const isServiceTime = currentHour >= 11 && currentHour < 23;

      // Day transition (last hour of service)
      const isDayTransition = currentHour >= 22 || currentHour < 2;

      // Generate content suggestions
      const suggestedContent = generateContentSuggestions({
        isHappyHour,
        happyHourApproaching,
        isPreShift,
        isServiceTime,
        isDayTransition,
        currentShift,
        currentTime,
      });

      setContext({
        isHappyHour,
        isPreShift,
        isServiceTime,
        isDayTransition,
        currentShift,
        suggestedContent,
      });
    };

    updateContext();
    const interval = setInterval(updateContext, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [serviceHours]);

  return context;
};

function isTimeInRange(current: string, start: string, end: string): boolean {
  const [currentHour, currentMin] = current.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function subtractMinutes(time: string, minutes: number): string {
  const [hour, min] = time.split(':').map(Number);
  const totalMinutes = hour * 60 + min - minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMin = totalMinutes % 60;
  return `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
}

function determineShift(
  currentTime: string,
  shifts: ServiceHours['shifts']
): TimeContext['currentShift'] {
  if (isTimeInRange(currentTime, shifts.morning.start, shifts.morning.end)) {
    return 'morning';
  } else if (isTimeInRange(currentTime, shifts.afternoon.start, shifts.afternoon.end)) {
    return 'afternoon';
  } else if (isTimeInRange(currentTime, shifts.evening.start, shifts.evening.end)) {
    return 'evening';
  } else {
    return 'late-night';
  }
}

function isTimeBeforeShift(currentTime: string, shifts: ServiceHours['shifts']): boolean {
  const shiftStarts = [
    shifts.morning.start,
    shifts.afternoon.start,
    shifts.evening.start,
    shifts.lateNight.start,
  ];

  return shiftStarts.some(shiftStart => 
    isTimeInRange(currentTime, subtractMinutes(shiftStart, 30), shiftStart)
  );
}

function generateContentSuggestions(context: {
  isHappyHour: boolean;
  happyHourApproaching: boolean;
  isPreShift: boolean;
  isServiceTime: boolean;
  isDayTransition: boolean;
  currentShift: string;
  currentTime: string;
}): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];

  // Happy Hour suggestions
  if (context.happyHourApproaching) {
    suggestions.push({
      type: 'alert',
      priority: 'high',
      title: 'Happy Hour Starting Soon',
      description: 'Happy Hour begins in 15 minutes. Prepare specials and update displays.',
    });
  }

  if (context.isHappyHour) {
    suggestions.push({
      type: 'feature',
      priority: 'high',
      title: 'Happy Hour Active',
      description: 'Show Happy Hour specials prominently',
    });
  }

  // Pre-shift suggestions
  if (context.isPreShift) {
    suggestions.push({
      type: 'prompt',
      priority: 'medium',
      title: 'Shift Change Approaching',
      description: 'Review shift notes and update 86 list',
    });
  }

  // Day transition
  if (context.isDayTransition) {
    suggestions.push({
      type: 'prompt',
      priority: 'low',
      title: 'Closing Tasks',
      description: 'Display closing checklist and inventory counts',
    });
  }

  return suggestions;
}