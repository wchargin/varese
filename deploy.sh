#!/bin/bash

set -e

# Disable this if you've already run 'npm build'.
: "${BUILD:=true}"

# Explode the contents of this directory,
# and the stage the following enclosed files and folders.
EXPLODE=dist
STAGE=(
    bundle.js
    bundle.js.map
    fonts/
    index.html
    styles/
)

# Adapted from:
# https://github.com/git/git/blob/8d530c4d64ffcc853889f7b385f554d53db375ed/git-sh-setup.sh#L207-L222
ensure_clean_working_tree() {
    local err=0
    if ! git diff-files --quiet --ignore-submodules; then
        echo >&2 "Cannot deploy: You have unstaged changes."
        err=1
    fi
    if ! git diff-index --cached --quiet --ignore-submodules HEAD -- ; then
        if [[ "$err" -eq 0 ]]; then
            echo >&2 "Cannot deploy: Your index contains uncommitted changes."
        else
            echo >&2 "Additionally, your index contains uncommitted changes."
        fi
        err=1
    fi
    if [[ "$err" -ne 0 ]]; then
        exit "$err"
    fi
}

ensure_no_stopships() {
    if git grep -n -i "STOPSHIP" -- './*' ':!deploy.sh'; then
        echo >&2 "Cannot deploy: STOPSHIP annotations remain."
        exit 1
    fi
}

prompt() {
    >&2 printf '%s\n' "$1"
    >&2 printf 'yes/no> '
    read line
    if [[ "$line" != "yes" ]]; then
        >&2 printf '%s\n' "Aborting!"
    fi
    printf '%s' "$line"
}

if [[ "$(git rev-parse --abbrev-ref HEAD)" != "master" ]]; then
    msg="You're not on 'master'. Do you want to go there now?"
    if [[ "$(prompt "$msg")" != "yes" ]]; then
        exit 0
    else
        git checkout master
    fi
fi

ensure_clean_working_tree
ensure_no_stopships

SOURCE_COMMIT="$(git rev-parse HEAD)"
printf 'Preparing to deploy commit %s.\n' "$SOURCE_COMMIT"

TMPDIR="$(mktemp -d)"
printf 'Temporary directory: %s\n' "$TMPDIR"

if [[ "$BUILD" == "true" ]]; then
    npm run build
else
    printf '%s\n' "Warning: skipping build."
fi
cp -r "$EXPLODE"/* "$TMPDIR"

git checkout gh-pages
cp -r "$TMPDIR"/* .
git add "${STAGE[@]}"
git commit --no-verify -m "Deploy: $SOURCE_COMMIT"

echo
msg="Please review the build output (index.html) now. Do you want to deploy?"
if [[ "$(prompt "$msg")" == "yes" ]]; then
    git push origin gh-pages
fi

git checkout master
rm -rf "$TMPDIR"
