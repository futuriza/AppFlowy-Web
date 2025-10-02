if [ -z "$1" ]; then
  echo "No port number provided"
  exit 1
fi

PORT=$1

echo "Starting deployment on port $PORT"

# rm -rf dist

# yarn build

# tar -xzf build-output.tar.gz

# rm -rf build-output.tar.gz

cp -rf dist deploy/dist

cp .env deploy/.env

cd deploy

docker system prune -f

docker build -t appflowy-web-app-"$PORT" .

docker tag appflowy-web-app-"$PORT" us-east4-docker.pkg.dev/sunny-effort-410919/futuriza-appflowy/appflowy-web:latest

docker push us-east4-docker.pkg.dev/sunny-effort-410919/futuriza-appflowy/appflowy-web:latest

# docker rm -f appflowy-web-app-"$PORT" || true

# docker run -d --env-file .env -p "$PORT":80 --restart always --name appflowy-web-app-"$PORT" appflowy-web-app-"$PORT"