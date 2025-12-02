// If running index.html from local file system, use Flask's default port on localhost
const API_BASE_URL = window.location.protocol === 'file:' 
  ? 'http://localhost:5000'
  : 'https://TBD';

// Model Switching
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const modelContents = document.querySelectorAll('.model-content');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const modelType = link.getAttribute('data-model');

        // Update active sidebar link
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show selected model content
        modelContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${modelType}-content`).classList.add('active');
    });
});

// Iris Model Elements
const petalLengthSlider = document.getElementById('petal-length');
const petalWidthSlider = document.getElementById('petal-width');
const petalLengthValue = document.getElementById('petal-length-value');
const petalWidthValue = document.getElementById('petal-width-value');
const submitBtn = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const errorContainer = document.getElementById('error-container');
const errorText = document.getElementById('error-text');

// House Model Elements
const squareFootageSlider = document.getElementById('square-footage');
const bedroomsSlider = document.getElementById('bedrooms');
const bathroomsSlider = document.getElementById('bathrooms');
const ageSlider = document.getElementById('age');
const squareFootageValue = document.getElementById('square-footage-value');
const bedroomsValue = document.getElementById('bedrooms-value');
const bathroomsValue = document.getElementById('bathrooms-value');
const ageValue = document.getElementById('age-value');
const houseSubmitBtn = document.getElementById('house-submit-btn');
const houseResultContainer = document.getElementById('house-result-container');
const houseResultText = document.getElementById('house-result-text');
const houseErrorContainer = document.getElementById('house-error-container');
const houseErrorText = document.getElementById('house-error-text');

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
        const response = await fetch(`${API_BASE_URL}/predict-iris`, {
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

        // Add prediction point to the chart
        addPredictionToChart(petalLength, petalWidth, result.prediction);

    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = `Error: ${error.message}. Make sure the Flask API is running at ${API_BASE_URL}`;
        errorContainer.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Predict Species';
    }
});

// House Price Predictor Event Listeners
squareFootageSlider.addEventListener('input', (e) => {
    squareFootageValue.textContent = e.target.value;
});

bedroomsSlider.addEventListener('input', (e) => {
    bedroomsValue.textContent = e.target.value;
});

bathroomsSlider.addEventListener('input', (e) => {
    bathroomsValue.textContent = e.target.value;
});

ageSlider.addEventListener('input', (e) => {
    ageValue.textContent = e.target.value;
});

houseSubmitBtn.addEventListener('click', async () => {
    const squareFootage = parseFloat(squareFootageSlider.value);
    const bedrooms = parseFloat(bedroomsSlider.value);
    const bathrooms = parseFloat(bathroomsSlider.value);
    const age = parseFloat(ageSlider.value);

    houseSubmitBtn.disabled = true;
    houseSubmitBtn.textContent = 'Predicting...';

    try {
        const response = await fetch(`${API_BASE_URL}/predict-house`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                square_footage: squareFootage,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                age: age
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        houseResultText.textContent = `$${result.prediction.toLocaleString()}`;
        houseResultContainer.classList.remove('hidden');
        houseErrorContainer.classList.add('hidden');

    } catch (error) {
        console.error('Error:', error);
        houseErrorText.textContent = `Error: ${error.message}. Make sure the Flask API is running at ${API_BASE_URL}`;
        houseErrorContainer.classList.remove('hidden');
    } finally {
        houseSubmitBtn.disabled = false;
        houseSubmitBtn.textContent = 'Predict Price';
    }
});

// Store chart instance globally to allow updates
let irisChart = null;

// Initialize Iris Petal Scatterplot with ECharts
async function initIrisChart() {
    try {
        // Fetch iris dataset
        const response = await fetch(`${API_BASE_URL}/iris-data`);
        const irisData = await response.json();

        // Group data by species
        const setosaData = [];
        const versicolorData = [];
        const virginicaData = [];

        irisData.forEach(item => {
            const point = [parseFloat(item.petal_length), parseFloat(item.petal_width)];
            if (item.species === 'setosa') {
                setosaData.push(point);
            } else if (item.species === 'versicolor') {
                versicolorData.push(point);
            } else if (item.species === 'virginica') {
                virginicaData.push(point);
            }
        });

        // Initialize ECharts
        const chartDom = document.getElementById('iris-chart');
        irisChart = echarts.init(chartDom);

        const option = {
            title: {
                text: 'Iris Dataset - Petal Measurements',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    color: '#374151'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.seriesName === 'Predicted') {
                        return `${params.seriesName} - ${params.value[2]}</br>Petal Length: ${params.value[0]} cm<br/>Petal Width: ${params.value[1]} cm`;
                    }
                    return `${params.seriesName}<br/>Petal Length: ${params.value[0]} cm<br/>Petal Width: ${params.value[1]} cm`;
                }
            },
            legend: {
                data: ['Setosa', 'Versicolor', 'Virginica', 'Predicted'],
                bottom: 10,
                textStyle: {
                    color: '#374151'
                }
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                name: 'Petal Length (cm)',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: {
                    fontSize: 12,
                    color: '#374151'
                },
                type: 'value',
                scale: true,
                axisLabel: {
                    color: '#6B7280'
                },
                splitLine: {
                    lineStyle: {
                        color: '#E5E7EB'
                    }
                }
            },
            yAxis: {
                name: 'Petal Width (cm)',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: {
                    fontSize: 12,
                    color: '#374151'
                },
                type: 'value',
                scale: true,
                axisLabel: {
                    color: '#6B7280'
                },
                splitLine: {
                    lineStyle: {
                        color: '#E5E7EB'
                    }
                }
            },
            series: [
                {
                    name: 'Setosa',
                    data: setosaData,
                    type: 'scatter',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#EF4444'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: '#DC2626',
                            borderWidth: 2
                        }
                    }
                },
                {
                    name: 'Versicolor',
                    data: versicolorData,
                    type: 'scatter',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#10B981'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: '#059669',
                            borderWidth: 2
                        }
                    }
                },
                {
                    name: 'Virginica',
                    data: virginicaData,
                    type: 'scatter',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#3B82F6'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: '#2563EB',
                            borderWidth: 2
                        }
                    }
                },
                {
                    name: 'Predicted',
                    data: [],
                    type: 'scatter',
                    symbol: 'diamond',
                    symbolSize: 16,
                    itemStyle: {
                        color: '#000000'
                    },
                    emphasis: {
                        itemStyle: {
                            borderColor: '#374151',
                            borderWidth: 2
                        }
                    }
                }
            ]
        };

        irisChart.setOption(option);

        // Make chart responsive
        window.addEventListener('resize', function() {
            irisChart.resize();
        });

    } catch (error) {
        console.error('Error loading iris chart:', error);
    }
}

// Function to add prediction point to chart
function addPredictionToChart(petalLength, petalWidth, predictedSpecies) {
    if (!irisChart) return;

    // Update the chart with the new prediction point
    // The prediction data includes the species name as the third element for tooltip
    irisChart.setOption({
        series: [
            {}, // Setosa - keep unchanged
            {}, // Versicolor - keep unchanged
            {}, // Virginica - keep unchanged
            {
                name: 'Predicted',
                data: [[petalLength, petalWidth, predictedSpecies]]
            }
        ]
    });
}

// Initialize the chart when the page loads
initIrisChart();
