FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Install Sass globally
RUN npm install -g sass

# Copy the rest of the application code to the working directory
COPY . .

# Build the CSS from Sass
RUN npm run build-css

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]