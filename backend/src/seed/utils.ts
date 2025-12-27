
/**
 * Shared utilities for seed scripts
 */

// Basic HTML-to-Lexical parser for seed data
export function createRichText(content: string) {
    const children: any[] = []

    // Regex to match block elements (h2, h3, p, ul)
    // Note: This is a simplified parser specifically for the seed data format
    const blockRegex = /<(h[23]|p|ul)>(.*?)<\/\1>/gs
    let match
    let hasMatches = false

    while ((match = blockRegex.exec(content)) !== null) {
        hasMatches = true
        const tag = match[1]
        const inner = match[2].trim()

        if (tag === 'h2' || tag === 'h3') {
            children.push({
                type: 'heading',
                tag,
                children: [{ type: 'text', text: inner, version: 1 }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1
            })
        } else if (tag === 'p') {
            // Strip inline tags for simplicity for now
            const cleanText = inner.replace(/<[^>]+>/g, '')
            children.push({
                type: 'paragraph',
                children: [{ type: 'text', text: cleanText, version: 1 }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
            })
        } else if (tag === 'ul') {
            const listChildren = []
            const liRegex = /<li>(.*?)<\/li>/gs
            let liMatch
            while ((liMatch = liRegex.exec(inner)) !== null) {
                const liText = liMatch[1].replace(/<[^>]+>/g, '') // Strip inline tags
                listChildren.push({
                    type: 'listitem',
                    children: [{ type: 'text', text: liText, version: 1 }],
                    value: 1,
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1
                })
            }

            children.push({
                type: 'list',
                listType: 'bullet',
                children: listChildren,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1
            })
        }
    }

    // Fallback for simple strings (no tags found)
    if (!hasMatches && content.trim().length > 0) {
        children.push({
            type: 'paragraph',
            children: [{ type: 'text', text: content, version: 1 }],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
        })
    }

    return {
        root: {
            type: 'root',
            children,
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
        },
    }
}
