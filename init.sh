#!/bin/bash

apt update
apt install python3 python3-pip python3-venv

chmod +x launch.sh

python3 -m venv env
env/bin/pip install --no-cache-dir -r requirements.txt

ln -s /usr/local/lib/inu_sanzai/launch.sh /usr/local/bin/launch.sh
ln -s /usr/local/lib/inu_sanzai/inu_sanzai.service /etc/systemd/system/inu_sanzai.service

chmod +x /usr/local/bin/launch.sh
