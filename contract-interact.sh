#!/bin/bash

# Contract Interaction Tool for Avalanche, Base, and Ethereum
# Usage: ./contract-interact.sh

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source utility functions
source "$SCRIPT_DIR/scripts/utils.sh"
source "$SCRIPT_DIR/scripts/checks.sh"
source "$SCRIPT_DIR/scripts/selections.sh"

# Main interactive flow
main() {
    print_info "🚀 Contract Interaction Tool"
    print_info "Supports Avalanche, Base, and Ethereum networks"
    echo ""
    
    # Check prerequisites
    check_node
    check_dependencies
    load_env
    check_mnemonic
    check_alchemy_key
    
    # Network selection
    network=$(select_network)
    
    # Contract address
    echo ""
    contract_address=$(select_contract_address "$network")
    
    if [ -z "$contract_address" ]; then
        print_error "No contract address provided"
        exit 1
    fi
    
    # ABI file selection
    echo ""
    print_info "Do you have an ABI file for this contract?"
    echo "1) Yes, I have an ABI file"
    echo "2) No, I'll provide function signature manually"
    echo ""
    read -p "Select option (1-2): " abi_choice
    
    case $abi_choice in
        1) 
            echo ""
            abi_file=$(select_abi_file)
            if [ -z "$abi_file" ]; then
                print_error "No ABI file selected"
                exit 1
            fi
            print_info "Selected ABI file: $(basename "$abi_file")"
            function_name=""  # Will be selected interactively from ABI
            ;;
        2) 
            abi_file=""
            function_name="" # Will be asked as signature
            ;;
        *) 
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Call the Node.js script
    print_info "Calling contract function..."
    node "$SCRIPT_DIR/src/index.js" "$network" "$contract_address" "$abi_file" "$function_name"
}

# Run the main function
main "$@"
