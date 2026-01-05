# Use a base image that supports both Node and Python, or install Python on a Node image
FROM node:18-slim

# Install Python3 and PIP
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create a virtual environment for Python to avoid breaking system packages
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Qiskit inside the virtual environment
RUN pip install qiskit

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the server code (including Python scripts)
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]