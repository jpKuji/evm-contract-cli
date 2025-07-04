#!/bin/bash

# Prerequisite checks for the contract interaction tool

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
}

# Load environment variables from .env file
load_env() {
    if [ -f ".env" ]; then
        print_info "Loading environment variables from .env file..."
        # Source the .env file to properly handle quoted values
        set -a
        source .env
        set +a
    fi
}

# Check if mnemonic is set
check_mnemonic() {
    if [ -z "$MNEMONIC" ]; then
        print_error "MNEMONIC not found in environment or .env file."
        print_info "Please either:"
        print_info "1. Create a .env file with: MNEMONIC=\"your mnemonic phrase here\""
        print_info "2. Or set environment variable: export MNEMONIC=\"your mnemonic phrase here\""
        exit 1
    fi
}

# Check if Alchemy API key is set
check_alchemy_key() {
    if [ -z "$ALCHEMY_API_KEY" ]; then
        print_error "ALCHEMY_API_KEY not found in environment or .env file."
        print_info "Please add your Alchemy API key to the .env file:"
        print_info "ALCHEMY_API_KEY=\"your-alchemy-api-key-here\""
        exit 1
    fi
}
