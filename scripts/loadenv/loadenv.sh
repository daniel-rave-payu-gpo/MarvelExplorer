#!/bin/bash -fe
SEPARATOR="######"
USAGE="Usage:\n
loadenv.sh -f <yaml file> [-o output file] [-s stage] [-j job] [-d] [-c]\n\n\

Options:\n
-o dotenv output file
-s apply variables of the given stage\n
-j apply variables of the given job\n
-d print resulting environment variables. it's also possible to set the ENV_DEBUG environment variable to true in the GITLAB variables UI to enable this\n
-c simulate CI when running locally, so variables.local and cicd.local won't be loaded (-s and -j must be supplied to fully simulate CI)\n
-h help\n\n

Notice:\n
.dotenv files can be exported to an environment variables using the command 'export \$(cat .env)',\n    or to yaml using the command 'yq -p=props .env'"

source $(dirname "$0")/utils.sh
source $(dirname "$0")/helpers.sh

if [[ ! $(which yq) ]];then
  echo "ERROR: missing yq command"
  exit 1
fi
if [[ ! $(which envsubst) ]];then
  echo "ERROR: missing envsubst command"
  exit 1
fi

#####################################################
# Gathering options
while getopts 'f:o:s:j:dch' opt; do
  case "$opt" in
    c)
      # simulate CI when running locally
      SIMULATE_CI=true
      ;;
    f)
      # input file, should be a yaml
      if [[ ! -f $OPTARG ]];then
        echo "ERROR: File not found $OPTARG"
        exit 1
      fi
      INPUT_FILE=$OPTARG
      ;;
    o)
      # output file
      OUTPUT_FILE=$OPTARG
      ;;
    s)
      # defines the stage
      STAGE=$OPTARG
      STAGE_VARIABLES=$(yq e '.environment["'"$STAGE"'"].variables' $INPUT_FILE)
      ;;
    j)
      # defines the job
      JOB="$OPTARG"
      JOB_VARIABLES=$(yq e '.environment["'"$STAGE"'"]["'"$JOB"'"].variables' $INPUT_FILE)
      ;;
    d)
      ENV_DEBUG=true
      ;;
    ?|h)
      echo -e $USAGE
      exit
      ;;
  esac
done
shift "$(($OPTIND -1))"

#####################################################
# Applying defaults and validations
if [[ ! $INPUT_FILE ]];then
  echo "ERROR: argument is missing: -f <file>"
  echo $USAGE
  exit 1
fi
if [[ ! $OUTPUT_FILE ]];then
  OUTPUT_FILE=.env
fi
if [[ $STAGE ]];then
  echo "STAGE: $STAGE"
fi
if [[ $JOB ]];then
  echo "JOB: $JOB"
fi

if [[ -z $CI ]]; then
  # defines whether we run locally and init required gitlab variables
  export CI_COMMIT_REF_SLUG=$(git rev-parse --abbrev-ref HEAD | sed -E "s![^A-Za-z0-9]!-!g")
  export CI_COMMIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  export CI_DEFAULT_BRANCH=master
  export CI_COMMIT_SHA=$(git log -1 --pretty=format:"%h")
  export CI_PROJECT_NAME=$(basename $(git rev-parse --show-toplevel) | tail -1)
  export CI_REGISTRY_IMAGE=$(
    git config --get remote.origin.url |
        sed 's|git@git.zooz.co:|docker-registry.zooz.co:4567/|' |
        sed 's|.git||' |
        tr -s "[:upper:]" "[:lower:]"
  )
  if [[ -z $SIMULATE_CI ]];then
    export MESSAGES_CALLBACKS_URL=$(npm run --silent ngrok-session $PORT)/v1/callbacks
    LOCAL_VARIABLES=$(yq e '.environment.local.variables' $INPUT_FILE)
    CICD_LOCAL_VARIABLES=$(yq e '.cicd.local.variables' $INPUT_FILE)
  fi
fi

#####################################################
# Load environment variables
echo "✓ Loading environment varialbes..."

# Load default variables
DEFAULT_VARIABLES=$(yq e '.environment.default.variables' $INPUT_FILE)
if [[ $DEFAULT_VARIABLES && $DEFAULT_VARIABLES != null ]];then
  echo "✓ Default variables found"
  DEFAULT_PATH='.environment.default.variables'
fi
# Load stage variables
if [[ $STAGE_VARIABLES && $STAGE_VARIABLES != null  ]];then
  echo "✓ Stage variables found"
  STAGE_PATH='.environment["'"$STAGE"'"].variables'
fi
# Load job variables
if [[ $JOB_VARIABLES && $JOB_VARIABLES != null ]];then
  echo "✓ Job variables found"
  JOB_PATH='.environment["'"$STAGE"'"]["'"$JOB"'"].variables'
fi
# Load local variables
if [[ $LOCAL_VARIABLES && $LOCAL_VARIABLES != null ]];then
  echo "✓ Local variables found"
  LOCAL_PATH='.environment.local.variables'
fi

# Merge and save variables
echo "✓ Merging environment variables..."
VARIABLES=$(
  echo "$DEFAULT_PATH$SEPARATOR$STAGE_PATH$SEPARATOR$JOB_PATH$SEPARATOR$LOCAL_PATH" | \
  sed -E "s/(^$SEPARATOR{1,}|($SEPARATOR){1,}$)//g" | \
  sed -E "s/($SEPARATOR){1,}/ \* /g"

)

load_variables "$VARIABLES" "$INPUT_FILE" > $OUTPUT_FILE

echo "✓ dotenv file was saved successfully: $OUTPUT_FILE"

#####################################################
# Load CICD variables
echo "✓ Loading environment variables..."

# Load default CICD variables
CICD_VARIABLES=$(yq e '.cicd.default.variables' $INPUT_FILE)
if [[ $CICD_VARIABLES && $CICD_VARIABLES != null ]];then
  echo "✓ Default cicd variables found"
  CICD_PATH=".cicd.default.variables"
fi
# Load branch variables
if [[ $CI_COMMIT_TAG ]];then
  BRANCH=tag
elif [[ $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH ]];then
  BRANCH=master
else
  BRANCH=branch
fi
BRANCH_VARIABLES=$(yq e '.cicd["'"$BRANCH"'"].variables' $INPUT_FILE)
if [[ $BRANCH_VARIABLES && $BRANCH_VARIABLES != null ]];then
  echo "✓ $BRANCH variables found"
  BRANCH_PATH=".cicd.$BRANCH.variables"
fi
# Load local variables
if [[ $CICD_LOCAL_VARIABLES && $CICD_LOCAL_VARIABLES != null ]];then
  echo "✓ Local variables found"
  LOCAL_PATH='.cicd.local.variables'
fi

# Merge and save variables
echo "✓ Merging cicd variables..."
VARIABLES=$(
  echo "$CICD_PATH$SEPARATOR$BRANCH_PATH$SEPARATOR$LOCAL_PATH" | \
  sed -E "s/(^$SEPARATOR{1,}|($SEPARATOR){1,}$)//g" | \
  sed -E "s/($SEPARATOR){1,}/ \* /g"
)
load_variables "$VARIABLES" "$INPUT_FILE" >> $OUTPUT_FILE
echo "✓ dotenv file was saved successfully: $OUTPUT_FILE"

echo "✓ Done"

if [[ $ENV_DEBUG == true ]];then
  cat $OUTPUT_FILE
fi
