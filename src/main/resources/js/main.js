document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const urlForm = document.getElementById('urlForm');
    const imageFileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.querySelector('.loading');

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        recognizePlant(formData);
    });

    urlForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(urlForm);
        recognizePlant(formData);
    });

    imageFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    imageUrlInput.addEventListener('input', function() {
        imagePreview.src = imageUrlInput.value;
        imagePreview.style.display = 'block';
    });

    function recognizePlant(formData) {
        resultsDiv.textContent = '';
        loadingDiv.style.display = 'block';

        fetch('http://localhost:8080/recognize', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                loadingDiv.style.display = 'none';
                resultsDiv.textContent = data;
                animateResults();
            })
            .catch(error => {
                console.error('Error:', error);
                loadingDiv.style.display = 'none';
                resultsDiv.textContent = 'An error occurred during recognition.';
            });
    }

    function animateResults() {
        resultsDiv.style.opacity = '0';
        resultsDiv.style.transform = 'translateY(20px)';
        resultsDiv.style.transition = 'opacity 0.5s, transform 0.5s';

        setTimeout(() => {
            resultsDiv.style.opacity = '1';
            resultsDiv.style.transform = 'translateY(0)';
        }, 100);
    }
});