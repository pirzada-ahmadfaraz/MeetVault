#!/bin/bash

# Script to remove Claude signatures from commit messages
git filter-branch --msg-filter '
    sed "s/🤖 Generated with \[Claude Code\](https:\/\/claude\.ai\/code)//g" |
    sed "s/Co-Authored-By: Claude <noreply@anthropic\.com>//g" |
    sed "/^$/d"
' --force -- --all