# T14: production image for the Vite team-site app (multi-stage).
# Build context must be team-site/ so package-lock.json is used by npm ci.
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG GITHUB_SHA=local-dev
ARG TASK_MARKER=T14
ARG CONTAINER_IMAGE=
ARG CONTAINER_NAME=deploy-sprint-team-01
ARG APP_PORT=8080
ARG TEAM_NAME=BEGINNERS
ARG TEAM_SLUG=beginners
ARG PUBLIC_URL_MODE=domain
ARG DOMAIN_PUBLIC_URL=https://beginners.deploysprint-finals.knurdz.org
ARG IP_PUBLIC_URL=http://20.114.32.177
ARG DOMAIN_CONNECTED=true

ENV GITHUB_SHA=$GITHUB_SHA \
    TASK_MARKER=$TASK_MARKER \
    CONTAINER_IMAGE=$CONTAINER_IMAGE \
    CONTAINER_NAME=$CONTAINER_NAME \
    APP_PORT=$APP_PORT \
    TEAM_NAME=$TEAM_NAME \
    TEAM_SLUG=$TEAM_SLUG \
    PUBLIC_URL_MODE=$PUBLIC_URL_MODE \
    DOMAIN_PUBLIC_URL=$DOMAIN_PUBLIC_URL \
    IP_PUBLIC_URL=$IP_PUBLIC_URL \
    DOMAIN_CONNECTED=$DOMAIN_CONNECTED \
    PRIVATE_DEPLOY_TOKEN_CONFIGURED=true

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health | grep -qx ok || exit 1
