#!/bin/bash

# Script to export all environment variables
# This script prints all current environment variables in export format

echo "#!/bin/bash"
echo "# Environment variables export script"
echo "# Generated on $(date)"
echo ""

# Export all environment variables
env | sort | while IFS='=' read -r name value; do
    # Escape special characters in the value
    # Use printf %q to properly quote the value
    printf "export %s=%q\n" "$name" "$value"
done
