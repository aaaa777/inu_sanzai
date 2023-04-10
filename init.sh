#!/bin/bash

chmod +x launch.sh

pip install --no-cache-dir -r requirements.txt

ln -s $PWD/launch.sh /usr/local/bin/launch.sh
ln -s $PWD/inu_sanzai.service /etc/systemd/system/inu_sanzai.service

chmod +x /usr/local/bin/launch.sh
