#!/bin/bash
# Find files without corresponding test files.
# Exit with '1' if there are any such files, or '0' otherwise.

SRC='s:^src/::'
TEST='s:^test/::'
SUFFIX='s:Test\(\.[a-z]\+\)$:\1:'

OUTPUT="$(mktemp)"
comm -23 \
    <(find src  -type f | sed -e "$SRC" | sort) \
    <(find test -type f | sed -e "$TEST" -e "$SUFFIX" | sort) | tee "$OUTPUT"

RETURN_VALUE=0
if [[ -s "$OUTPUT" ]]; then
    RETURN_VALUE=1
fi

rm "$OUTPUT"

exit $RETURN_VALUE
