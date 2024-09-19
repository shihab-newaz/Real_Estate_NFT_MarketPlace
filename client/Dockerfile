# Use the official Node.js 20 image as a parent image
FROM node:20-alpine

# Install Redis
RUN apk add --no-cache redis

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the ports Next.js and Redis run on
EXPOSE 3000 6379

# Create a script to start both Redis and Next.js
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'redis-server --daemonize yes' >> /start.sh && \
    echo 'npm run dev' >> /start.sh && \
    chmod +x /start.sh

# Start Redis and the Next.js app
CMD ["/start.sh"]