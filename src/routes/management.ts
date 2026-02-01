import { Hono } from "hono";
import { scraperRegistry } from "../core/ScraperRegistry.js";
import type { ServerContext } from "../config/context.js";

const managementRouter = new Hono<ServerContext>();

// Get all scrapers info
managementRouter.get("/scrapers", (c) => {
    const scrapers = scraperRegistry.getAll();
    return c.json({
        provider: "PulsarWatch",
        status: 200,
        data: {
            scrapers: scrapers.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                status: s.status,
                version: s.version,
                baseUrl: s.baseUrl,
                features: s.features,
                endpoints: s.endpoints,
            })),
            stats: scraperRegistry.getStats(),
        },
    });
});

// Get active scrapers only
managementRouter.get("/scrapers/active", (c) => {
    const active = scraperRegistry.getActive();
    return c.json({
        provider: "PulsarWatch",
        status: 200,
        data: active.map(s => ({
            id: s.id,
            name: s.name,
            baseUrl: s.baseUrl,
            endpoints: s.endpoints,
        })),
    });
});

// Get specific scraper info
managementRouter.get("/scrapers/:id", (c) => {
    const id = c.req.param("id");
    const scraper = scraperRegistry.get(id);

    if (!scraper) {
        return c.json({
            provider: "PulsarWatch",
            status: 404,
            error: `Scraper '${id}' not found`,
        }, 404);
    }

    return c.json({
        provider: "PulsarWatch",
        status: 200,
        data: {
            id: scraper.id,
            name: scraper.name,
            description: scraper.description,
            status: scraper.status,
            version: scraper.version,
            baseUrl: scraper.baseUrl,
            features: scraper.features,
            endpoints: scraper.endpoints,
        },
    });
});

// Get system stats
managementRouter.get("/stats", (c) => {
    const stats = scraperRegistry.getStats();
    return c.json({
        provider: "PulsarWatch",
        status: 200,
        data: {
            ...stats,
            scrapers: scraperRegistry.getAll().map(s => ({
                id: s.id,
                name: s.name,
                status: s.status,
                version: s.version,
            })),
        },
    });
});

// Health check for all scrapers
managementRouter.get("/health", (c) => {
    const scrapers = scraperRegistry.getAll();
    const health = scrapers.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        healthy: s.status === "active",
    }));

    const allHealthy = health.every(h => h.healthy);

    return c.json({
        provider: "PulsarWatch",
        status: allHealthy ? 200 : 503,
        data: {
            overall: allHealthy ? "healthy" : "degraded",
            scrapers: health,
            timestamp: new Date().toISOString(),
        },
    }, allHealthy ? 200 : 503);
});

export { managementRouter };
