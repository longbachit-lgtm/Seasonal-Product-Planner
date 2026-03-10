import { differenceInDays, parse, setYear, isBefore, format, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { UrgencyLevel } from '@/lib/types/database';

export function getNextEventDate(eventDateStr: string): Date {
    const now = new Date();
    const currentYear = now.getFullYear();
    const [month, day] = eventDateStr.split('-').map(Number);

    let eventDate = new Date(currentYear, month - 1, day);

    if (isBefore(eventDate, now)) {
        eventDate = new Date(currentYear + 1, month - 1, day);
    }

    return eventDate;
}

export function getDaysUntilEvent(eventDateStr: string): number {
    const eventDate = getNextEventDate(eventDateStr);
    return differenceInDays(eventDate, new Date());
}

export function getReminderDate(eventDateStr: string, monthsBefore: number = 3): Date {
    const eventDate = getNextEventDate(eventDateStr);
    return addMonths(eventDate, -monthsBefore);
}

export function getDaysUntilReminder(eventDateStr: string, monthsBefore: number = 3): number {
    const reminderDate = getReminderDate(eventDateStr, monthsBefore);
    const now = new Date();
    if (isBefore(reminderDate, now)) return 0;
    return differenceInDays(reminderDate, now);
}

export function isInResearchWindow(eventDateStr: string, monthsBefore: number = 3): boolean {
    const reminderDate = getReminderDate(eventDateStr, monthsBefore);
    return isBefore(reminderDate, new Date());
}

export function getUrgencyLevel(daysUntil: number): UrgencyLevel {
    if (daysUntil < 30) return 'critical';
    if (daysUntil < 60) return 'warning';
    if (daysUntil < 90) return 'attention';
    return 'safe';
}

export function getUrgencyColor(level: UrgencyLevel): string {
    switch (level) {
        case 'critical': return '#EF4444';
        case 'warning': return '#F97316';
        case 'attention': return '#EAB308';
        case 'safe': return '#22C55E';
    }
}

export function formatEventDate(eventDateStr: string): string {
    const eventDate = getNextEventDate(eventDateStr);
    return format(eventDate, 'dd MMM yyyy', { locale: vi });
}

export function formatReminderDate(eventDateStr: string, monthsBefore: number = 3): string {
    const reminderDate = getReminderDate(eventDateStr, monthsBefore);
    return format(reminderDate, 'dd MMM yyyy', { locale: vi });
}

export function getMonthLabel(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
}
