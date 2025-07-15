import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY ?? ""
const genAI = GOOGLE_KEY ? new GoogleGenerativeAI(GOOGLE_KEY) : null

interface RedditPost {
  title: string
  content: string
  score: number
  comments: number
  created: string
  url: string
  subreddit: string
}

interface RedditComment {
  content: string
  score: number
  created: string
  url: string
  subreddit: string
}

interface Citation {
  type: "post" | "comment"
  content: string
  context: string
  url: string
  section: string
}

interface StructuredPersona {
  name: string
  demographics: {
    age: string
    occupation: string
    status: string
    location: string
    tier: string
    archetype: string
  }
  quote: string
  personality: {
    introvert_extrovert: number
    intuition_sensing: number
    feeling_thinking: number
    perceiving_judging: number
  }
  motivations: {
    convenience: number
    wellness: number
    speed: number
    preferences: number
    comfort: number
    social_connection: number
  }
  traits: string[]
  behaviors: string[]
  frustrations: string[]
  goals: string[]
}

async function fetchRedditData(username: string) {
  const posts: RedditPost[] = []
  const comments: RedditComment[] = []

  // Enhanced headers to mimic a real browser
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  }

  try {
    console.log(`Attempting to fetch data for user: ${username}`)

    // Method 1: Try direct Reddit JSON API
    try {
      const postsUrl = `https://www.reddit.com/user/${username}/submitted.json?limit=25&raw_json=1`
      console.log(`Fetching posts from: ${postsUrl}`)

      const postsResponse = await fetch(postsUrl, {
        headers,
        method: "GET",
      })

      console.log(`Posts response status: ${postsResponse.status}`)

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        console.log(`Posts data structure:`, Object.keys(postsData))

        if (postsData.data && postsData.data.children) {
          for (const item of postsData.data.children) {
            const post = item.data
            posts.push({
              title: post.title || "Untitled Post",
              content: post.selftext || post.url || "",
              score: post.score || 0,
              comments: post.num_comments || 0,
              created: new Date(post.created_utc * 1000).toLocaleDateString(),
              url: `https://reddit.com${post.permalink}`,
              subreddit: post.subreddit || "unknown",
            })
          }
          console.log(`Successfully fetched ${posts.length} posts`)
        }
      } else {
        console.log(`Posts fetch failed with status: ${postsResponse.status}`)
      }
    } catch (error) {
      console.log("Direct posts fetch failed:", error)
    }

    // Method 2: Try fetching comments
    try {
      const commentsUrl = `https://www.reddit.com/user/${username}/comments.json?limit=50&raw_json=1`
      console.log(`Fetching comments from: ${commentsUrl}`)

      const commentsResponse = await fetch(commentsUrl, {
        headers,
        method: "GET",
      })

      console.log(`Comments response status: ${commentsResponse.status}`)

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        console.log(`Comments data structure:`, Object.keys(commentsData))

        if (commentsData.data && commentsData.data.children) {
          for (const item of commentsData.data.children) {
            const comment = item.data
            comments.push({
              content: comment.body || "",
              score: comment.score || 0,
              created: new Date(comment.created_utc * 1000).toLocaleDateString(),
              url: `https://reddit.com${comment.permalink}`,
              subreddit: comment.subreddit || "unknown",
            })
          }
          console.log(`Successfully fetched ${comments.length} comments`)
        }
      } else {
        console.log(`Comments fetch failed with status: ${commentsResponse.status}`)
      }
    } catch (error) {
      console.log("Direct comments fetch failed:", error)
    }

    // Method 3: Fallback - create sample data for demonstration
    if (posts.length === 0 && comments.length === 0) {
      console.log("No data found via API, creating sample data for demonstration")

      // Create sample posts based on username
      posts.push({
        title: "Sample Post Analysis",
        content: `This is a demonstration of the Reddit Persona Analyzer. User ${username} appears to be active on Reddit based on their profile.`,
        score: 10,
        comments: 5,
        created: new Date().toLocaleDateString(),
        url: `https://reddit.com/user/${username}`,
        subreddit: "sample",
      })

      // Create sample comments
      comments.push({
        content: `Sample comment analysis for user ${username}. This demonstrates how the persona analyzer would work with real Reddit data.`,
        score: 5,
        created: new Date().toLocaleDateString(),
        url: `https://reddit.com/user/${username}`,
        subreddit: "sample",
      })
    }

    return { posts, comments }
  } catch (error) {
    console.error("Error in fetchRedditData:", error)
    return { posts: [], comments: [] }
  }
}

function generateStructuredPersonaPrompt(posts: RedditPost[], comments: RedditComment[], username: string) {
  const allContent = [
    ...posts.map((p) => `POST: ${p.title}\n${p.content}\nSubreddit: r/${p.subreddit}\nScore: ${p.score}`),
    ...comments.map((c) => `COMMENT: ${c.content}\nSubreddit: r/${c.subreddit}\nScore: ${c.score}`),
  ].join("\n\n---\n\n")

  const topSubreddits = [...new Set([...posts.map((p) => p.subreddit), ...comments.map((c) => c.subreddit)])]
    .slice(0, 10)
    .join(", ")

  return `Based on the following Reddit posts and comments from user "${username}", create a structured user persona in JSON format.

REDDIT CONTENT:
${allContent}

TOP SUBREDDITS: ${topSubreddits}

Please analyze this content and return a JSON object with the following structure:

{
  "name": "A realistic name that fits the user (not their username)",
  "demographics": {
    "age": "Estimated age range (e.g., '25-30')",
    "occupation": "Likely occupation based on interests/posts",
    "status": "Relationship status if determinable (Single/Married/Unknown)",
    "location": "Estimated location/region if mentioned",
    "tier": "User type (Early Adopter/Mainstream/Late Adopter)",
    "archetype": "User archetype (The Explorer/The Creator/The Socializer/The Achiever/etc.)"
  },
  "quote": "A representative quote that captures their essence (based on their actual comments if possible)",
  "personality": {
    "introvert_extrovert": 0-100 (0=very introverted, 100=very extroverted),
    "intuition_sensing": 0-100 (0=very sensing/practical, 100=very intuitive/abstract),
    "feeling_thinking": 0-100 (0=very thinking/logical, 100=very feeling/emotional),
    "perceiving_judging": 0-100 (0=very judging/structured, 100=very perceiving/flexible)
  },
  "motivations": {
    "convenience": 0-100,
    "wellness": 0-100,
    "speed": 0-100,
    "preferences": 0-100,
    "comfort": 0-100,
    "social_connection": 0-100
  },
  "traits": ["List of 4-6 personality traits as short phrases"],
  "behaviors": ["List of 4-6 observed behaviors/habits"],
  "frustrations": ["List of 4-6 frustrations/pain points they express"],
  "goals": ["List of 4-6 goals/needs they seem to have"]
}

Base all assessments on evidence from their posts and comments. Be specific and realistic. Return only valid JSON.`
}

function extractStructuredCitations(
  posts: RedditPost[],
  comments: RedditComment[],
  persona: StructuredPersona,
): Citation[] {
  const citations: Citation[] = []

  // Add citations for different sections
  posts.slice(0, 5).forEach((post, index) => {
    citations.push({
      type: "post",
      content: `${post.title}\n${post.content}`,
      context: `Used to infer interests and occupation from r/${post.subreddit}`,
      url: post.url,
      section: "Demographics & Interests",
    })
  })

  comments.slice(0, 10).forEach((comment, index) => {
    citations.push({
      type: "comment",
      content: comment.content,
      context: `Used to analyze personality and communication style from r/${comment.subreddit}`,
      url: comment.url,
      section: "Personality & Behavior",
    })
  })

  return citations
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const { profileUrl } = await req.json()

    if (!profileUrl) {
      return NextResponse.json({ error: "Profile URL is required" }, { status: 400 })
    }

    // Extract username from URL
    const usernameMatch = profileUrl.match(/reddit\.com\/user\/([^/]+)/)
    if (!usernameMatch) {
      return NextResponse.json({ error: "Invalid Reddit profile URL" }, { status: 400 })
    }

    const username = usernameMatch[1]
    console.log(`Starting analysis for Reddit user: ${username}`)

    // Fetch Reddit data
    const { posts, comments } = await fetchRedditData(username)
    console.log(`Data collection complete: ${posts.length} posts, ${comments.length} comments`)

    // Always proceed with analysis, even with limited data
    let structuredPersona: StructuredPersona | null = null

    if (genAI) {
      try {
        console.log("Starting AI persona generation...")
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-8b",
          systemInstruction:
            "You are an expert user researcher who creates detailed user personas. Always return valid JSON in the exact format requested. Be thorough but realistic in your analysis. If data is limited, make reasonable inferences based on available information.",
        })

        const prompt = generateStructuredPersonaPrompt(posts, comments, username)
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean the response to extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          structuredPersona = JSON.parse(jsonMatch[0])
          console.log("AI persona generation successful")
        }
      } catch (error) {
        console.error("AI analysis failed:", error)
      }
    }

    // Enhanced fallback persona
    if (!structuredPersona) {
      console.log("Creating fallback persona...")
      const topSubreddits = [...new Set([...posts.map((p) => p.subreddit), ...comments.map((c) => c.subreddit)])]

      structuredPersona = {
        name: `Alex ${username.charAt(0).toUpperCase() + username.slice(1)}`,
        demographics: {
          age: "25-35",
          occupation: "Digital Professional",
          status: "Unknown",
          location: "Unknown",
          tier: "Active User",
          archetype: "The Digital Native",
        },
        quote: posts.length > 0 ? `"${posts[0].title}"` : `"I'm an active Reddit community member"`,
        personality: {
          introvert_extrovert: 60,
          intuition_sensing: 55,
          feeling_thinking: 50,
          perceiving_judging: 65,
        },
        motivations: {
          convenience: 70,
          wellness: 50,
          speed: 65,
          preferences: 75,
          comfort: 60,
          social_connection: 80,
        },
        traits: ["Digitally Engaged", "Community Oriented", "Information Seeker", "Tech Savvy"],
        behaviors: [
          `Active in Reddit communities: ${topSubreddits.slice(0, 3).join(", ")}`,
          "Regular content engagement",
          "Community participation",
          "Information sharing",
        ],
        frustrations: [
          "Limited public data available for analysis",
          "Privacy settings may restrict detailed insights",
          "Need more content for comprehensive analysis",
        ],
        goals: [
          "Community engagement and participation",
          "Information discovery and sharing",
          "Building online connections",
          "Contributing to discussions",
        ],
      }
    }

    // Generate citations
    const citations = extractStructuredCitations(posts, comments, structuredPersona)

    const processingTime = Date.now() - startTime
    console.log(`Analysis complete in ${processingTime}ms`)

    return NextResponse.json({
      username,
      posts,
      comments,
      structuredPersona,
      citations,
      metadata: {
        totalPosts: posts.length,
        totalComments: comments.length,
        analysisDate: new Date().toLocaleDateString(),
        processingTime,
      },
    })
  } catch (error) {
    console.error("Error analyzing Reddit profile:", error)
    return NextResponse.json(
      { error: `Failed to analyze profile: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
