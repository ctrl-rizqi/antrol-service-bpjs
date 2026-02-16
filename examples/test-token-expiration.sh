#!/bin/bash

# Token Expiration Testing Script
# This script helps test the token expiration handling functionality

API_BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

echo "=== TOKEN EXPIRATION TESTING ==="
echo "API Base URL: $API_BASE_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Function to test login
test_login() {
    echo "1. Testing Login..."
    
    # Replace with actual test credentials
    USERNAME="admin"
    PASSWORD="admin123"
    
    response=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
    
    token=$(echo $response | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    
    if [ -n "$token" ]; then
        echo "✅ Login successful"
        echo "📝 Token received (first 50 chars): ${token:0:50}..."
        echo "$token" > test-token.txt
    else
        echo "❌ Login failed"
        echo "Response: $response"
        exit 1
    fi
    echo ""
}

# Function to test token refresh
test_token_refresh() {
    echo "2. Testing Token Refresh..."
    
    if [ -f "test-token.txt" ]; then
        token=$(cat test-token.txt)
        
        response=$(curl -s -X POST "$API_BASE_URL/api/auth/refresh" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token")
        
        new_token=$(echo $response | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
        
        if [ -n "$new_token" ]; then
            echo "✅ Token refresh successful"
            echo "📝 New token received (first 50 chars): ${new_token:0:50}..."
            echo "$new_token" > test-token-refreshed.txt
        else
            echo "❌ Token refresh failed"
            echo "Response: $response"
        fi
    else
        echo "❌ No token file found. Run login test first."
    fi
    echo ""
}

# Function to test protected endpoint
test_protected_endpoint() {
    echo "3. Testing Protected Endpoint..."
    
    if [ -f "test-token.txt" ]; then
        token=$(cat test-token.txt)
        
        response=$(curl -s -X GET "$API_BASE_URL/api/auth/me" \
            -H "Authorization: Bearer $token")
        
        success=$(echo $response | grep -o '"success":true')
        
        if [ -n "$success" ]; then
            echo "✅ Protected endpoint accessible"
            echo "📋 User data received"
        else
            echo "❌ Protected endpoint access failed"
            echo "Response: $response"
        fi
    else
        echo "❌ No token file found. Run login test first."
    fi
    echo ""
}

# Function to decode and check token
decode_token() {
    echo "4. Decoding Token..."
    
    if [ -f "test-token.txt" ]; then
        token=$(cat test-token.txt)
        
        # Decode JWT payload (second part)
        payload=$(echo $token | cut -d'.' -f2)
        
        # Add padding if needed and decode
        payload_length=$(echo -n $payload | wc -c)
        remainder=$((payload_length % 4))
        
        if [ $remainder -eq 2 ]; then
            payload="${payload}=="
        elif [ $remainder -eq 3 ]; then
            payload="${payload}="
        fi
        
        decoded=$(echo $payload | base64 -d 2>/dev/null || echo $payload | base64 -D 2>/dev/null)
        
        if [ -n "$decoded" ]; then
            echo "✅ Token decoded successfully"
            echo "📋 Payload:"
            echo "$decoded" | jq '.' 2>/dev/null || echo "$decoded"
            
            # Extract expiration time
            exp=$(echo $decoded | jq -r '.exp' 2>/dev/null)
            if [ "$exp" != "null" ] && [ -n "$exp" ]; then
                current_time=$(date +%s)
                time_left=$((exp - current_time))
                
                if [ $time_left -gt 0 ]; then
                    hours=$((time_left / 3600))
                    minutes=$(((time_left % 3600) / 60))
                    echo "⏰ Token expires in: ${hours}h ${minutes}m"
                else
                    echo "⚠️  Token has expired!"
                fi
            fi
        else
            echo "❌ Failed to decode token"
        fi
    else
        echo "❌ No token file found. Run login test first."
    fi
    echo ""
}

# Function to test frontend integration
test_frontend_integration() {
    echo "5. Testing Frontend Integration..."
    echo "🌐 Open $FRONTEND_URL in your browser"
    echo "🔍 Check for:"
    echo "   - Token status badge in header"
    echo "   - Auto refresh when token expires"
    echo "   - Warning popup when token about to expire"
    echo "   - Manual refresh button functionality"
    echo ""
}

# Function to clean up test files
cleanup() {
    echo "6. Cleaning up test files..."
    rm -f test-token.txt test-token-refreshed.txt
    echo "✅ Cleanup completed"
    echo ""
}

# Main menu
show_menu() {
    echo "=== TEST MENU ==="
    echo "1. Test Login"
    echo "2. Test Token Refresh"
    echo "3. Test Protected Endpoint"
    echo "4. Decode Token"
    echo "5. Test Frontend Integration"
    echo "6. Cleanup"
    echo "7. Run All Tests"
    echo "0. Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Select test to run: " choice
    
    case $choice in
        1)
            test_login
            ;;
        2)
            test_token_refresh
            ;;
        3)
            test_protected_endpoint
            ;;
        4)
            decode_token
            ;;
        5)
            test_frontend_integration
            ;;
        6)
            cleanup
            ;;
        7)
            test_login
            test_protected_endpoint
            test_token_refresh
            decode_token
            test_frontend_integration
            ;;
        0)
            echo "Exiting..."
            cleanup
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
    
    echo "Press Enter to continue..."
    read
    clear
done