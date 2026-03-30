set shell := ["bash", "-cu"]
set windows-shell := ["pwsh", "-Command"]

tsc := "pnpm exec tsc"
biome := "pnpm exec biome"
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

# Prepare dependencies
pre:
    {{intlayer}} build

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

# Build for web
web:
    {{expo}} export --platform web --clear

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

    rm -rf ./node_modules

# Clean everything (macOS)
clean-all-macos:
    just clean-all-linux

# Clean everything (Windows)
clean-all-windows:
    just clean

    Remove-Item -Recurse -Force ./node_modules

# Clean everything
clean-all:
    just clean-all-{{os()}}
