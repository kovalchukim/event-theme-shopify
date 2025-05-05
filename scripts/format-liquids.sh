files=$(git diff --name-only | grep -E '\.liquid$')

if [[ -n "$files" ]]; then
  prettier --write $files
else
  echo "No .liquid files to format."
fi
