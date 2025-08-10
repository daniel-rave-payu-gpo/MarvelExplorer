# Replace a char within a string
# Example: Replace all dashes with underscore
# KEYSPACE: $CI_PROJECT_NAME | replace - _
function replace() {
  tr $1 $2
}

# Convert a string to lower case
# Example:
# NAME: $CI_PROJECT_NAME | lower
function lower() {
  tr '[:upper:]' '[:lower:]'
}

function default() {
    if [[ -z $1 ]]; then
        echo $2
    else
        echo $1
    fi
}
# Convert a string to upper case
# Example:
# NAME: $CI_PROJECT_NAME | upper
function upper() {
  tr '[:lower:]' '[:upper:]'
}

# Truncate a string
# Example: Truncate to 50 chars
# CHART_NAME: review-$CI_COMMIT_REF_SLUG | trunc 50
function trunc() {
  cut -c1-$1
}

function trim() {
  sed -E "s/^$1*|$1*$//g"
}

function hash() {
sha1sum | cut -c1-40
}
