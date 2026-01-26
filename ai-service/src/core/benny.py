"""Benny - Wellness AI Core"""
import os
from datetime import datetime
from typing import Dict
from openai import AzureOpenAI
from dotenv import load_dotenv

from .config import BennyMode, MODE_CONFIG
from .prompts import BASE_PERSONALITY, CHAT_MODE_PROMPT, RECOMMEND_MODE_PROMPT, FALLBACK_RESPONSES
from .db_handler import ChatDBHandler


load_dotenv()

class BennyWellnessAI:
    """Core Benny AI implementation"""
    def __init__(self):
        """Initialize Benny with Azure OpenAI"""
        # FUTURE: add to env
        self.endpoint = os.getenv("")   
        self.api_key = os.getenv("")
        self.deployment = os.getenv("")

        if not self.endpoint or not self.api_key:
            raise ValueError("Missing Azure OpenAI credentials")
        
        self.client = AzureOpenAI(
            azure_endpoint=self.endpoint,
            api_key=self.api_key,
            api_version="2026-01-01-preview"
        )

        self.conversation_history = []
        self.db_handler # FUTURE: add import

        print("Benny initialized successfully!")

    async def chat(self, message: str) -> Dict:
        """Chat with Benny"""
        response = await self._generate_response(message, BennyMode.CHAT)

        if response["success"]:
            # FUTURE FIX
            await self.db_handler.save_chat(message, response["response"])

        return response
    
    async def recommend(self, daily_checkin: Dict) -> Dict:
        """Get wellness recommendation based on daily check-in"""
        checkin_message = self._format_checkin(daily_checkin)

        prompt = f"""Here is today's check-in data: {checkin_message} {CHAT_MODE_PROMPT}"""

        return await self._generate_response(prompt, BennyMode.RECOMMEND)
    
    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        return {"success": True, "message": "Conversation history cleared"}

    async def _generate_response(self, message: str, mode: BennyMode):
        """Generate AI response for given mode"""
        try:
            messages = self._build_messages(message, mode)
            config = MODE_CONFIG[mode]

            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                max_tokens=config["max_tokens"],
                temperature=config["temperature"],
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.2
            )

            benny_response = response.choices[0].message.content.strip()

            if mode == BennyMode.CHAT:
                self._update_history(message, benny_response)

            return {
                "success": True,
                "response": benny_response,
                "mode": mode.value,
                "tokens_used": response.usage.total_tokens,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "mode": mode.value,
                "response": FALLBACK_RESPONSES[mode.value],
                "timestamp": datetime.now().isoformat()
            }

    def _build_messages(self, message: str, mode: BennyMode) -> list:
        """Build mesage list for API call"""
        prompt_map = {
            BennyMode.CHAT: CHAT_MODE_PROMPT,
            BennyMode.RECOMMEND: RECOMMEND_MODE_PROMPT
        }

        system_prompt = BASE_PERSONALITY + prompt_map[mode]
        messages = [{"role": "system", "content": system_prompt}]
        
        if mode == BennyMode.CHAT and self.conversation_history:
            messages.extend(self.conversation_history[-10:])

        messages.append({"role": "user", "content": message})
        return messages

    def _update_history(self, user_msg: str, ai_msg: str):
        """Update conversation history"""
        self.conversation_history.extend([
            {"role": "user", "content": user_msg},
            {"role": "ai", "content": ai_msg}
        ])

    def _format_checkin(self, daily_checkin: Dict) -> str:
        """Format daily_checkin for AI"""
        templates = {
            "nutrition": "Today my nutrition was {value}.",
            "fitness": "Was I able to complete my planned fitness: {value}",
            "stress": "My stress was {value}",
            "sleep": "My sleep quality was {value}"
        }

        return " ".join(
            templates[key].format(value=value)
            for key, value in daily_checkin.items()
            if key in templates
        )
