#!/bin/bash

echo "pulling changes and building"
git pull
yarn
yarn build

echo "removing old version and copying new"
sudo rm -rf /opt/livetl-editor/*
sudo cp -r ./dist/* /opt/livetl-editor/
sudo chown -R www-data:www-data /opt/livetl-docs/

echo "done"
