# Define the base image
FROM node:18-alpine

ARG mongodb_url
ENV MONGODB_URL=$mongodb_url

# Install FFmpeg and FFprobe
# RUN apk --no-cache add ffmpeg
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to work directory
COPY package.json ./
# make the node_modules cuz it might make things go faster idk tbher
RUN mkdir node_modules
# Install packages for app
# RUN npm install -g pnpm
# RUN pnpm install
RUN yarn install
# If building code for production
# RUN npm ci --only=production
# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
# Copy the 'env' and 'config.ts' files
# COPY .env ./
COPY config.ts ./
# Build next.js app
RUN yarn build
# Expose port on which the app runs on
EXPOSE 3000
# Command to start app
CMD [ "yarn", "start" ]