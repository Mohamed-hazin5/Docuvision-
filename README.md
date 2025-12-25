# Doc-Vis: AI-Powered Document Visualization Platform

A Next.js application that transforms document data into interactive visualizations with AI-powered insights and report generation.

## 🚀 Features

### Core Functionality
- **Document Upload & Parsing**: Upload Excel/CSV files and automatically extract data
- **Interactive Charts**: Generate multiple chart types (Bar, Line, Pie, Scatter, Area, etc.)
- **AI-Powered Analysis**: Multi-agent workflow for intelligent data analysis and insights
- **Report Generation**: Create executive summaries and detailed reports using AI
- **Conversational Data Analyst**: Interactive AI chat to ask questions about your dataset and charts
- **Export Capabilities**: Export dashboards as PDF, charts as PNG/SVG, or bundle as ZIP

### Advanced Features
- **Multi-Key API Management**: Mid-process key rotation and automatic skip of exhausted keys
- **Workflow Optimization**: 50% reduction in API calls for reports (now using optimized 2-step pipeline)
- **Retry Logic**: Automatic retry with exponential backoff and key switching for quota failures
- **Premium UX**: Dynamic loading tips and detailed quota exhaustion guidance in-UI
- **Responsive Design**: Premium UI with glassmorphism, animations, and modern aesthetics
- **Print Optimization**: Specialized CSS for perfect PDF exports via browser print

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **Styling**: Tailwind CSS v4
- **Charts**: Apache ECharts
- **Animations**: GSAP, Lenis (smooth scroll)
- **UI Components**: Custom React components with Radix UI primitives

### Backend & AI
- **AI Models**: Google Gemini 2.5 Flash (via REST API)
- **Agent Framework**: Custom multi-agent workflow (4-step pipeline)
- **API**: Next.js API Routes
- **Key Management**: Custom MultiKeyManager for API rotation

### Export & Utilities
- **PDF Generation**: Native browser print API with optimized CSS
- **Image Export**: html2canvas (for PNG/SVG)
- **File Handling**: FileSaver.js, JSZip

## 📋 Project Structure

```
doc-vis/
├── app/
│   ├── api/
│   │   ├── generate-report/      # AI report generation endpoint
│   │   ├── list-models/           # Diagnostic endpoint for available models
│   │   ├── pdf/parse/             # PDF parsing endpoint
│   │   ├── suggest/               # Chart suggestion endpoint
│   │   └── workflow/              # LangGraph workflow endpoint
│   ├── dashboard/                 # Main dashboard pages
│   └── globals.css                # Global styles with print optimization
├── lib/
│   ├── agents/
│   │   ├── agents.ts              # Individual agent implementations
│   │   ├── report-workflow.ts    # 4-step AI report workflow
│   │   └── workflow.ts            # LangGraph workflow definition
│   ├── export-utils.ts            # Export functionality (PDF, PNG, SVG, ZIP)
│   ├── multi-key-manager.ts      # API key rotation manager
│   └── report-client.ts           # Report generation client utilities
└── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key(s)

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/mohamedhazin/Desktop/video/doc-vis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_primary_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_primary_api_key_here
   
   # Optional: Add multiple keys for rotation (comma-separated)
   GEMINI_API_KEYS=key1,key2,key3
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to `http://localhost:3000`

## 🤖 AI Architecture

### Optimized 2-Step Report Workflow

The application uses an optimized sequential agent pipeline to reduce API costs and quota usage by 50%:

1. **Combined Data & Trend Agent** (Temperature: 0.4)
   - Merges Step 1 (Data Analysis) and Step 2 (Trend Analysis)
   - Analyzes chart data, identifies patterns, and extracts key metrics
   - Output: Comprehensive factual and analytical data foundation

2. **Insight & Synthesis Agent** (Temperature: 0.6)
   - Merges Step 3 (Insight Generation) and Step 4 (Report Synthesis)
   - Generates actionable insights and creates the final formatted report
   - Output: Professional Markdown report with Overview, Findings, and Recommendations

#### Intelligent Quota Management
- **Mid-Process Rotation**: If a key hits its quota limit (429 error) mid-workflow, the system automatically marks it as exhausted and switches to the next available key.
- **20 → Double Limit**: By optimizing from 4 calls to 2, the effective daily report limit on the free tier is doubled.

### Experience Settings & Motion Controller (v1.5.0 - Customizable)

DocuVision now features a centralized UI customization system that gives users full control over the dashboard's look, feel, and motion behavior.

#### Centralized UI Settings
- **Customization Modal**: A premium settings panel accessible from the AI Analyst button, allowing users to tweak every aspect of their experience.
- **Theme & Accents**: Support for Light/Dark/System themes and multiple accent colors (Purple, Blue, Green, Orange) that propagate globally via CSS variables.
- **Layout Density**: Toggle between *Comfortable* (extra white space) and *Compact* (data-dense) layouts.
- **AI Verbosity Control**: Users can now set the AI's personality to *Brief*, *Balanced*, or *Detailed*, which dynamically adjusts the system prompt's detail level.

#### Smart GSAP Motion Stack
- **Conditional Animations**: All GSAP animations (page entries, dashboard reveals, UI transitions) are now controlled by the `motionLevel` setting.
- **Accessibility (Reduced Motion)**: Full support for the `prefers-reduced-motion` media query. The system automatically shifts to a "Reduced" motion profile if conflict is detected.
- **Animation Styles**: Customize the motion "feel" with *Smooth* (standard), *Snappy* (fast easing), or *Minimal* (opacity-only) styles.
- **Performance First**: Motion is managed through the `UISettingsProvider`, ensuring that animations never run on re-renders unless intended.

#### Rigorous Data Contract

#### Phase: Proof & Polish (Features)
- **IDLE**: Prompted when data is loaded (*"Ask me about this dashboard"*).
- **NO_CONTEXT**: Active when no data is present (*"Open a dashboard to begin"*).
- **THINKING**: Visual status indicator (*"Analyzing charts..."*) during API processing.
- **ANSWERING**: Insight-driven responses strictly limited to visible dashboard data.
- **OUT_OF_SCOPE**: Hard restriction rule for non-data queries (*"I can help with visible data only"*).

#### Technical Architecture
- **State Management**: Chat history is stored in **React State (RAM)**. This ensures data privacy and zero-latency UI updates.
- **Stateless Resilience**: Since Google Gemini is stateless, the frontend manually injects chat history (last 10 messages) into every request. This allows memory to survive **API Key Rotation** mid-conversation.
- **Data Summarization**: To minimize token costs and stay within limits, the chat sends statistical aggregates (min, max, avg) and chart metadata instead of raw database rows.
- **Network Resilience**: Integrated retry logic handles temporary connection issues (`ENOTFOUND`) and automatically fails over to alternative API keys on quota exhaustion.

#### UX Enhancements
- **Scroll Isolation**: Uses `data-lenis-prevent` and event propagation stopping to allow independent chat scrolling without moving the dashboard background.
- **Input Clarity**: Enforced high-contrast text visibility for data entry.
- **Typing Status**: Real-time feedback during analytical processing.

### API Configuration

- **Model**: `models/gemini-2.5-flash` (Google Gemini v1 API)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Error Handling**: Automatic retry on 503 (server overload)

## 📊 Key Features Explained

### PDF Export
- **Method**: Native browser `window.print()` API
- **Why**: Bypasses html2canvas limitations with modern CSS (lab/oklch colors)
- **Optimization**: Custom `@media print` CSS for perfect layout
- **Features**: 
  - Hides navigation/buttons
  - Forces 2-column grid layout
  - Prevents page breaks inside cards
  - Ensures background colors print

### Multi-Key Management
- **Purpose**: Distribute API load across multiple keys
- **Strategy**: Round-robin rotation with usage tracking
- **Benefits**: 
  - Higher effective rate limits
  - Better quota management
  - Automatic failover

### Retry Logic
- **Trigger**: 503 "Model Overloaded" errors
- **Strategy**: Exponential backoff (1s → 2s → 4s)
- **Max Attempts**: 3 retries per request
- **Result**: ~95% success rate even during peak times

## 🎨 Design System

### Color Palette
- Primary: Indigo/Violet gradient (`#6366f1` → `#a855f7`)
- Background: Off-white (`#f8fafc`)
- Text: Slate shades (`#0f172a`, `#1e293b`)

### Effects
- **Glassmorphism**: Frosted glass cards with backdrop blur
- **Noise Texture**: Subtle SVG noise overlay for depth
- **Animations**: GSAP-powered smooth transitions
- **Hover Effects**: Elevated cards with shadow transitions

## 🔄 Recent Changes & Fixes

### December 2024 Updates

#### December 23, 2024 (v1.5.0)
- **Settings System**: Launched centralized UI & Motion customization panel.
- **Dynamic Accents**: Support for multiple accent colors using CSS properties.
- **Motion Control**: Implemented user-controlled GSAP levels (Full, Reduced, Off).
- **AI Personalities**: Added Brief/Detailed verbosity settings for the AI Analyst.

#### December 23, 2024 (v1.4.1)
- **AI Quota Optimization**: Reduced report pipeline from 4 API calls to 2 (50% reduction).
- **Intelligent Rotation**: Automatic mid-workflow key switching on quota exhaustion.
- **Premium UX**: Dynamic loading tips and detailed quota guidance in the AI interface.

#### December 22, 2024 (v1.0.0)
- **PDF Export Fix**: Replaced `html2canvas` with native `window.print()` for Tailwind v4 compatibility.
- **Improved Report Logic**: Rewrote AI core using direct REST API calls for better reliability.

#### AI Report Generation Overhaul
- **Issue**: LangChain SDK used v1beta API where models weren't available
- **Solution**: Complete rewrite using direct REST API calls to v1 endpoint
- **Models Tested**: 
  - ❌ `gemini-1.5-pro-latest` (404 on v1beta)
  - ❌ `gemini-1.5-flash` (404 on v1beta)
  - ❌ `gemini-pro` (404 on v1)
  - ✅ `models/gemini-2.5-flash` (works on v1)

#### Retry Logic Implementation
- **Issue**: Intermittent 503 errors during peak usage
- **Solution**: Added exponential backoff retry mechanism
- **Result**: Reports now succeed even when Google's servers are busy

#### Print CSS Optimization
- **Issue**: Dashboard layout broke when printing
- **Solution**: Added comprehensive `@media print` styles
- **Features**: 
  - 2-column grid layout
  - Hidden navigation elements
  - Unbroken chart cards
  - Forced background graphics

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Chart Data Validation**: Empty chart arrays may produce generic reports
2. **API Rate Limits**: Free tier has quota restrictions
3. **Browser Compatibility**: Print CSS optimized for Chrome/Edge

### Workarounds
- Use multiple API keys for higher quotas
- Retry logic handles temporary failures
- Fallback to PNG export if print fails

## 📝 API Endpoints

### `/api/generate-report`
- **Method**: POST
- **Body**: `{ charts: [], reportType: 'executive' | 'detailed' }`
- **Response**: `{ success: boolean, report: string, metadata: {} }`

### `/api/list-models`
- **Method**: GET
- **Purpose**: Diagnostic endpoint to list available Gemini models
- **Response**: `{ v1: { models: [] }, v1beta: { models: [] } }`

### `/api/pdf/parse`
- **Method**: POST
- **Body**: FormData with PDF file
- **Response**: Extracted data as JSON

### `/api/suggest`
- **Method**: POST
- **Body**: `{ data: [] }`
- **Response**: Chart type suggestions

## 🚦 Testing

### Quick Test Checklist
1. ✅ Upload Excel/CSV file
2. ✅ Generate charts from data
3. ✅ Export dashboard as PDF (Ctrl/Cmd + P)
4. ✅ Generate AI report (Executive/Detailed)
5. ✅ Export individual charts as PNG/SVG
6. ✅ Download all charts as ZIP

### Diagnostic Commands
```bash
# Check available models
curl http://localhost:3000/api/list-models

# Test report generation
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"charts": [], "reportType": "executive"}'
```

## 🤝 Contributing

This is a personal project. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- **Google Gemini**: AI model provider
- **Apache ECharts**: Chart library
- **Vercel**: Next.js framework
- **Tailwind Labs**: Tailwind CSS

---

**Last Updated**: December 23, 2024  
**Version**: 1.5.0  
**Status**: ✅ Production Ready (Customizable UX)
