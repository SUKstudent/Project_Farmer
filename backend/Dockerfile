# Use lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Cloud Run requirement)
EXPOSE 8080

# Start FastAPI server
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8080"]
