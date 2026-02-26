import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

export default function InfiniteScrollList({
    children,            // пости результат map
    itemsCount,          // кількість елементів
    isLoadingInitial,    // чи йде перше завантаження сторінки
    isLoadingMore,       // чи підвантажується наступна сторінка
    hasMore,             // чи є ще що вантажити
    onLoadMore,          // функція яка завантажує наступну сторінку
    error = false,       // чи є помилка
    onRetry = null,      // функція для повторної спроби
    emptyState = null,   // компонент, який показуємо якщо пусто
    endMessage = null,   // текст в самому кінці
    className = "socnet-feed-list"
}) {
    const { t } = useTranslation();
    const loaderRef = useIntersectionObserver(onLoadMore, hasMore, isLoadingMore);

    // перше завантаження
    if (isLoadingInitial) {
        return (
            <div className="socnet-feed-loading">
                {t('common.loading')}...
            </div>
        );
    }

    if (error && itemsCount === 0) {
        return (
            <div className="socnet-feed-empty">
                <h3>{t('error.connection')}</h3>
                {onRetry && (
                    <button className="socnet-btn-small" style={{ marginTop: '10px' }} onClick={onRetry}>
                        {t('common.reload_page',)}
                    </button>
                )}
            </div>
        );
    }

    // немає постів взагалі
    if (itemsCount === 0) {
        return emptyState || (
            <div className="socnet-feed-empty">
                {t('common.empty')}
            </div>
        );
    }

    // список із вічним скролом
    return (
        <div className={className}>
            {children}

            {hasMore && !error && (
                <div ref={loaderRef} style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-text-muted)' }}>
                    {isLoadingMore ? t('common.loading') + '...' : ''}
                </div>
            )}

            {!hasMore && itemsCount > 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-text-muted)', fontSize: '11px' }}>
                    {endMessage || t('wall.no_more_posts')}
                </div>
            )}

            {error && itemsCount > 0 && (
                <div style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ color: '#bd4c4c', fontSize: '12px' }}>
                        {t('error.connection')}
                    </span>
                    <br />
                    {onRetry && (
                        <button className="socnet-btn-small" style={{ marginTop: '5px' }} onClick={onRetry}>
                            {t('common.reload_page')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}