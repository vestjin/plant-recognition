# Plant Recognition Project

## Project Overview
This project is a web-based plant recognition application that uses the Baidu API for image classification. Users can upload images or provide image URLs to identify plants. The application provides a user-friendly interface with features like image preview, recognition history, and result display.

## Project Structure
```
plant-recognition/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── plantrecognition/
│   │   │               ├── PlantRecognitionApplication.java
│   │   │               ├── controller/
│   │   │               │   └── PlantRecognitionController.java
│   │   │               ├── service/
│   │   │               │   └── PlantRecognitionService.java
│   │   │               └── config/
│   │   │                   └── BaiduApiConfig.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── js/
│   │       │   │   └── main.js
│   │       │   ├── css/
│   │       │   │   └── styles.css
│   │       │   └── img/
│   │       │       └── placeholder.png
│   │       ├── templates/
│   │       │   └── index.html
│   │       └── application.properties
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── plantrecognition/
│                       └── PlantRecognitionApplicationTests.java
└── pom.xml
```

## Technology Stack
- Backend: Spring Boot
- Frontend: HTML, CSS, JavaScript
- API: Baidu Plant Recognition API
- Build Tool: Maven

## Data Flow and Process
1. User Interface:
    - User uploads an image file or enters an image URL.
    - Frontend JavaScript handles the input and sends it to the backend.

2. Backend Processing:
    - `PlantRecognitionController` receives the request.
    - `PlantRecognitionService` processes the image and calls the Baidu API.
    - The service receives and processes the API response.

3. Response Handling:
    - The backend sends the processed result back to the frontend.
    - Frontend JavaScript updates the UI with the recognition results and manages the history.

## Key Components

### Backend

1. `PlantRecognitionApplication.java`
    - Spring Boot application entry point.

2. `PlantRecognitionController.java`
    - Handles HTTP requests for plant recognition.

3. `PlantRecognitionService.java`
    - Contains the core logic for image processing and API interaction.

4. `BaiduApiConfig.java`
    - Manages Baidu API configuration.

### Frontend

1. `index.html`
    - Main HTML structure of the application.

2. `main.js`
    - Handles user interactions, AJAX requests, and UI updates.

3. `styles.css`
    - Custom styles for the application.

## Frontend Functionality
- File upload and URL input for images
- Image preview
- Recognition history with thumbnails
- Previous/Next navigation for history
- Clear input buttons
- Loading indicator during recognition process
- Animated result display

## Setup and Running the Application
1. Clone the repository.
2. Configure `application.properties` with your Baidu API credentials.
3. Build the project: `mvn clean install`
4. Run the application: `java -jar target/plant-recognition-0.0.1-SNAPSHOT.jar`
5. Access the application at `http://localhost:8080`

## Future Improvements
- Implement user authentication and personal history storage.
- Add support for multiple plant recognition APIs.
- Improve error handling and user feedback.
- Implement a more robust queuing system for multiple file uploads.