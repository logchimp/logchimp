#!/bin/bash

######################################################
# This script should work for any repository which uses Git version control.
#
# How to use this bash script?
# It is recommend to use a specific directory structure for this script to work BEST.
#
# Whenever you clone/download the Git repository for the very first time,
# following this directory structure
#
# Assume you do coding in this directory `/home/<user>/code`.
# This is how the directory structure should look like:
#
# /code/
#      /<organisation-name>
#           /<repository-name>
#
# After creating the directory structure in above format.
#
# ```
# cd /home/<user>/code/<organisation-name>/<repository-name>
# git clone <remote-repository-url> <default-branch-name>
# ```
#
# Usage
# ./worktree-setup.sh feature/new-feature
######################################################

main_directory_name=$(basename "$PWD")

# Function to create and setup a new worktree
setup_worktree() {
    local branch_name="$1"

    # Remove any special characters
    local clean_branch_name=$(echo "${branch_name}" | sed 's/[^a-zA-Z0-9]/-/g')

    # Create worktree
    if git branch --list "${branch_name}" | grep -q "${branch_name}"; then
      echo "Branch '$branch_name' exists."
      git worktree add "../${clean_branch_name}" "${branch_name}"
    else
      echo "Creating worktree branch name: '${branch_name}'"
      git worktree add -b "${branch_name}" "../${clean_branch_name}"
    fi

    # Move back a directory
    cd ..

    if [ -d "${clean_branch_name}" ]; then
      # Change to new worktree directory
      cd "./${clean_branch_name}"
    else
      echo "Directory '${clean_branch_name}' does not exists"
      exit 1;
    fi

    # Add absolute path of the file you like to copy.
    # Copy .env from `main|master` project directory
    copy_to_relative_directory "packages/server/.env"
    copy_to_relative_directory "packages/theme/.env"

    ################################
    # From here onward you can customise this script
    ################################

    # Install packages
    if [ -x "$(command -v pnpm)" ]; then
      pnpm install
    else
      pkgx +nodejs.org@22 +pnpm.io pnpm install
    fi

    # Build @logchimp/types package
    pnpm --filter="@logchimp/types" build

    # Set dynamic project name for Docker Compose
    export DOCKER_COMPOSE_PROJECT_NAME="${clean_branch_name}"
    export DOCKER_BUILDKIT=1
    export COMPOSE_BAKE=true

    # Spin up dev environment
    docker compose -f docker/local/docker-compose.dev.yml up -d
}

copy_to_relative_directory() {
    local source_path="../${main_directory_name}"
    local target_path="."
    local file="${1#/}"  # Remove leading slash if present

    # Copy the file
    if [ -f "${source_path}/${file}" ]; then
        cp "${source_path}/${file}" "${target_path}/${file}"
        echo "Copied '${target_path}/${file}' successfully"
    else
        echo "Error: File '${target_path}/${file}' not found"
        return 1
    fi
}

setup_worktree "$1"
