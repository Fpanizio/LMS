import type { Middleware } from '../router.ts';

export const logger: Middleware = (req, res) => {

    console.log(`[${formatDate(new Date())}] ${req.method} ${req.pathname}`);
};


function formatDate(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    }).format(date);
}