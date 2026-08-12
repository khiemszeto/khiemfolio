FROM node:26.3-bullseye AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

COPY . .

RUN npm run build

###
FROM nginx:1.31-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/dist/ /usr/share/nginx/html

EXPOSE 80

# FROM node:26-bullseye AS build

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN --mount=type=cache,target=/usr/src/app/.npm \
#     npm set cache /usr/src/app/.npm && \
#     npm ci

# COPY . .

# RUN npm run build

# FROM nginx:1.31-alpine

# COPY nginx.conf /etc/nginx/conf.d/default.conf

# COPY --from=build usr/src/app/dist/ /usr/share/nginx/html

# EXPOSE 80