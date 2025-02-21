FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Set production environment
ENV FLASK_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["gunicorn", "--bind", ":8080", "--workers", "2", "app:app"] 