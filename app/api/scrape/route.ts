import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY ?? ""
const genAI = GOOGLE_KEY ? new GoogleGenerativeAI(GOOGLE_KEY) : null

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------
const desktopHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
}

async function fetchCompleteHtml(url: string): Promise<string> {
  // Try multiple approaches to get complete content
  const methods = [
    // Method 1: Direct fetch with full headers
    async () => {
      const response = await fetch(url, {
        headers: desktopHeaders,
        redirect: "follow",
      })
      if (response.ok) return response.text()
      throw new Error(`Direct fetch failed: ${response.status}`)
    },

    // Method 2: Jina.ai reader (good for articles)
    async () => {
      const jinaUrl = `https://r.jina.ai/${url}`
      const response = await fetch(jinaUrl, { headers: desktopHeaders })
      if (response.ok) return response.text()
      throw new Error(`Jina fetch failed: ${response.status}`)
    },

    // Method 3: Alternative proxy
    async () => {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl)
      if (response.ok) {
        const data = await response.json()
        return data.contents
      }
      throw new Error(`Proxy fetch failed: ${response.status}`)
    },
  ]

  // Try each method until one succeeds
  for (const method of methods) {
    try {
      return await method()
    } catch (error) {
      console.warn(`Fetch method failed:`, error)
      continue
    }
  }

  throw new Error("All fetch methods failed")
}

function deepCleanContent(html: string): string {
  let text = html

  // Remove script and style tags with their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")

  // Remove comments
  text = text.replace(/<!--[\s\S]*?-->/g, "")

  // Remove common non-content elements
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
  text = text.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
  text = text.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "")

  // Remove elements by class/id that typically contain ads or navigation
  text = text.replace(
    /<[^>]*class="[^"]*(?:ad|advertisement|banner|sidebar|menu|nav|footer|header)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
    "",
  )
  text = text.replace(
    /<[^>]*id="[^"]*(?:ad|advertisement|banner|sidebar|menu|nav|footer|header)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
    "",
  )

  // Convert common HTML entities before removing tags
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "...",
    "&bull;": "•",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
  }

  Object.entries(entities).forEach(([entity, replacement]) => {
    text = text.replace(new RegExp(entity, "g"), replacement)
  })

  // Convert paragraph and heading tags to preserve structure
  text = text.replace(/<\/?(h[1-6]|p|div|br|li)[^>]*>/gi, "\n")
  text = text.replace(/<\/?(ul|ol|dl)[^>]*>/gi, "\n\n")

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ")

  // Clean up whitespace and formatting
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n") // Multiple newlines to double
  text = text.replace(/[ \t]+/g, " ") // Multiple spaces to single
  text = text.replace(/\n /g, "\n") // Remove spaces at start of lines
  text = text.replace(/ \n/g, "\n") // Remove spaces at end of lines

  // Remove common website artifacts
  const artifacts = [
    /skip to (?:main )?content/gi,
    /click here/gi,
    /read more/gi,
    /continue reading/gi,
    /share this/gi,
    /follow us/gi,
    /subscribe/gi,
    /newsletter/gi,
    /cookie policy/gi,
    /privacy policy/gi,
    /terms of service/gi,
    /loading\.\.\./gi,
    /javascript is disabled/gi,
    /enable javascript/gi,
    /\[object Object\]/gi,
    /undefined/gi,
    /null/gi,
  ]

  artifacts.forEach((pattern) => {
    text = text.replace(pattern, "")
  })

  // Remove lines that are too short (likely navigation or artifacts)
  text = text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim()
      return trimmed.length > 10 || /[.!?]$/.test(trimmed) // Keep if >10 chars or ends with punctuation
    })
    .join("\n")

  // Final cleanup
  text = text.trim()
  text = text.replace(/\n{3,}/g, "\n\n") // Max 2 consecutive newlines

  return text
}

function extractMainContent(cleanText: string): string {
  const lines = cleanText.split("\n").filter((line) => line.trim().length > 0)

  if (lines.length === 0) return cleanText

  // Score lines based on content quality
  const scoredLines = lines.map((line) => {
    let score = 0
    const trimmed = line.trim()

    // Positive scoring
    if (trimmed.length > 50) score += 2
    if (trimmed.length > 100) score += 2
    if (/[.!?]$/.test(trimmed)) score += 1
    if (/^[A-Z]/.test(trimmed)) score += 1
    if (trimmed.split(" ").length > 8) score += 2

    // Negative scoring for likely non-content
    if (/^(home|about|contact|login|register|search)$/i.test(trimmed)) score -= 3
    if (/^\d+$/.test(trimmed)) score -= 2
    if (trimmed.length < 20) score -= 1
    if (/^(click|tap|select|choose|view|see|more|less)$/i.test(trimmed)) score -= 2

    return { line: trimmed, score }
  })

  // Keep lines with positive scores
  const goodLines = scoredLines.filter((item) => item.score > 0).map((item) => item.line)

  return goodLines.length > 0 ? goodLines.join("\n\n") : cleanText
}

// -----------------------------------------------------------------------------
// API Route
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

    console.log(`Scraping URL: ${url}`)

    // ── 1. Get complete HTML content ─────────────────────────────────────────
    const rawHtml = await fetchCompleteHtml(url)
    console.log(`Raw HTML length: ${rawHtml.length} characters`)

    // ── 2. Deep clean and extract main content ───────────────────────────────
    const deepCleaned = deepCleanContent(rawHtml)
    const mainContent = extractMainContent(deepCleaned)

    console.log(`Cleaned content length: ${mainContent.length} characters`)

    // Limit content for processing (increase limit for better summaries)
    const scrapedText = mainContent.slice(0, 15000) // 15k chars for better context

    // ── 3. Generate AI summary ────────────────────────────────────────────────
    let summarizedText = ""
    let summarizer = "none"

    if (genAI && scrapedText.length > 100) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-8b",
          systemInstruction:
            "You are an expert content summarizer. Create a comprehensive, well-structured summary of the provided web content. Your summary should:\n\n" +
            "• Capture ALL key points, main ideas, and important details\n" +
            "• Maintain logical flow and proper organization\n" +
            "• Use clear, engaging, and readable language\n" +
            "• Preserve context and nuance from the original\n" +
            "• Structure content with proper paragraphs and transitions\n" +
            "• Be detailed enough to understand the full scope without reading the original\n" +
            "• Remove redundancy while keeping essential information\n\n" +
            "Format the summary with clear paragraphs and good readability.",
        })

        const result = await model.generateContent(scrapedText)
        summarizedText = result.response.text()
        summarizer = "gemini"
        console.log(`Generated summary length: ${summarizedText.length} characters`)
      } catch (err) {
        console.warn("Gemini summarization failed:", err)
        summarizedText = scrapedText // Fallback to cleaned content
        summarizer = "cleaned-original"
      }
    } else {
      summarizedText = scrapedText
      summarizer = "cleaned-original"
    }

    // ── 4. Return results ─────────────────────────────────────────────────────
    return NextResponse.json(
      {
        scrapedText,
        summarizedText,
        summarizer,
        metadata: {
          originalLength: rawHtml.length,
          cleanedLength: scrapedText.length,
          summaryLength: summarizedText.length,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    )
  } catch (err) {
    console.error("Error processing request:", err)
    return NextResponse.json(
      { error: `Failed to process URL: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
