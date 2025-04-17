FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
# Install dependencies using npm with legacy peer deps flag
RUN npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install only production dependencies with legacy-peer-deps flag
COPY --from=deps /app/package.json ./
RUN npm install --production --legacy-peer-deps

# Copy built application and configuration files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public



# Start the application
CMD ["npm", "start"]