package com.example.plantrecognition.service;

import com.example.plantrecognition.config.BaiduApiConfig;
import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PlantRecognitionService {
    private static final Logger logger = LoggerFactory.getLogger(PlantRecognitionService.class);
    private final BaiduApiConfig baiduApiConfig;
    private final OkHttpClient httpClient;

    public PlantRecognitionService(BaiduApiConfig baiduApiConfig) {
        this.baiduApiConfig = baiduApiConfig;
        this.httpClient = new OkHttpClient().newBuilder().build();
    }

    public String recognizePlant(MultipartFile file) throws IOException {
        String accessToken = getAccessToken();

        // Log file details
        logger.info("File name: {}, Content type: {}, Size: {} bytes",
                file.getOriginalFilename(), file.getContentType(), file.getSize());

        // Process and encode the image
        byte[] processedImageBytes = processImage(file.getBytes());
        String imageBase64 = Base64.getEncoder().encodeToString(processedImageBytes);

        // Remove the Base64 prefix (e.g., "data:image/jpeg;base64,")
        imageBase64 = imageBase64.replaceAll("^data:image/[^;]*;base64,", "");

        // URL encode the Base64 string
        String encodedImage = URLEncoder.encode(imageBase64, "UTF-8");

        // Log the first 100 characters of the encoded string
        logger.info("Encoded image (first 100 chars): {}",
                encodedImage.substring(0, Math.min(encodedImage.length(), 100)));

        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        RequestBody body = RequestBody.create(mediaType, "image=" + encodedImage);
        Request request = new Request.Builder()
                .url("https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token=" + accessToken)
                .method("POST", body)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .addHeader("Accept", "application/json")
                .build();

        Response response = httpClient.newCall(request).execute();
        String responseBody = response.body().string();

        // Log the full response
        logger.info("Full API response: {}", responseBody);

        return processResponse(responseBody);
    }

    private byte[] processImage(byte[] originalImageBytes) throws IOException {
        BufferedImage img = ImageIO.read(new ByteArrayInputStream(originalImageBytes));

        // Check and resize the image if necessary
        int width = img.getWidth();
        int height = img.getHeight();

        if (width < 15 || height < 15) {
            throw new IllegalArgumentException("Image is too small. Minimum size is 15x15 pixels.");
        }

        if (width > 4096 || height > 4096) {
            // Resize the image
            double scale = Math.min(4096.0 / width, 4096.0 / height);
            int newWidth = (int) (width * scale);
            int newHeight = (int) (height * scale);

            BufferedImage resized = new BufferedImage(newWidth, newHeight, img.getType());
            resized.getGraphics().drawImage(img.getScaledInstance(newWidth, newHeight, java.awt.Image.SCALE_SMOOTH), 0, 0, null);
            img = resized;
        }

        // Convert to JPG if it's not already
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", outputStream);

        return outputStream.toByteArray();
    }

    public String recognizePlantByUrl(String imageUrl) throws IOException {
        String accessToken = getAccessToken();

        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        RequestBody body = RequestBody.create(mediaType, "url=" + imageUrl);
        Request request = new Request.Builder()
                .url("https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token=" + accessToken)
                .method("POST", body)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .addHeader("Accept", "application/json")
                .build();

        Response response = httpClient.newCall(request).execute();
        return processResponse(response.body().string());
    }
//
//    private String processResponse(String jsonResponse) {
//        JSONObject json = new JSONObject(jsonResponse);
//        if (json.has("error_code")) {
//            return "Error: " + json.getString("error_msg");
//        }
//
//        StringBuilder result = new StringBuilder();
//        JSONArray results = json.getJSONArray("result");
//        for (int i = 0; i < results.length(); i++) {
//            JSONObject plant = results.getJSONObject(i);
//            result.append(i + 1).append(". ")
//                    .append("Name: ").append(plant.getString("name")).append("\n")
//                    .append("   Score: ").append(plant.getDouble("score")).append("\n");
//        }
//        return result.toString();
//    }

    private String processResponse(String jsonResponse) {
        JSONObject json = new JSONObject(jsonResponse);
        if (json.has("error_code")) {
            logger.error("API error: code={}, msg={}", json.getInt("error_code"), json.getString("error_msg"));
            return "Error: " + json.getString("error_msg") + " (code: " + json.getInt("error_code") + ")";
        }

        StringBuilder result = new StringBuilder();
        JSONArray results = json.getJSONArray("result");
        for (int i = 0; i < results.length(); i++) {
            JSONObject plant = results.getJSONObject(i);
            result.append(i + 1).append(". ")
                    .append("Name: ").append(plant.getString("name")).append("\n")
                    .append("   Score: ").append(plant.getDouble("score")).append("\n");
        }
        return result.toString();
    }


    private String getAccessToken() throws IOException {
        MediaType mediaType = MediaType.parse("application/x-www-form-urlencoded");
        RequestBody body = RequestBody.create(mediaType, "grant_type=client_credentials&client_id=" + baiduApiConfig.getApiKey()
                + "&client_secret=" + baiduApiConfig.getSecretKey());
        Request request = new Request.Builder()
                .url("https://aip.baidubce.com/oauth/2.0/token")
                .method("POST", body)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build();
        Response response = httpClient.newCall(request).execute();
        return new JSONObject(response.body().string()).getString("access_token");
    }
}