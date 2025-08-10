set -e

function parseValue () {
  printf "%s\n" "$1" | envsubst
}
function debugPrint() {
  if [[ $ENV_DEBUG ]];then
    echo $1 1>&2
  fi
}

ENV=$(env)

echo $ENV | awk -v key="NAME" -v RS=' ' '$0 ~ "(^)" key "=" '

function load_variables {
  for key in $(yq e "explode(.) | $1 | keys|.[]" "$2"); do
    object=$(yq e "explode(.) | .environment.default.variables * .environment.local.variables | .$key | tag == \"!!map\"" env.yaml)
    array=$(yq e "explode(.) | .environment.default.variables * .environment.local.variables | .$key | tag == \"!!seq\"" env.yaml)
    if [[ $object = "true" || $array == "true" ]]; then
      # convert object and array values into a single line json string
      value=$(yq e "explode(.) | $1 | .$key" "$2" -o json -I 0)
    else
      # handle scalar values
      rawValue=$(yq e "explode(.) | $1 | .$key" "$2")
      value=$(echo $rawValue | awk -F"|" '{print $1}')
      function=$(echo $rawValue | awk -F"|" '{for (i=2; i<=NF; i++) printf $i}' )

      # functions are only supported when using scalar values
      if [[ $(echo $ENV | awk -v key="$key" -v RS=' ' '$0 ~ "(^)" key "=" ') ]]; then
        debugPrint "Using environment variable $key, instead of the value given in $2 file"
        value=$(echo $ENV | awk -v key="$key" -v RS=' ' '$0 ~ "(^)" key "=" ' | cut -d"=" -f2)
      elif [[ "$function" ]]; then
        value=$(parseValue "$value" | eval $function)
      else
        value=$(parseValue "$value")
      fi
      debugPrint "$key=$value"
    fi

    if [[ -z $value ]];then
      echo "⚠ Empty environment variable found: $key" 1>&2
    fi

    export "$key=$value"
    echo "$key=$value"
  done;
}
