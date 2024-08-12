from llama_cpp import Llama
import sys
import json
import os

# Загрузка описания игры
game_description_path = os.path.join(os.path.dirname(__file__), 'game_description.txt')
with open(game_description_path, 'r', encoding='utf-8') as f:
    game_description = f.read()

# Путь к модели относительно текущего скрипта
model_path = os.path.join(os.path.dirname(__file__), 'models', 'llama-2-7b-chat-hf-q4_k_m.gguf')

llm = Llama(model_path=model_path, n_ctx=2048, n_batch=512, verbose=False)

def generate_response(prompt):
    full_prompt = f"""Контекст: {game_description}

Вопрос: {prompt}

Отвечай на основе предоставленной информации о игре. Если информации недостаточно, скажи об этом."""

    output = llm(full_prompt, max_tokens=400, temperature=0.7, stop=["[/INST]"])
    return output['choices'][0]['text'].strip()

if __name__ == "__main__":
    prompt = sys.argv[1]
    response = generate_response(prompt)
    print(json.dumps({"response": response}))
