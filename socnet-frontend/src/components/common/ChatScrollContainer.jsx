import { useRef, useEffect } from 'react';

export default function ChatScrollContainer({
    children,
    messagesLength,
    isLoadingMore,
    isLoadingInitial,
    hasMore,
    onLoadMore,
    className
}) {
    const scrollRef = useRef(null);
    const prevMessagesLength = useRef(0);
    const prevScrollHeight = useRef(0);

    // зберігаємо висоту ДО того як підвантажаться старі повідомлення
    useEffect(() => {
        if (isLoadingMore && scrollRef.current) {
            prevScrollHeight.current = scrollRef.current.scrollHeight;
        }
    }, [isLoadingMore]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        if (messagesLength > prevMessagesLength.current) {
            const diff = messagesLength - prevMessagesLength.current;

            if (prevMessagesLength.current === 0) {
                // перше завантаження чату -> моментально вниз
                el.scrollTop = el.scrollHeight;
            } else if (diff > 1 && prevScrollHeight.current > 0) {
                // підвантажилась історія -> залишаємось на тому ж повідомленні
                el.scrollTop = el.scrollHeight - prevScrollHeight.current;
            } else {
                // прийшло НОВЕ повідомлення -> плавно скролимо вниз
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }
        }
        prevMessagesLength.current = messagesLength;
    }, [messagesLength]);

    const handleScroll = (e) => {
        // якщо доскролили майже до верху (< 50px) - вантажимо ще
        if (e.target.scrollTop < 50 && hasMore && !isLoadingMore && !isLoadingInitial) {
            onLoadMore();
        }
    };

    return (
        <div className={className} ref={scrollRef} onScroll={handleScroll}>
            {isLoadingMore && <div className="socnet-chat-loader-top">Завантаження...</div>}
            {children}
        </div>
    );
}