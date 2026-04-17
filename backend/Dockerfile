# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the correct port
EXPOSE 5000

# Use a non-root user for security
USER node

# Start the application
CMD ["npm", "start"]
