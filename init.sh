#!/bin/bash

chmod +x launch.sh

pip install --no-cache-dir -r requirements.txt

ln -s launch.sh /usr/local/bin/launch.sh
