#!/bin/bash
set -eo pipefail

trap handle_exit EXIT SIGINT SIGTERM

handle_exit() {
    exit 1
}

check_server() {
    local port=$1
    echo "Checking server on port $port..."
    until nc -z localhost "$port"; do
        sleep 1
    done
    echo "Server on port $port is ready"
}

check_swagger_data() {
    local url=$1
    echo "Checking for Swagger data at $url..."
    if curl --fail "$url" >/dev/null; then
        echo "Swagger documentation successfully generated and available at $url"
        return 0
    else
        echo "Failed to retrieve Swagger documentation for ${app_name} on port ${port}. Please check if the server is running and accessible at $url" >&2
        return 1
    fi
}

generate_swagger_documentation() {
    local app_name=$1
    local port=$2
    local swagger_url="http://localhost:$port/api/${app_name}/swagger-json"

    if check_swagger_data "$swagger_url"; then
        npx openapi-generator-cli generate -i "$swagger_url" -g typescript-axios -o "libs/clients/${app_name}/src/lib/generated" -c "./apps/${app_name}/resources/openapi-server-generator.config.yaml"
    else
        echo "Error: Cannot generate OpenAPI documentation for ${app_name} on port ${port} as Swagger data is missing." >&2
        exit 1
    fi
}

generate_i18n() {
    local i18n_path=$1
    echo "Generating i18n types at path: $i18n_path"
    i18n generate-types -w -t json -p "$i18n_path"
}

start_dev() {
    local app_name="$1"
    local port="$2"
    local generate_swagger="$3"
    local generate_i18n="$4"
    local i18n_path="$5"

    yarn nx run "${app_name}":serve &
    PLATFORM_PID=$!
    check_server "$port"
    sleep 1

    if [ "$generate_swagger" = true ]; then
        generate_swagger_documentation "$app_name" "$port"
    fi

    if [ "$generate_i18n" = true ]; then
        generate_i18n "$i18n_path"
    fi

    wait $PLATFORM_PID
}

main() {
    local app_name="$1"
    local port="${2:-8000}"
    local generate_swagger="${3:-true}"
    local generate_i18n="${4:-true}"
    local i18n_path="${5:-./apps/platform/src/app/i18n/}"

    if [ -z "$app_name" ]; then
        echo "Please provide an application name."
        exit 1
    fi

    echo "Ensure the provided port number ($port) matches the port your application is running on."

    start_dev "$app_name" "$port" "$generate_swagger" "$generate_i18n" "$i18n_path"
}

main "$@"
