"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Download, User, MessageSquare, Quote, Info } from "lucide-react"

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useState(() => {
    const timer = setTimeout(onFinish, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <svg width="200" height="200" viewBox="0 0 500 500" className="mx-auto">
            <rect x="0" y="0" width="500" height="500" fill="url(#redditGradient)" rx="50" />
            <defs>
              <linearGradient id="redditGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4500" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>

            <circle cx="250" cy="200" r="80" fill="white" />
            <circle cx="220" cy="180" r="15" fill="#FF4500" />
            <circle cx="280" cy="180" r="15" fill="#FF4500" />
            <path d="M230 220 Q250 240 270 220" stroke="#FF4500" strokeWidth="4" fill="none" />

            <line x1="250" y1="120" x2="250" y2="80" stroke="white" strokeWidth="6" />
            <circle cx="250" cy="80" r="12" fill="white" />

            <rect x="200" y="280" width="100" height="120" rx="20" fill="white" />

            <rect x="150" y="300" width="50" height="20" rx="10" fill="white" />
            <rect x="300" y="300" width="50" height="20" rx="10" fill="white" />

            <text x="250" y="450" fill="white" fontFamily="Arial" fontWeight="900" fontSize="48" textAnchor="middle">
              Reddit Persona
            </text>
            <text x="250" y="480" fill="white" fontFamily="Arial" fontWeight="600" fontSize="24" textAnchor="middle">
              Analyzer
            </text>
          </svg>
        </div>
        <p className="text-white text-xl font-semibold">Discover the person behind the username</p>
      </div>
    </div>
  )
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

interface PersonaResult {
  username: string
  posts: any[]
  comments: any[]
  structuredPersona: StructuredPersona
  citations: any[]
  metadata: {
    totalPosts: number
    totalComments: number
    analysisDate: string
    processingTime: number
  }
}

const PersonaCard = ({ persona, username }: { persona: StructuredPersona; username: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{persona.name}</h2>
            <p className="text-orange-100">u/{username}</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-orange-500 pb-2">DEMOGRAPHICS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">AGE</span>
              <span className="text-gray-800">{persona.demographics.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">OCCUPATION</span>
              <span className="text-gray-800">{persona.demographics.occupation}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">STATUS</span>
              <span className="text-gray-800">{persona.demographics.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">LOCATION</span>
              <span className="text-gray-800">{persona.demographics.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">TIER</span>
              <span className="text-gray-800">{persona.demographics.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">ARCHETYPE</span>
              <span className="text-gray-800">{persona.demographics.archetype}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">PERSONALITY TRAITS</h4>
            <div className="flex flex-wrap gap-2">
              {persona.traits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 border-b-2 border-orange-500 pb-2 mb-4">
              MOTIVATIONS
            </h3>
            <div className="space-y-3">
              {Object.entries(persona.motivations).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600 uppercase">{key.replace("_", " ")}</span>
                    <span className="text-gray-500">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-600 border-b-2 border-orange-500 pb-2 mb-4">
              PERSONALITY
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">INTROVERT</span>
                  <span className="text-gray-600">EXTROVERT</span>
                </div>
                <Progress value={persona.personality.introvert_extrovert} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">SENSING</span>
                  <span className="text-gray-600">INTUITION</span>
                </div>
                <Progress value={persona.personality.intuition_sensing} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">THINKING</span>
                  <span className="text-gray-600">FEELING</span>
                </div>
                <Progress value={persona.personality.feeling_thinking} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">JUDGING</span>
                  <span className="text-gray-600">PERCEIVING</span>
                </div>
                <Progress value={persona.personality.perceiving_judging} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-orange-600 border-b-2 border-orange-500 pb-2 mb-4">
              BEHAVIOUR & HABITS
            </h3>
            <ul className="space-y-2 text-sm">
              {persona.behaviors.map((behavior, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{behavior}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-600 border-b-2 border-orange-500 pb-2 mb-4">
              FRUSTRATIONS
            </h3>
            <ul className="space-y-2 text-sm">
              {persona.frustrations.map((frustration, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{frustration}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-600 border-b-2 border-orange-500 pb-2 mb-4">
              GOALS & NEEDS
            </h3>
            <ul className="space-y-2 text-sm">
              {persona.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-orange-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <Quote className="w-6 h-6 text-white/80" />
          <p className="text-lg italic">{persona.quote}</p>
        </div>
      </div>
    </div>
  )
}

export default function RedditPersonaAnalyzer() {
  const [showSplash, setShowSplash] = useState(true)
  const [profileUrl, setProfileUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PersonaResult | null>(null)
  const [activeTab, setActiveTab] = useState("persona")
  const [error, setError] = useState("")

  const analyzeProfile = async () => {
    if (!profileUrl) {
      setError("Please enter a Reddit profile URL")
      return
    }

    const redditUrlPattern = /^https?:\/\/(www\.)?reddit\.com\/user\/[\w-]+\/?$/
    if (!redditUrlPattern.test(profileUrl)) {
      setError("Please enter a valid Reddit profile URL (e.g., https://www.reddit.com/user/username/)")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/analyze-reddit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze profile")
      }

      const data: PersonaResult = await response.json()
      setResult(data)
      setActiveTab("persona")
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze Reddit profile")
    } finally {
      setIsLoading(false)
    }
  }

  const resetAnalysis = () => {
    setProfileUrl("")
    setResult(null)
    setError("")
    setActiveTab("persona")
  }

  const downloadPersona = () => {
    if (!result) return

    const content = `Reddit User Persona Analysis
Generated on: ${result.metadata.analysisDate}
Username: u/${result.username}
Profile URL: ${profileUrl}

=== USER PERSONA ===

Name: ${result.structuredPersona.name}

DEMOGRAPHICS:
- Age: ${result.structuredPersona.demographics.age}
- Occupation: ${result.structuredPersona.demographics.occupation}
- Status: ${result.structuredPersona.demographics.status}
- Location: ${result.structuredPersona.demographics.location}
- Tier: ${result.structuredPersona.demographics.tier}
- Archetype: ${result.structuredPersona.demographics.archetype}

PERSONALITY TRAITS:
${result.structuredPersona.traits.map((trait) => `- ${trait}`).join("\n")}

MOTIVATIONS:
${Object.entries(result.structuredPersona.motivations)
  .map(([key, value]) => `- ${key.replace("_", " ").toUpperCase()}: ${value}%`)
  .join("\n")}

PERSONALITY SCALES:
- Introvert/Extrovert: ${result.structuredPersona.personality.introvert_extrovert}%
- Sensing/Intuition: ${result.structuredPersona.personality.intuition_sensing}%
- Thinking/Feeling: ${result.structuredPersona.personality.feeling_thinking}%
- Judging/Perceiving: ${result.structuredPersona.personality.perceiving_judging}%

BEHAVIORS & HABITS:
${result.structuredPersona.behaviors.map((behavior) => `- ${behavior}`).join("\n")}

FRUSTRATIONS:
${result.structuredPersona.frustrations.map((frustration) => `- ${frustration}`).join("\n")}

GOALS & NEEDS:
${result.structuredPersona.goals.map((goal) => `- ${goal}`).join("\n")}

REPRESENTATIVE QUOTE:
"${result.structuredPersona.quote}"

=== CITATIONS ===

${result.citations
  .map(
    (citation, index) =>
      `[${index + 1}] ${citation.type.toUpperCase()}: "${citation.content.substring(0, 100)}..." 
  Source: ${citation.url}
  Context: ${citation.context}
  Section: ${citation.section}
  `,
  )
  .join("\n")}

=== ANALYSIS METADATA ===
Total Posts Analyzed: ${result.metadata.totalPosts}
Total Comments Analyzed: ${result.metadata.totalComments}
Processing Time: ${result.metadata.processingTime}ms
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.username}_persona_analysis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Reddit Persona Analyzer</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Create professional user personas from Reddit profiles</p>
        </div>

        {!result ? (
          <div className="max-w-md mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-gray-900 dark:text-white flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Enter Reddit Profile URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="url"
                    placeholder="https://www.reddit.com/user/username/"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    onKeyPress={(e) => e.key === "Enter" && analyzeProfile()}
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: https://www.reddit.com/user/kojied/</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Note about Reddit API limitations:</p>
                      <p>
                        Due to Reddit's API restrictions, the tool may use demonstration data for some profiles. The
                        persona analysis methodology remains the same and showcases the full capabilities of the system.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <Button
                  onClick={analyzeProfile}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? "Analyzing Profile..." : "Create User Persona"}
                </Button>
                {isLoading && (
                  <div className="text-center text-sm text-gray-500">
                    <div className="animate-pulse">
                      Scraping posts and comments...
                      <br />
                      Building structured persona...
                      <br />
                      Analyzing personality traits...
                      <br />
                      Generating citations...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
               
                  {result.metadata.totalPosts} posts
                </span>
                <span className="flex items-center gap-1"> {result.metadata.totalComments} comments</span>
                <span>{result.metadata.analysisDate}</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadPersona} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button onClick={resetAnalysis} variant="outline">
                  New Analysis
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
                <TabsTrigger
                  value="persona"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  User Persona
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Posts ({result.metadata.totalPosts})
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Comments ({result.metadata.totalComments})
                </TabsTrigger>
                <TabsTrigger
                  value="citations"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Citations ({result.citations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="persona" className="mt-6">
                <PersonaCard persona={result.structuredPersona} username={result.username} />
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-blue-600 dark:text-blue-400">
                      Analyzed Posts ({result.posts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {result.posts.map((post, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{post.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {post.content?.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{post.score} upvotes</span>
                          <span>{post.comments} comments</span>
                          <span>{post.created}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-purple-600 dark:text-purple-400">
                      Analyzed Comments ({result.comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {result.comments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content?.substring(0, 300)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{comment.score} upvotes</span>
                          <span>{comment.created}</span>
                          <span> r/{comment.subreddit}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="citations" className="mt-6">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-green-600 dark:text-green-400">
                      Citations & Evidence ({result.citations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {result.citations.map((citation, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                [{index + 1}] {citation.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {citation.section}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Context:</strong> {citation.context}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                              "{citation.content.substring(0, 200)}..."
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
