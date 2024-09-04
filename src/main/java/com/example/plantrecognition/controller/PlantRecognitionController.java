package com.example.plantrecognition.controller;

import com.example.plantrecognition.service.PlantRecognitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@CrossOrigin(origins = "http://localhost:63342")
public class PlantRecognitionController {
    private final PlantRecognitionService plantRecognitionService;

    public PlantRecognitionController(PlantRecognitionService plantRecognitionService) {
        this.plantRecognitionService = plantRecognitionService;
    }

    @PostMapping("/recognize")
    public ResponseEntity<String> recognizePlant(@RequestParam(required = false) MultipartFile file,
                                                 @RequestParam(required = false) String imageUrl) throws IOException {
        String result;
        if (file != null && !file.isEmpty()) {
            result = plantRecognitionService.recognizePlant(file);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            result = plantRecognitionService.recognizePlantByUrl(imageUrl);
        } else {
            result = "Please provide either a file or an image URL.";
        }
        return ResponseEntity.ok(result);
    }
}