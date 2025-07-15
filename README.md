# Reddit Persona Analyzer

A comprehensive web application that analyzes Reddit user profiles to generate detailed user personas using AI-powered analysis. This tool scrapes Reddit posts and comments to build professional user personas with structured demographics, personality traits, motivations, and behavioral insights.

---

## Features

### Core Functionality

* **Reddit Profile Analysis**: Input any Reddit profile URL to analyze user behavior
* **AI-Powered Persona Generation**: Utilizes Google Gemini AI to create detailed personas
* **Structured Output**: Presents persona data in an organized, easy-to-read format
* **Citation System**: Provides references and evidence for each characteristic
* **Export Functionality**: Download full analysis reports as `.txt` files

### Persona Components

* **Demographics**: Age, occupation, relationship status, location, user tier, archetype
* **Personality Analysis**: Myers-Briggs-style indicators with progress visuals
* **Motivations**: Quantified scores across convenience, wellness, speed, preferences, comfort, and social connection
* **Behavioral Insights**: Summarized patterns and content behaviors
* **Frustrations**: Identified challenges and dissatisfaction signals
* **Goals & Needs**: Highlighted user goals and requirements
* **Representative Quote**: A phrase summarizing the user's digital identity

### Technical Highlights

* **Multi-Method Scraping**: Robust scraping with fallbacks for reliability
* **Live Processing**: Real-time analysis with progress indicators
* **Responsive UI**: Mobile-friendly, adaptive design
* **Error Handling**: Graceful fallback for invalid URLs, private profiles, and rate limits
* **Data Validation**: Verifies Reddit URLs and content availability

---

## Technology Stack

* **Frontend**: Next.js 14, React, TypeScript
* **Styling**: Tailwind CSS, shadcn/ui components
* **AI Integration**: Google Gemini API
* **Data Source**: Reddit JSON API
* **Deployment**: Ready for Vercel

---

## Installation

### Prerequisites

* Node.js v18 or later
* npm or yarn
* Google Generative AI API key

### Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd reddit-persona-analyzer
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:

   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Get Your API Key**

   * Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   * Generate a new API key
   * Add it to the `.env.local` file

5. **Start Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000)

---

## Usage

### Performing an Analysis

1. Go to the home page
2. Paste a Reddit profile URL (e.g., `https://www.reddit.com/user/username/`)
3. Click "Create User Persona"
4. Wait for processing to complete
5. View the structured persona

### Sample Reddit Profiles

* `https://www.reddit.com/user/kojied/`
* `https://www.reddit.com/user/Hungry-Move-6603/`

### Tabs and Sections

* **User Persona**: Displays the AI-generated persona card
* **Posts**: Displays extracted Reddit posts
* **Comments**: Displays analyzed comments
* **Citations**: Lists sources used for persona construction

### Exporting Reports

* Click "Download Report"
* File format: `.txt`
* Contains persona data, citations, and metadata

---

## API Endpoints

### POST `/api/analyze-reddit`

Analyzes a Reddit user and generates a structured persona.

**Request Body:**

```json
{
  "profileUrl": "https://www.reddit.com/user/username/"
}
```

**Response:**

```json
{
  "username": "string",
  "posts": "array",
  "comments": "array",
  "structuredPersona": "object",
  "citations": "array",
  "metadata": "object"
}
```

---

## Project Structure

```
reddit-persona-analyzer/
├── app/
│   ├── api/
│   │   └── analyze-reddit/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── .env.local
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## Configuration

### Environment Variables

* `GOOGLE_AI_API_KEY`: Required for generating AI personas

### Customization Options

* Adjust persona logic in `/app/api/analyze-reddit/route.ts`
* Modify UI in `/app/page.tsx`
* Update styles in `globals.css` and Tailwind config

---

## Limitations

* **Rate Limiting**: Subject to Reddit API restrictions
* **Public Profiles Only**: Cannot access private or deleted accounts
* **Content Dependency**: Persona quality depends on available post/comment data
* **AI Reliance**: Full persona generation needs a valid Google AI API key

---

## Error Handling

Includes checks and fallbacks for:

* Invalid URLs
* Private or deleted profiles
* API rate limit issues
* Connection errors
* AI service timeouts

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am "Add new feature"`)
4. Push the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---
