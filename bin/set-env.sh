#!/usr/bin/env sh
set -eu

export USE_FIREBASE_EMULATOR="true"
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export NGROK_URL=https://ac1102ffa2b3.eu.ngrok.io



