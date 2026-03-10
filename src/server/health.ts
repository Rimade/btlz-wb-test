import http from "node:http";
import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

const PORT = env.APP_PORT ?? 5000;

/**
 * Проверка доступности БД для health-check.
 */
async function checkDb(): Promise<boolean> {
    try {
        await knex.raw("select 1");
        return true;
    } catch {
        return false;
    }
}

/**
 * Запуск минимального HTTP-сервера для проверки работоспособности приложения.
 * GET /health — возвращает 200 при успешной проверке БД, иначе 503.
 */
export function startHealthServer(): void {
    const server = http.createServer(async (req, res) => {
        if (req.method === "GET" && (req.url === "/health" || req.url === "/")) {
            const ok = await checkDb();
            res.writeHead(ok ? 200 : 503, { "Content-Type": "text/plain" });
            res.end(ok ? "ok" : "unhealthy");
            return;
        }
        res.writeHead(404);
        res.end();
    });

    server.listen(PORT, () => {
        console.log(`[${new Date().toISOString()}] Health server listening on port ${PORT}`);
    });
}
