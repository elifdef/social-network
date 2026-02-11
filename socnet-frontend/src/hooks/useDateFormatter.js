import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

const locales = {
    'ua': uk,
    'uk': uk,
    'uk-UA': uk,

    'en': enUS,
    'us': enUS,
    'gb': enUS
};

export const useDateFormatter = () => {
    const { t, i18n } = useTranslation();

    const formatDate = useCallback((dateString, options = {}) => {
        if (!dateString || dateString === t('profile.not_specified'))
            return t('profile.not_specified');

        const date = new Date(dateString);
        const locale = locales[i18n.language] || enUS;

        const config = {
            withTime: true,      // Чи показувати годину (12:30)
            useRelative: true,   // Чи писати Сьогодні / Вчора
            forceYear: false,    // Чи ЗАВЖДИ показувати рік (навіть якщо поточний)
            ...options
        };

        const timeStr = config.withTime ? format(date, 'HH:mm') : '';

        if (config.useRelative) {
            if (isToday(date))
                return t('date.today_at', { time: timeStr });

            if (isYesterday(date))
                return t('date.yesterday_at', { time: timeStr });
        }

        const isCurrentYear = date.getFullYear() === new Date().getFullYear();
        const showYear = config.forceYear || !isCurrentYear;

        const pattern = showYear ? 'd MMMM yyyy' : 'd MMMM';
        const datePart = format(date, pattern, { locale });

        if (!config.withTime)
            return datePart;

        return `${datePart} ${t('date.at')} ${timeStr}`;

    }, [t, i18n.language]);

    return formatDate;
};