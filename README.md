# DealFlow - AI-Powered Real Estate Investment Analyzer

A sophisticated real estate investment analysis platform that helps investors make data-driven decisions using AI-powered insights and comprehensive financial metrics.

## Features

### 🏠 Property Analysis
- Comprehensive financial calculations including:
  - Cash flow projections
  - Cap rate analysis
  - ROI calculations
  - Monthly/annual expense breakdowns
  - Mortgage payment calculations

### 🤖 AI-Powered Insights
- **Market Sentiment Analysis**: Real-time market trends and investment outlook
- **Ultra-Think Analysis**: Deep investment analysis with pros and cons
- **Demographics Research**: Population and income statistics for target areas
- **Risk Assessment**: Comprehensive risk evaluation with mitigation strategies

### 📊 Investment Tools
- Side-by-side property comparison
- Export analysis to JSON/TXT formats
- Save and track multiple deals
- Customizable investment parameters

### 🎨 Modern UI
- Clean, professional interface with soft grey gradients
- Responsive design for all devices
- Intuitive user experience
- Real-time analysis updates

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- Modern CSS with gradients

**Backend:**
- Node.js + Express
- SQLite database
- JWT authentication
- Groq AI (Llama 3.3 70B)
- HuggingFace inference

**Testing:**
- Custom test suite with 16+ unit tests
- API endpoint testing
- Financial calculation validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CodeBalch25/dealflow.git
cd dealflow
```

2. Install dependencies:
```bash
npm install
cd client && npm install
cd ..
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

## Usage

### Analyzing a Property

1. **Sign Up/Login** to create an account
2. Navigate to the **Analyzer** page
3. Enter property details:
   - Address and location
   - Purchase price
   - Expected monthly rent
   - Down payment percentage
   - Interest rate and loan term
   - Operating expenses
4. Click **Analyze Property**
5. Review comprehensive analysis including:
   - Financial metrics
   - AI-powered insights
   - Market sentiment
   - Investment recommendation

### Comparing Properties

1. Analyze multiple properties
2. Use the comparison view to see side-by-side metrics
3. Export comparison data for further analysis

### Managing Saved Deals

1. View all saved properties in your **Dashboard**
2. Track performance metrics
3. Delete deals you're no longer interested in

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login

### Properties
- `POST /api/properties/analyze` - Analyze a property
- `GET /api/properties/my-deals` - Get user's saved deals
- `DELETE /api/properties/:id` - Delete a saved deal

### Health Check
- `GET /api/health` - Server status

## Running Tests

```bash
cd dealflow
node server/tests/analyzer.test.js
```

## MCP Integration

DealFlow supports Model Context Protocol (MCP) for integration with AI assistants. See [MCP-README.md](MCP-README.md) for details.

## Project Structure

```
dealflow/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── styles/        # CSS files
│       └── utils/         # API utilities
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # AI services
│   ├── tests/            # Test files
│   └── utils/            # Calculator utilities
├── dealflow.db           # SQLite database
└── package.json
```

## Contributing

This is a personal project. If you'd like to suggest improvements, feel free to open an issue.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Groq AI for ultra-fast inference
- HuggingFace for ML models
- Real estate investment community for inspiration

---

**Built by CodeBalch25** | [GitHub](https://github.com/CodeBalch25) | [Portfolio](https://github.com/CodeBalch25/dealflow)
