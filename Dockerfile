# Appointment Service - Multi-stage build
# Stage 1: Plain Node.js image for CI health checks (standalone HTTP server)
# Stage 2: Lambda image for AWS deployment (uses Lambda Web Adapter)

# --- Stage: healthcheck (for CI pipeline) ---
FROM node:20-slim AS healthcheck
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY appointment-service.js ./
ENV PORT=8080
EXPOSE 8080
CMD ["node", "appointment-service.js"]

# --- Stage: lambda (for AWS deployment) ---
FROM public.ecr.aws/lambda/nodejs:20 AS lambda

# Install Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application code
COPY appointment-service.js ./

# Lambda expects port 8080
ENV PORT=8080
ENV AWS_LWA_INVOKE_MODE=response

CMD ["node", "appointment-service.js"]
