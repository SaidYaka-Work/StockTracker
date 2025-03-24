# Hypothetical Stock Investment Tracker

A full-stack application for tracking and analyzing hypothetical stock investments using AI-powered insights.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: SST (Serverless Stack) with TypeScript
- **AI Service**: Python FastAPI
- **Database**: Supabase
- **AI Integration**: OpenAI

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/          # SST serverless backend
├── ai-service/       # Python FastAPI AI service
└── shared/          # Shared types and utilities
```

## Features

- Track hypothetical stock investments
- Real-time stock data integration
- AI-powered investment insights
- Portfolio performance analysis
- Historical data visualization
- User authentication and authorization

## Prerequisites

- Node.js 18+
- Python 3.9+
- AWS CLI configured
- Supabase account
- OpenAI API key

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install

   # AI Service
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create `.env` files in each directory
   - Add necessary API keys and configuration

4. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   npm run dev

   # AI Service
   cd ai-service
   uvicorn main:app --reload
   ```

## Environment Variables

### Frontend
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_api_url
```

### Backend
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
```

### AI Service
```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 