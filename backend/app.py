from flask import Flask, request, jsonify
import requests
import asyncio
from hume import HumeStreamClient
from hume.models.config import LanguageConfig

app = Flask(__name__)

def emotionScore(emotions):
    return emotions["score"]

def formatScoreString(unformattedScore):
    return str("%.2f" % (unformattedScore * 100))

@app.route('/api/data', methods=['POST'])
async def generate_data():
    user_input = request.data.decode('utf-8')
    client = HumeStreamClient("NdTHA53OEtFN8xNtYx4Du5UZjNnnUYkl94WCkb59VPlC9xhq")
    config = LanguageConfig()

    async with client.connect([config]) as socket:
        result = await socket.send_text(user_input)
    wordCount = len(user_input.split())
    emotions = result["language"]["predictions"][wordCount - 1]["emotions"]
    emotions.sort(key=emotionScore, reverse=True)
    for i in range(0, len(emotions)):
        emotions[i]["score"] = formatScoreString(emotions[i]["score"])
    return jsonify(emotions)

if __name__ == '__main__':
    app.run(debug=True)