"""Configuration for different Benny modes"""
from enum import Enum

class BennyMode(Enum):
    CHAT = "chat"
    RECOMMEND = "recommend"

MODE_CONFIG = {
    BennyMode.CHAT: {
        "max_tokens": 150,
        "temperature": 0.6
    },
    BennyMode.RECOMMEND: {
        "max_tokens": 50,
        "temperature": 0.4
    }
}