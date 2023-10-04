# FROM node:alpine
# # Setup environment variable arguments
# # ----------------------------------
# ARG NODE_ENV
# # NextAuth
# ARG NEXTAUTH_URL
# ARG NEXTAUTH_SECRET
# ARG NEXTAUTH_PUBLIC_URL
# # NextJS
# ARG NEXT_PUBLIC_URL
# # Google
# ARG GOOGLE_CLIENT_ID
# ARG GOOGLE_CLIENT_SECRET
# # Service Account
# ARG SERVICE_ACCOUNT_KEY

# # Environment variables
# # ----------------------------------
# ENV NODE_ENV=$NODE_ENV
# # NextAuth
# ENV NEXTAUTH_URL=$NEXTAUTH_URL
# ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
# ENV NEXTAUTH_PUBLIC_URL=$NEXTAUTH_PUBLIC_URL
# # NextJS
# ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
# # Google
# ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
# ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
# # Service Account
# ENV SERVICE_ACCOUNT_KEY=$SERVICE_ACCOUNT_KEY

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# 
# COPY . /usr/src/app/

# RUN npm install
# RUN npm run build

# CMD ["npm", "start"]

# Dockerfile for Next.js 13

# Set the base image
# FROM node:13.14.0-alpine
# FROM node:alpine

# # Setup environment variable arguments
# # ----------------------------------
# ARG NODE_ENV
# # NextAuth
# ARG NEXTAUTH_URL
# ARG NEXTAUTH_SECRET
# ARG NEXTAUTH_PUBLIC_URL
# # NextJS
# ARG NEXT_PUBLIC_URL
# # Google
# ARG GOOGLE_CLIENT_ID
# ARG GOOGLE_CLIENT_SECRET
# # Service Account
# ARG SERVICE_ACCOUNT_KEY

# # Environment variables
# # ----------------------------------
# ENV NODE_ENV=$NODE_ENV
# # NextAuth
# ENV NEXTAUTH_URL=$NEXTAUTH_URL
# ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
# ENV NEXTAUTH_PUBLIC_URL=$NEXTAUTH_PUBLIC_URL
# # NextJS
# ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
# # Google
# ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
# ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
# # Service Account
# ENV SERVICE_ACCOUNT_KEY=$SERVICE_ACCOUNT_KEY

# Set the working directory
# WORKDIR /app

# # Install yarn
# RUN apk add yarn

# # Copy the package.json and yarn.lock files
# COPY package.json yarn.lock ./

# # Install dependencies
# RUN yarn install

# # Copy the application code
# COPY . .

# # Set environment variables
# # ENV NODE_ENV=production
# # ENV PORT=3000

# # disable telemetry
# RUN yarn next telemetry disable
# # Build the application
# RUN yarn build

# # Expose the port
# EXPOSE 3000

# # Start the application
# CMD ["yarn", "start"]

# # Add labels
# LABEL maintainer="Reading Advantage Web"
# LABEL version="1.0"
FROM node:alpine

ARG NODE_ENV
# NextAuth
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_PUBLIC_URL
# NextJS
ARG NEXT_PUBLIC_URL
# Google
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
# Service Account
ARG SERVICE_ACCOUNT_KEY

# Environment variables
# ----------------------------------
ENV NODE_ENV=$NODE_ENV
# NextAuth
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_PUBLIC_URL=$NEXTAUTH_PUBLIC_URL
# NextJS
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
# Google
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
# Service Account
ENV SERVICE_ACCOUNT_KEY=$SERVICE_ACCOUNT_KEY

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# RUN apk add yarn

COPY . /usr/src/app/

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]