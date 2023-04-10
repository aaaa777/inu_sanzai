from python:3

workdir /usr/src/app

copy main.py ./
copy requirements.txt
 ./

run pip install --no-cache-dir -r requirements.txt \
 && 