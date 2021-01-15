#!/usr/bin/env sh
set -eu

clear

export USE_FIREBASE_EMULATOR="true"
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FUNCTIONS_EMULATOR_HOST="localhost:5001"

npm run emulator


