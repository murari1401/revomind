import signal
import sys
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from openai import OpenAI
import json

app = FastAPI(title="Craft Copilot - Google Hackathon Project")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize OpenAI client with OpenRouter and new API key
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

class IdeaRequest(BaseModel):
    idea: str

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/suggest")
async def suggest_idea(request: IdeaRequest):
    try:
        # Much shorter prompt and using a smaller model with limited tokens
        prompt = f"Give me 5 one-line project ideas about {request.idea}."
        response = client.chat.completions.create(
            model="anthropic/claude-instant-v1",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,  # Significantly reduced token limit
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Craft Innovation Hub",
            }
        )

        suggestions = response.choices[0].message.content.split('\n')
        result = [idea.strip() for idea in suggestions if idea.strip()][:5]

        return JSONResponse({
            "success": True,
            "suggestions": result
        })

    except Exception as e:
        print(f"Error generating suggestions: {str(e)}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/generate-image")
async def generate_image(request: IdeaRequest):
    try:
        # Using a simpler prompt and smaller image size
        prompt = f"Simple concept art of: {request.idea}"
        response = client.images.generate(
            model="stabilityai/stable-diffusion-xl-base-1.0",
            prompt=prompt,
            size="512x512",  # Smaller size to reduce usage
            n=1
        )

        image_url = response.data[0].url if response.data else None
        if not image_url:
            raise HTTPException(status_code=500, detail="No image generated")

        return JSONResponse({
            "success": True,
            "image": image_url
        })

    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/trending")
async def get_trending():
    trending_ideas = [
        {
            "title": "AI Music Composer",
            "description": "Create an AI system that composes original music in different genres",
            "category": "AI/Music",
            "difficulty": "Advanced",
            "likes": 2450,
            "image": "https://images.unsplash.com/photo-1511379938547-c1f69419868d"
        },
        {
            "title": "Smart Home Garden",
            "description": "Automated indoor garden with climate control and plant monitoring",
            "category": "IoT/Agriculture",
            "difficulty": "Intermediate",
            "likes": 1890,
            "image": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae"
        },
        {
            "title": "AR Art Gallery",
            "description": "Mobile app that turns any space into an augmented reality art exhibition",
            "category": "AR/Art",
            "difficulty": "Advanced",
            "likes": 1675,
            "image": "https://images.unsplash.com/photo-1577083552431-6e5fd75a9580"
        },
        {
            "title": "Eco-Friendly Smart Bin",
            "description": "Automated waste sorting system using AI and sensors",
            "category": "Sustainability",
            "difficulty": "Intermediate",
            "likes": 1450,
            "image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
        },
        {
            "title": "DIY Home Security",
            "description": "Build your own smart security system with cameras and sensors",
            "category": "IoT/Security",
            "difficulty": "Intermediate",
            "likes": 1380,
            "image": "https://images.unsplash.com/photo-1558002038-1055907df827"
        }
    ]
    return JSONResponse({"success": True, "ideas": trending_ideas})

# Helper functions (keep your existing helper functions)
def get_materials(idea):
    # Your existing get_materials function
    pass

def get_difficulty():
    # Your existing get_difficulty function
    pass

def get_time_estimate():
    # Your existing get_time_estimate function
    pass

def get_cost_estimate():
    # Your existing get_cost_estimate function
    pass

def generate_steps(idea):
    # Your existing generate_steps function
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
