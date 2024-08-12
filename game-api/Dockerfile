# Базовый образ с Python 3.7
FROM python:3.7-slim-buster

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y     curl     git     build-essential     cmake     wget     ca-certificates     g++     python3-dev     && rm -rf /var/lib/apt/lists/*

# Обновление сертификатов
RUN update-ca-certificates

# Установка Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Обновление pip и установка необходимых Python пакетов
RUN pip3 install --upgrade pip &&     pip install --no-cache-dir pybind11 numpy

# Установка PyTorch (версия, совместимая с Python 3.7)
RUN pip3 install torch==1.8.1+cpu torchvision==0.9.1+cpu torchaudio==0.8.1 -f https://download.pytorch.org/whl/torch_stable.html

# Попытка установки llama-cpp-python
RUN pip install --no-cache-dir llama-cpp-python

# Если предыдущая команда не сработает, раскомментируйте следующую:
# RUN pip install --no-cache-dir llama-cpp-python==0.1.48

# Создание рабочей директории
WORKDIR /usr/src/app

# Копирование файлов проекта
COPY package*.json ./
RUN npm ci
COPY . .

# Установка дополнительных Python зависимостей
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Копирование модели и описания игры
COPY models/llama-2-7b-chat-hf-q4_k_m.gguf /usr/src/app/models/
COPY game_description.txt /usr/src/app/

# Проверка наличия необходимых файлов
RUN ls -l /usr/src/app/models/llama-2-7b-chat-hf-q4_k_m.gguf &&     ls -l /usr/src/app/game_description.txt

# Открытие порта
EXPOSE 3008

# Запуск приложения
CMD ["node", "server.js"]