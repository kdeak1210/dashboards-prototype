const petalLengthSlider = document.getElementById('petal-length');
const petalWidthSlider = document.getElementById('petal-width');
const petalLengthValue = document.getElementById('petal-length-value');
const petalWidthValue = document.getElementById('petal-width-value');
const submitBtn = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const errorContainer = document.getElementById('error-container');
const errorText = document.getElementById('error-text');

petalLengthSlider.addEventListener('input', (e) => {
    petalLengthValue.textContent = e.target.value;
});

petalWidthSlider.addEventListener('input', (e) => {
    petalWidthValue.textContent = e.target.value;
});

submitBtn.addEventListener('click', async () => {
    const petalLength = parseFloat(petalLengthSlider.value);
    const petalWidth = parseFloat(petalWidthSlider.value);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Predicting...';

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([petalLength, petalWidth])
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        resultText.textContent = result.prediction;
        resultContainer.classList.remove('hidden');
        errorContainer.classList.add('hidden');

    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = `Error: ${error.message}. Make sure the Flask API is running at http://127.0.0.1:5000`;
        errorContainer.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Predict Species';
    }
});
