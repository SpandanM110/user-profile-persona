import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY ?? ""
const genAI = GOOGLE_KEY ? new GoogleGenerativeAI(GOOGLE_KEY) : null

// Reddit API headers
const redditHeaders = {
  "User-Agent": "RedditPersonaAnalyzer/1.0 (by /u/PersonaBot)",
  Accept: "application/json",
}

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
    introvert_extrovert: number // 0-100 scale
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

  try {
    // Fetch user's posts
    const postsResponse = await fetch(`https://www.reddit.com/user/${username}/submitted.json?limit=50`, {
      headers: redditHeaders,
    })

    if (postsResponse.ok) {
      const postsData = await postsResponse.json()
      for (const item of postsData.data.children) {
        const post = item.data
        posts.push({
          title: post.title,
          content: post.selftext || post.url,
          score: post.score,
          comments: post.num_comments,
          created: new Date(post.created_utc * 1000).toLocaleDateString(),
          url: `https://reddit.com${post.permalink}`,
          subreddit: post.subreddit,
        })
      }
    }

    // Fetch user's comments
    const commentsResponse = await fetch(`https://www.reddit.com/user/${username}/comments.json?limit=100`, {
      headers: redditHeaders,
    })

    if (commentsResponse.ok) {
      const commentsData = await commentsResponse.json()
      for (const item of commentsData.data.children) {
        const comment = item.data
        comments.push({
          content: comment.body,
          score: comment.score,
          created: new Date(comment.created_utc * 1000).toLocaleDateString(),
          url: `https://reddit.com${comment.permalink}`,
          subreddit: comment.subreddit,
        })
      }
    }

    return { posts, comments }
  } catch (error) {
    console.error("Error fetching Reddit data:", error)
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
  posts.slice(0, 5).forEach((post) => {
    citations.push({
      type: "post",
      content: `${post.title}\n${post.content}`,
      context: `Used to infer interests and occupation from r/${post.subreddit}`,
      url: post.url,
      section: "Demographics & Interests",
    })
  })

  comments.slice(0, 10).forEach((comment) => {
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
    console.log(`Analyzing Reddit user: ${username}`)

    // Fetch Reddit data
    const { posts, comments } = await fetchRedditData(username)

    if (posts.length === 0 && comments.length === 0) {
      return NextResponse.json(
        {
          error: "No posts or comments found. The profile might be private or doesn't exist.",
        },
        { status: 404 },
      )
    }

    console.log(`Found ${posts.length} posts and ${comments.length} comments`)

    // Generate structured persona using AI
    let structuredPersona: StructuredPersona | null = null

    if (genAI && (posts.length > 0 || comments.length > 0)) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-8b",
          systemInstruction:
            "You are an expert user researcher who creates detailed user personas. Always return valid JSON in the exact format requested. Be thorough but realistic in your analysis.",
        })

        const prompt = generateStructuredPersonaPrompt(posts, comments, username)
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean the response to extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          structuredPersona = JSON.parse(jsonMatch[0])
        }
      } catch (error) {
        console.error("AI analysis failed:", error)
      }
    }

    // Fallback persona if AI fails
    if (!structuredPersona) {
      const topSubreddits = [...new Set([...posts.map((p) => p.subreddit), ...comments.map((c) => c.subreddit)])]

      structuredPersona = {
        name: `Reddit User ${username}`,
        demographics: {
          age: "25-35",
          occupation: "Unknown",
          status: "Unknown",
          location: "Unknown",
          tier: "Active User",
          archetype: "The Participant",
        },
        quote: posts.length > 0 ? `"${posts[0].title}"` : `"Active in ${topSubreddits.slice(0, 3).join(", ")}"`,
        personality: {
          introvert_extrovert: 50,
          intuition_sensing: 50,
          feeling_thinking: 50,
          perceiving_judging: 50,
        },
        motivations: {
          convenience: 60,
          wellness: 50,
          speed: 55,
          preferences: 65,
          comfort: 60,
          social_connection: 70,
        },
        traits: ["Active", "Engaged", "Curious", "Social"],
        behaviors: [`Posts in ${topSubreddits.slice(0, 3).join(", ")}`, "Regular commenter", "Community participant"],
        frustrations: ["Limited data available", "Privacy settings may restrict analysis"],
        goals: ["Community engagement", "Information sharing", "Social connection"],
      }
    }

    // Generate citations
    const citations = extractStructuredCitations(posts, comments, structuredPersona)

    const processingTime = Date.now() - startTime

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
