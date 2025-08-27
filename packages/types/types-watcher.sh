#!/bin/sh

# types-watcher.sh - Graceful shutdown support for types watcher

set -e

log() {
    echo "[TYPES] $1"
}

# Global variable to track nodemon PID
NODEMON_PID=""

# Cleanup function
cleanup() {
    log "Received shutdown signal, cleaning up..."

    if [ -n "$NODEMON_PID" ]; then
        log "Stopping nodemon process (PID: $NODEMON_PID)..."
        kill -TERM "$NODEMON_PID" 2>/dev/null || true

        # Wait a bit for graceful shutdown
        sleep 2

        # Force kill if still running
        if kill -0 "$NODEMON_PID" 2>/dev/null; then
            log "Nodemon didn't stop gracefully, force killing..."
            kill -KILL "$NODEMON_PID" 2>/dev/null || true
        fi
    fi

    # Kill any remaining pnpm processes
    pkill -f "pnpm.*build" 2>/dev/null || true

    log "Cleanup complete, exiting gracefully"
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT SIGQUIT

# Main execution
main() {
    log "Starting types watcher service..."

    # Install global dependencies
    log "Installing global dependencies..."
    npm install -g pnpm nodemon --silent

    # Install project dependencies
    log "Installing project dependencies..."
    pnpm install --frozen-lockfile

    # Initial build
    log "Building types package..."
    if pnpm --filter @logchimp/types build; then
        log "Initial build complete!"
    else
        log "Initial build failed!"
        exit 1
    fi

    # Start nodemon in background
    log "Starting file watcher..."
    nodemon \
        --watch 'packages/types/src' \
        --ext 'ts,js,json' \
        --ignore '**/*.test.ts' \
        --ignore '**/*.spec.ts' \
        --ignore '**/dist/**' \
        --delay 1000ms \
        --exec 'echo "[TYPES] Rebuilding types ($(date +"%H:%M:%S"))..." && pnpm --filter @logchimp/types build && echo "[TYPES] Rebuild complete!"' &

    # Store nodemon PID
    NODEMON_PID=$!
    log "File watcher started (PID: $NODEMON_PID)"

    # Wait for nodemon process
    wait $NODEMON_PID
}

# Run main function
main "$@"