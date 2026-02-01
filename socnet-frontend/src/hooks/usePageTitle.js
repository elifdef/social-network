import { useEffect } from "react";
import { APP_NAME } from "../config"

export const usePageTitle = (title) => {
    useEffect(() => {
        const prevTitle = document.title; // попередній заголовок
        document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
        return () => {
            document.title = prevTitle;
        };
    }, [title]);
};