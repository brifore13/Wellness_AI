"""Configuration for different Benny modes"""
from enum import Enum

class BennyMode(Enum):
    CHAT = "chat"
    RECOMMEND = "recommend"

MODE_CONFIG = {
    BennyMode.CHAT: {
        "max_tokens": 300,
        "temperature": 0.5
    },
    BennyMode.RECOMMEND: {
        "max_tokens": 100,
        "temperature": 0.3
    }
}