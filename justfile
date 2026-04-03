set shell := ["bash", "-cu"]
set windows-shell := ["pwsh", "-Command"]

tsc := "pnpm exec tsc"
biome := "pnpm exec biome"
gqty := "pnpm exec gqty"
intlayer := "pnpm exec intlayer"
expo := "pnpm exec expo"
eas := "pnpm exec eas"
serve := "pnpm exec serve"

# Default action
_:
    just --list -u

# Install
i:
    pnpm install

# Install with frozen-lockfile
if:
    pnpm install --frozen-lockfile

# Fix dependencies
fix:
    pnpm exec expo install --fix

# Upgrade dependencies
up:
    pnpm up --interactive --latest --recursive

# Expo prebuild
prebuild:
    {{expo}} prebuild

# Prepare gqty
gqty:
    {{gqty}} \
        --react \
        --target ./.gqty/index.ts \
        --typescript \
        https://sch-api.alpheus.day/graphql

# Prepare intlayer
int:
    {{intlayer}} build

# Prepare dependencies
pre:
    just prebuild
    just gqty
    just int

# Format code
fmt:
    {{biome}} check --write .

# Lint code with ls-lint
lslint:
    cd ./src && ls-lint -config ../.ls-lint.yaml

# Lint code with typos-cli
typos:
    typos

# Lint code with TypeScript Compiler
tsc:
    {{tsc}} --noEmit

# Lint code
lint:
    just lslint
    just typos
    just tsc

# Lint code with Biome
lint-biome:
    {{biome}} lint .

# Check code
check:
    just fmt
    just lint

# Start development server
dev:
    {{expo}} start --clear --port 3001

# Web export
web:
    {{expo}} export --platform web --clear

# Web minify
minify:
    node ./scripts/minify.ts

# Build for Web
build:
    just web
    just minify

# Start web preview
preview:
    {{serve}} ./dist -p 3000

# Build for Android
android:
    {{eas}} build --platform android --local --profile apk

# Build for iOS
ios:
    {{eas}} build --platform ios --local --profile ipa

# Clean builds (Linux)
clean-linux:
    rm -rf ./dist

# Clean builds (macOS)
clean-macos:
    just clean-linux

# Clean builds (Windows)
clean-windows:
    Remove-Item -Recurse -Force ./dist

# Clean
clean:
    just clean-{{os()}}

# Clean everything (Linux)
clean-all-linux:
    just clean

    rm -rf ./expo-env.d.ts
    rm -rf ./.expo
    rm -rf ./.intlayer
    rm -rf ./.gqty
    rm -rf ./node_modules

# Clean everything (macOS)
clean-all-macos:
    just clean-all-linux

# Clean everything (Windows)
clean-all-windows:
    just clean

    Remove-Item -Recurse -Force ./expo-env.d.ts
    Remove-Item -Recurse -Force ./.expo
    Remove-Item -Recurse -Force ./.intlayer
    Remove-Item -Recurse -Force ./.gqty
    Remove-Item -Recurse -Force ./node_modules

# Clean everything
clean-all:
    just clean-all-{{os()}}
