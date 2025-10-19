#!/bin/sh

# Safely build a <script> block assigning to window.__APP_ENV__
ENV_SCRIPT="<script>
  window.__APP_ENV__ = {
    VITE_API_URL: '${VITE_API_URL}',
    VITE_IS_SELF_HOSTED: '${VITE_IS_SELF_HOSTED}',
    VITE_WEBAPP_URL: '${VITE_WEBAPP_URL}',
    VITE_LOGCHIMP_VERSION: '${LOGCHIMP_VERSION}',
  };
</script>"

# Escape newlines for safe sed usage
ESCAPED_SCRIPT=$(printf "%s\n" "$ENV_SCRIPT" | sed ':a;N;$!ba;s/\n/\\n/g')

# Inject just before the first <script type="module"> tag
sed -i "s@<script type=\"module\"@${ESCAPED_SCRIPT}\n<script type=\"module\"@" /app/dist/index.html

# Start your app (adjust as needed, e.g. serve or nginx)
exec "$@"
