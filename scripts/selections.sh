#!/bin/bash

# Selection functions for network, contract address, and ABI file

# Function to select network
select_network() {
    print_info "Available networks:" >&2
    echo "1) Ethereum Mainnet" >&2
    echo "2) Avalanche C-Chain" >&2
    echo "3) Base Mainnet" >&2
    echo "" >&2
    read -p "Select network (1-3): " network_choice >&2
    
    case $network_choice in
        1) echo "ethereum" ;;
        2) echo "avalanche" ;;
        3) echo "base" ;;
        *) print_error "Invalid network choice" >&2; exit 1 ;;
    esac
}

# Function to select contract address
select_contract_address() {
    local network=$1
    local addresses_file="./constants/addresses.json"
    
    # Check if addresses file exists
    if [ ! -f "$addresses_file" ]; then
        print_warning "No addresses file found at $addresses_file" >&2
        echo "" >&2
        read -p "Enter contract address: " contract_address >&2
        echo "$contract_address"
        return
    fi
    
    # Check if node is available to parse JSON properly
    if ! command -v node &> /dev/null; then
        print_warning "Node.js not available for JSON parsing. Using manual input." >&2
        echo "" >&2
        read -p "Enter contract address: " contract_address >&2
        echo "$contract_address"
        return
    fi
    
    print_info "Available contract addresses for $network:" >&2
    
    # Create a temporary Node.js script to parse JSON
    cat > /tmp/parse_addresses.js << EOF
const fs = require('fs');
const network = process.argv[2];
try {
    const data = JSON.parse(fs.readFileSync('./constants/addresses.json', 'utf8'));
    const networkData = data[network];
    if (networkData && typeof networkData === 'object') {
        Object.entries(networkData).forEach(([label, address], index) => {
            console.log(\`\${index + 1}|\${label}|\${address}\`);
        });
    }
} catch (error) {
    // Silent error handling
}
EOF
    
    # Run the script and capture output
    local network_data=$(node /tmp/parse_addresses.js "$network" 2>/dev/null)
    
    # Filter out only the lines that contain the pipe separator (actual data)
    local filtered_data=$(echo "$network_data" | grep '|' || true)
    
    # Clean up
    rm -f /tmp/parse_addresses.js
    
    if [ -z "$filtered_data" ]; then
        print_warning "No addresses found for network: $network" >&2
        echo "" >&2
        read -p "Enter contract address: " contract_address >&2
        echo "$contract_address"
        return
    fi
    
    # Parse and display addresses
    declare -a labels=()
    declare -a addresses=()
    local counter=1
    
    # Process each line from the Node.js output
    while IFS='|' read -r index label address; do
        if [ -n "$label" ] && [ -n "$address" ]; then
            labels+=("$label")
            addresses+=("$address")
            echo "$counter) $label - $address" >&2
            ((counter++))
        fi
    done <<< "$filtered_data"
    
    # If no addresses were found, ask for custom input
    if [ ${#addresses[@]} -eq 0 ]; then
        print_warning "No addresses found for network: $network" >&2
        echo "" >&2
        read -p "Enter contract address: " contract_address >&2
        echo "$contract_address"
        return
    fi
    
    echo "$counter) Custom address" >&2
    echo "" >&2
    
    read -p "Select contract address (1-$counter): " address_choice >&2
    
    # Validate choice
    if [[ ! "$address_choice" =~ ^[0-9]+$ ]] || [ "$address_choice" -lt 1 ] || [ "$address_choice" -gt "$counter" ]; then
        print_error "Invalid address selection" >&2
        exit 1
    fi
    
    # Return selected address or ask for custom
    if [ "$address_choice" -eq "$counter" ]; then
        echo "" >&2
        read -p "Enter custom contract address: " custom_address >&2
        echo "$custom_address"
    else
        local selected_address="${addresses[$((address_choice - 1))]}"
        print_info "Selected: ${labels[$((address_choice - 1))]} - $selected_address" >&2
        echo "$selected_address"
    fi
}

# Function to select ABI file
select_abi_file() {
    local abi_files=(./abis/*.json)
    
    # Check if any ABI files exist
    if [ ! -e "${abi_files[0]}" ]; then
        print_error "No ABI files found in ./abis/ directory" >&2
        print_info "Please place your ABI files in the ./abis/ directory" >&2
        exit 1
    fi
    
    print_info "Available ABI files:" >&2
    for i in "${!abi_files[@]}"; do
        local filename=$(basename "${abi_files[$i]}")
        echo "$((i + 1))) $filename" >&2
    done
    
    echo "" >&2
    read -p "Select ABI file (1-${#abi_files[@]}): " abi_choice_num >&2
    
    # Validate choice
    if [[ ! "$abi_choice_num" =~ ^[0-9]+$ ]] || [ "$abi_choice_num" -lt 1 ] || [ "$abi_choice_num" -gt "${#abi_files[@]}" ]; then
        print_error "Invalid ABI file selection" >&2
        exit 1
    fi
    
    # Return selected file path
    echo "${abi_files[$((abi_choice_num - 1))]}"
}
