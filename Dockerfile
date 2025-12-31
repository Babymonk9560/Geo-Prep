# Use the official lightweight Python image.
FROM python:3.9-slim

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Run the streamlit application
# Server port 8080 is the default for Cloud Run
CMD streamlit run app.py --server.port 8080 --server.address 0.0.0.0
