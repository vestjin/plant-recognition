document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const imageFileInput = document.getElementById('imageFile');
    const imageUrlInput = document.getElementById('imageUrl');
    const backgroundImage = document.getElementById('backgroundImage');
    const resultsDiv = document.getElementById('results');
    const resultsContainer = document.querySelector('.results-container');
    const loadingDiv = document.querySelector('.loading');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const clearUrlBtn = document.getElementById('clearUrlBtn');
    const historyDiv = document.getElementById('history');
    const prevHistoryBtn = document.getElementById('prevHistory');
    const nextHistoryBtn = document.getElementById('nextHistory');

    const defaultBackgroundSrc = '/img/placeholder.png'; // 默认背景图的路径

    let history = [];
    let currentHistoryIndex = 0;
    let lastInput = ''; // 记录最后一个输入的类型
    let fileQueue = []; // 文件队列
    let isProcessing = false; // 是否正在处理文件

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resultsDiv.textContent = '';

        if (lastInput === 'file' && imageFileInput.files.length > 0) {
            loadingDiv.style.display = 'block';
            fileQueue = Array.from(imageFileInput.files);
            processNextFile();
        } else if (lastInput === 'url' && imageUrlInput.value) {
            loadingDiv.style.display = 'block';
            let formData = new FormData();
            formData.append('imageUrl', imageUrlInput.value);
            setBackgroundImageURL(imageUrlInput.value);
            recognizePlant(formData);
        } else {
            alert('Please upload an image or enter a valid URL.');
            return;
        }
    });

    imageFileInput.addEventListener('change', function() {
        if (imageFileInput.files.length > 0) {
            clearFileBtn.style.display = 'block';
            lastInput = 'file';
        } else {
            clearFileBtn.style.display = 'none';
        }
    });

    imageUrlInput.addEventListener('input', function() {
        if (imageUrlInput.value) {
            clearUrlBtn.style.display = 'block';
            lastInput = 'url';
        } else {
            clearUrlBtn.style.display = 'none';
        }
    });

    clearFileBtn.addEventListener('click', function() {
        imageFileInput.value = '';
        backgroundImage.src = defaultBackgroundSrc;
        clearFileBtn.style.display = 'none';
        checkDefaultBackground();
    });

    clearUrlBtn.addEventListener('click', function() {
        imageUrlInput.value = '';
        backgroundImage.src = defaultBackgroundSrc;
        clearUrlBtn.style.display = 'none';
        checkDefaultBackground();
    });

    prevHistoryBtn.addEventListener('click', function() {
        if (currentHistoryIndex > 0) {
            currentHistoryIndex--;
            updateHistoryPreview();
        }
    });

    nextHistoryBtn.addEventListener('click', function() {
        if (currentHistoryIndex < history.length - 1) {
            currentHistoryIndex++;
            updateHistoryPreview();
        }
    });

    function setBackgroundImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            backgroundImage.src = e.target.result;
            resultsContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function setBackgroundImageURL(url) {
        backgroundImage.src = url;
        resultsContainer.style.display = 'block';
    }

    function processNextFile() {
        if (fileQueue.length === 0 || isProcessing) {
            return;
        }

        isProcessing = true;
        const file = fileQueue.shift();
        let formData = new FormData();
        formData.append('file', file);
        setBackgroundImage(file);
        recognizePlant(formData);
    }

    function recognizePlant(formData) {
        fetch('/recognize', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                loadingDiv.style.display = 'none';
                resultsDiv.textContent = data;

                const imageSrc = backgroundImage.src;
                history.push({ src: imageSrc, result: data });
                currentHistoryIndex = history.length - 1;
                updateHistoryPreview();
                updateHistoryThumbnails();

                animateResults();

                // 处理下一个文件
                isProcessing = false;
                processNextFile();
            })
            .catch(error => {
                console.error('Error:', error);
                loadingDiv.style.display = 'none';
                resultsDiv.textContent = 'An error occurred during recognition.';
                isProcessing = false;
                processNextFile();
            });
    }

    function updateHistoryPreview() {
        const currentHistory = history[currentHistoryIndex];
        if (currentHistory) {
            backgroundImage.src = currentHistory.src;
            resultsDiv.textContent = currentHistory.result;
            resultsContainer.style.display = 'block';
            updateHistoryThumbnails();
        }
    }

    function updateHistoryThumbnails() {
        historyDiv.innerHTML = '';
        history.forEach((item, index) => {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = 'History Image';
            img.classList.add('img-thumbnail', 'm-1');
            img.dataset.fancybox = 'gallery';
            img.dataset.src = item.src;
            img.onclick = function() {
                currentHistoryIndex = index;
                updateHistoryPreview();
            };
            if (index === currentHistoryIndex) {
                img.classList.add('selected');
            }
            historyDiv.appendChild(img);
        });

        // 初始化 Fancybox
        $('[data-fancybox="gallery"]').fancybox({
            afterShow: function(instance, current) {
                // 在 Fancybox 显示时，隐藏历史记录和按钮
                $('.history-controls').hide();
                $('.history-thumbnails').hide();
            },
            afterClose: function(instance, current) {
                // 在 Fancybox 关闭时，显示历史记录和按钮
                $('.history-controls').show();
                $('.history-thumbnails').show();
            }
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

    function checkDefaultBackground() {
        if (backgroundImage.src.includes('placeholder.png')) {
            resultsContainer.style.display = 'none';
        }
    }
});
