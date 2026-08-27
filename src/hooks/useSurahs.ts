import { useState, useEffect } from "react"
import { filterArrayBySearch } from "@yakad/lib"
import { getSurahs } from "@/api/surahs"
import type { Surah } from "@ntq/sdk"

export function getSurahNames(surah: Surah): { primary: string; secondary?: string } {
    const names = surah.names as unknown

    if (Array.isArray(names) && names.length > 0) {
        const first = names[0] as Record<string, unknown>
        return {
            primary:
                typeof first.name === "string"
                    ? first.name
                    : typeof first.text === "string"
                        ? first.text
                        : `Surah ${surah.number}`,
            secondary:
                typeof first.translation === "string"
                    ? first.translation
                    : typeof first.transliteration === "string"
                        ? first.transliteration
                        : undefined,
        }
    }

    if (names && typeof names === "object") {
        const n = names as Record<string, unknown>
        return {
            primary:
                typeof n.arabic === "string"
                    ? n.arabic
                    : typeof n.name === "string"
                        ? n.name
                        : `Surah ${surah.number}`,
            secondary:
                typeof n.translation === "string"
                    ? n.translation
                    : typeof n.transliteration === "string"
                        ? n.transliteration
                        : undefined,
        }
    }

    return { primary: `Surah ${surah.number}` }
}

// Uses @yakad/lib's filterArrayBySearch, which already normalizes Arabic/
// Persian letter variants, strips diacritics, and converts Persian/Arabic
// digits to English before comparing — so search works across languages
// and input methods without any extra logic here.
export function filterSurahs(surahs: Surah[], query: string): Surah[] {
    if (!query.trim()) return surahs

    return filterArrayBySearch(surahs, query, ["number", "names", "period"])
}

export function useAllSurahs(mushaf: string) {
    const [surahs, setSurahs] = useState<Surah[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        getSurahs(mushaf, { search: "" })
            .then((data) => {
                if (!cancelled) setSurahs(data)
            })
            .catch(() => {
                if (!cancelled) setError("fetchError")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [mushaf])

    return { surahs, loading, error }
}