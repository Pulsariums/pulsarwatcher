import type { Hono } from "hono";
import type { ServerContext } from "../config/context.js";

export interface ScraperMetadata {
    id: string;
    name: string;
    description: string;
    status: "active" | "maintenance" | "deprecated";
    version: string;
    baseUrl: string;
    features: string[];
    endpoints: Record<string, string>;
    router: Hono<ServerContext>;
}

export class ScraperRegistry {
    private static instance: ScraperRegistry;
    private scrapers: Map<string, ScraperMetadata> = new Map();

    private constructor() {}

    static getInstance(): ScraperRegistry {
        if (!ScraperRegistry.instance) {
            ScraperRegistry.instance = new ScraperRegistry();
        }
        return ScraperRegistry.instance;
    }

    register(metadata: ScraperMetadata): void {
        this.scrapers.set(metadata.id, metadata);
        console.log(`✅ Registered scraper: ${metadata.name} (${metadata.id})`);
    }

    get(id: string): ScraperMetadata | undefined {
        return this.scrapers.get(id);
    }

    getAll(): ScraperMetadata[] {
        return Array.from(this.scrapers.values());
    }

    getActive(): ScraperMetadata[] {
        return this.getAll().filter(s => s.status === "active");
    }

    getByStatus(status: ScraperMetadata["status"]): ScraperMetadata[] {
        return this.getAll().filter(s => s.status === status);
    }

    listEndpoints(): Record<string, any> {
        const endpoints: Record<string, any> = {};
        this.scrapers.forEach((scraper) => {
            endpoints[scraper.id] = {
                status: scraper.status === "active" ? "✅ Active" : 
                        scraper.status === "maintenance" ? "⚠️ Maintenance" : "❌ Deprecated",
                path: scraper.baseUrl,
                endpoints: scraper.endpoints,
            };
        });
        return endpoints;
    }

    getStats() {
        const all = this.getAll();
        return {
            total: all.length,
            active: all.filter(s => s.status === "active").length,
            maintenance: all.filter(s => s.status === "maintenance").length,
            deprecated: all.filter(s => s.status === "deprecated").length,
        };
    }
}

export const scraperRegistry = ScraperRegistry.getInstance();
