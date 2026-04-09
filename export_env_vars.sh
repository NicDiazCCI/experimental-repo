#!/bin/bash

# Export all environment variables
# This script displays all current environment variables in export format

echo "#!/bin/bash"
echo ""
echo "# Environment variables exported on $(date)"
echo ""

# Get all environment variables and format them as export statements
while IFS='=' read -r -d '' key value; do
    # Escape special characters in the value
    escaped_value=$(printf '%s' "$value" | sed "s/'/'\\\\''/g")
    echo "export $key='$escaped_value'"
done < <(env -0)
