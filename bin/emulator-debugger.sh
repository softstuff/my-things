#!/usr/bin/env sh
set -eu

clear

export USE_FIREBASE_EMULATOR=true
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000
export FUNCTIONS_EMULATOR_HOST=localhost:5001
export NGROK_URL=https://ac1102ffa2b3.eu.ngrok.io
export GOOGLE_APPLICATION_CREDENTIALS=/home/stefan/Dev/my-things/my-things-60357-3b7621d38ba5.json

npm run emulator:debugger
