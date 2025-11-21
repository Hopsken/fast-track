#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  husky_skip_init=1

  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) - $1"
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name hook"

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ "$HUSKY_SKIP_HOOKS" = "1" ]; then
    debug "HUSKY_SKIP_HOOKS env variable is set to 1, skipping hook"
    exit 0
  fi

  readonly husky_dir="$(cd -- "$(dirname -- "$0")/.." >/dev/null 2>&1 && pwd -P)"
  readonly husky_hook="$husky_dir/$(basename "$0")"

  if [ ! -f "$husky_hook" ]; then
    debug "can't find $husky_hook, skipping hook"
    exit 0
  fi

  . "$husky_hook"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (add --no-verify to bypass)"
  fi

  exit $exitCode
fi
