/**
 * M3U8 Playlist Parser
 * Parses master.m3u8 playlists to extract quality variants
 */

export interface M3U8Quality {
    quality: string;
    resolution?: string;
    bandwidth?: number;
    url: string;
}

/**
 * Parse M3U8 master playlist and extract quality variants
 */
export async function parseM3U8Playlist(m3u8Url: string): Promise<M3U8Quality[]> {
    try {
        const response = await fetch(m3u8Url);
        if (!response.ok) {
            throw new Error(`Failed to fetch M3U8: ${response.status}`);
        }

        const content = await response.text();
        const qualities: M3U8Quality[] = [];
        const lines = content.split('\n');

        let currentStreamInfo: any = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Parse #EXT-X-STREAM-INF line
            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                const attributes = parseAttributes(line.substring(18));
                
                currentStreamInfo = {
                    bandwidth: attributes.BANDWIDTH ? parseInt(attributes.BANDWIDTH) : undefined,
                    resolution: attributes.RESOLUTION,
                };
            }
            // Next line after STREAM-INF is the URL
            else if (currentStreamInfo.bandwidth && !line.startsWith('#')) {
                const url = line.startsWith('http') ? line : new URL(line, m3u8Url).href;
                
                qualities.push({
                    quality: getQualityLabel(currentStreamInfo.resolution, currentStreamInfo.bandwidth),
                    resolution: currentStreamInfo.resolution,
                    bandwidth: currentStreamInfo.bandwidth,
                    url,
                });

                currentStreamInfo = {};
            }
        }

        // Sort by bandwidth (highest first)
        qualities.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));

        return qualities;
    } catch (error) {
        console.error('M3U8 parsing error:', error);
        return [];
    }
}

/**
 * Parse M3U8 attributes (key=value pairs)
 */
function parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const regex = /([A-Z-]+)=("([^"]*)"|([^,]*))/g;
    let match;

    while ((match = regex.exec(attrString)) !== null) {
        const key = match[1];
        const value = match[3] || match[4];
        attrs[key] = value;
    }

    return attrs;
}

/**
 * Get human-readable quality label
 */
function getQualityLabel(resolution?: string, bandwidth?: number): string {
    if (resolution) {
        const height = resolution.split('x')[1];
        
        if (height === '2160') return '4K';
        if (height === '1440') return '1440p';
        if (height === '1080') return '1080p';
        if (height === '720') return '720p';
        if (height === '480') return '480p';
        if (height === '360') return '360p';
        if (height === '240') return '240p';
        
        return `${height}p`;
    }

    // Fallback to bandwidth-based quality estimation
    if (bandwidth) {
        if (bandwidth > 5000000) return '1080p';
        if (bandwidth > 2500000) return '720p';
        if (bandwidth > 1000000) return '480p';
        if (bandwidth > 500000) return '360p';
        return '240p';
    }

    return 'default';
}
