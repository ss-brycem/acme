#!/bin/bash

# https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euxo pipefail

# Make sure we were given a ref to compare
if [ -z "$COMMIT_SHA" ]; then
    echo "I need a commit to compare against!"
    exit 1
fi

GIT_DIR=$(pwd) # So we can return later
TMP_DIR=$(mktemp -d)

# Find out what changed
LAST_DEPLOY=$(git tag | grep ^deploy- | sort -r | head -n 1)
git diff --name-only --output=$TMP_DIR/changed.txt $LAST_DEPLOY $COMMIT_SHA

# We want to handle Files and Objects separately
cat $TMP_DIR/changed.txt |
    grep -F 'src/FileCabinet' |
    tee $TMP_DIR/filecabinet.txt ||
    true
cat $TMP_DIR/filecabinet.txt >>$TMP_DIR/check.txt

cat $TMP_DIR/changed.txt |
    grep -F 'src/Objects/customscript' |
    tee $TMP_DIR/objects.txt ||
    true
cat $TMP_DIR/objects.txt >>$TMP_DIR/check.txt

# If we don't care about the files that have changed, then exit
if [ $(cat $TMP_DIR/check.txt | wc -l) -eq 0 ]; then
    echo "No deployable files changed."
    exit 0
else
    echo "Comparing files changed in $COMMIT_SHA..."
fi

cp src/manifest.xml $TMP_DIR/manifest.xml
cp src/project.json $TMP_DIR/project.json

cd $TMP_DIR
mkdir Objects
cat ./filecabinet.txt |
    sed 's/src\/FileCabinet//' |
    parallel "suitecloud file:import --excludeproperties --paths {}"

cat ./objects.txt |
    sed -rn 's/^src\/Objects\/(.*)\.xml$/\1/p' |
    parallel "suitecloud object:import --excludefiles --type ALL --destinationfolder '/Objects' --scriptid {}"

cd $GIT_DIR

CONFLICT=0

while read -r file; do
    if [ -f "$file" ]; then
        NS_FILE="$(echo $file | sed 's/src\///g')"

        DIFF=$(
            git show "$LAST_DEPLOY:$file" |
                diff -qZBE "$TMP_DIR/$NS_FILE" - |
                wc -l
        ) || true

        if [ $DIFF -gt 0 ]; then
            echo "Conflict found in $file"
            echo $file >>$TMP_DIR/conflicts.txt
            CONFLICT=1
        fi
    else
        echo "$file doesn't seem to be a file"
        exit 1
    fi
done < <(cat $TMP_DIR/check.txt)

if [ $CONFLICT -eq 1 ]; then
    echo "Aborting deploy due to conflicts. Please resolve manually."
    echo ::group:: Conflicts found:
    cat $TMP_DIR/conflicts.txt
    echo ::endgroup::
    exit 1
else
    echo "No conflicts found. Hooray!"
fi
