# Use Node LTS
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all sources
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start Next.js in development mode (or change to "npm run build && npm start" for production)
CMD ["npm", "run", "dev"]