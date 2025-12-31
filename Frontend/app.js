// If running index.html from local file system, use Flask's default port on localhost
const API_BASE_URL = window.location.protocol === 'file:'
  ? 'http://localhost:5000'
  : 'https://kdeak1210.pythonanywhere.com';

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

        // Resize chart when switching to iris model to fix display bug
        if (modelType === 'iris' && irisChart) {
            setTimeout(() => irisChart.resize(), 0);
        }
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
const bedroomsSelect = document.getElementById('bedrooms');
const bathroomsSelect = document.getElementById('bathrooms');
const lotsizeInput = document.getElementById('lotsize');
const waterfrontCheckbox = document.getElementById('waterfront');
const bedroomsValue = document.getElementById('bedrooms-value');
const bathroomsValue = document.getElementById('bathrooms-value');
const lotsizeValue = document.getElementById('lotsize-value');
const lotsizeError = document.getElementById('lotsize-error');
const houseSubmitBtn = document.getElementById('house-submit-btn');
const houseResultContainer = document.getElementById('house-result-container');
const houseResultText = document.getElementById('house-result-text');
const houseErrorContainer = document.getElementById('house-error-container');
const houseErrorText = document.getElementById('house-error-text');

// Air Force Retention Model Elements
const ageSelect = document.getElementById('age');
const genderSelect = document.getElementById('gender');
const maritalStatusSelect = document.getElementById('marital-status');
const dependentsMinusBtn = document.getElementById('dependents-minus');
const dependentsPlusBtn = document.getElementById('dependents-plus');
const dependentsDisplay = document.getElementById('dependents-display');
const gradeSelect = document.getElementById('grade');
const salaryInput = document.getElementById('salary');
const yearsServiceSelect = document.getElementById('years-service');
const priorReenlistmentsMinusBtn = document.getElementById('prior-reenlistments-minus');
const priorReenlistmentsPlusBtn = document.getElementById('prior-reenlistments-plus');
const priorReenlistmentsDisplay = document.getElementById('prior-reenlistments-display');
const bonusesInput = document.getElementById('bonuses');
const ageValue = document.getElementById('age-value');
const genderValue = document.getElementById('gender-value');
const maritalStatusValue = document.getElementById('marital-status-value');
const dependentsValue = document.getElementById('dependents-value');
const gradeValue = document.getElementById('grade-value');
const salaryValue = document.getElementById('salary-value');
const yearsServiceValue = document.getElementById('years-service-value');
const priorReenlistmentsValue = document.getElementById('prior-reenlistments-value');
const bonusesValue = document.getElementById('bonuses-value');
const salaryError = document.getElementById('salary-error');
const bonusesError = document.getElementById('bonuses-error');
const retentionSubmitBtn = document.getElementById('retention-submit-btn');
const retentionResultContainer = document.getElementById('retention-result-container');
const retentionResultText = document.getElementById('retention-result-text');
const retentionErrorContainer = document.getElementById('retention-error-container');
const retentionErrorText = document.getElementById('retention-error-text');

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
bedroomsSelect.addEventListener('change', (e) => {
    bedroomsValue.textContent = e.target.value;
});

bathroomsSelect.addEventListener('change', (e) => {
    bathroomsValue.textContent = e.target.value;
});

// Validation function for lot size
function validateLotSize(value) {
    const lotsize = parseFloat(value);
    return lotsize >= 1000 && lotsize <= 20000;
}

lotsizeInput.addEventListener('input', (e) => {
    const value = e.target.value;
    lotsizeValue.textContent = value;

    // Validate lot size
    const isValid = validateLotSize(value);

    // Show/hide error message
    if (!isValid && value !== '') {
        lotsizeError.classList.remove('hidden');
        houseSubmitBtn.disabled = true;
    } else {
        lotsizeError.classList.add('hidden');
        houseSubmitBtn.disabled = false;
    }
});

houseSubmitBtn.addEventListener('click', async () => {
    const bedrooms = parseFloat(bedroomsSelect.value);
    const bathrooms = parseFloat(bathroomsSelect.value);
    const lotsize = parseFloat(lotsizeInput.value);
    const waterfront = waterfrontCheckbox.checked ? 1 : 0;

    houseSubmitBtn.disabled = true;
    houseSubmitBtn.textContent = 'Predicting...';

    try {
        const response = await fetch(`${API_BASE_URL}/predict-house`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([bedrooms, bathrooms, lotsize, waterfront])
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        houseResultText.textContent = `$${Math.round(result.prediction).toLocaleString()}`;
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

// Populate Age dropdown (17-50)
for (let i = 17; i <= 50; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 30) option.selected = true; // Default to 30
    ageSelect.appendChild(option);
}

// Populate Years of Service dropdown (0-30)
for (let i = 0; i <= 30; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    if (i === 6) option.selected = true; // Default to 6
    yearsServiceSelect.appendChild(option);
}

// Air Force Retention Event Listeners
ageSelect.addEventListener('change', (e) => {
    ageValue.textContent = e.target.value;
});

genderSelect.addEventListener('change', (e) => {
    genderValue.textContent = e.target.value;
});

maritalStatusSelect.addEventListener('change', (e) => {
    maritalStatusValue.textContent = e.target.value;
});

gradeSelect.addEventListener('change', (e) => {
    gradeValue.textContent = e.target.value;
});

yearsServiceSelect.addEventListener('change', (e) => {
    yearsServiceValue.textContent = e.target.value;
});

// Dependents plus/minus buttons
let dependentsCount = 2;
dependentsMinusBtn.addEventListener('click', () => {
    if (dependentsCount > 0) {
        dependentsCount--;
        const displayValue = dependentsCount >= 6 ? '6+' : dependentsCount;
        dependentsDisplay.value = displayValue;
        dependentsValue.textContent = displayValue;
    }
});

dependentsPlusBtn.addEventListener('click', () => {
    if (dependentsCount < 7) {
        dependentsCount++;
        const displayValue = dependentsCount >= 6 ? '6+' : dependentsCount;
        dependentsDisplay.value = displayValue;
        dependentsValue.textContent = displayValue;
    }
});

// Prior Reenlistments plus/minus buttons
let priorReenlistmentsCount = 1;
priorReenlistmentsMinusBtn.addEventListener('click', () => {
    if (priorReenlistmentsCount > 0) {
        priorReenlistmentsCount--;
        const displayValue = priorReenlistmentsCount >= 6 ? '6+' : priorReenlistmentsCount;
        priorReenlistmentsDisplay.value = displayValue;
        priorReenlistmentsValue.textContent = displayValue;
    }
});

priorReenlistmentsPlusBtn.addEventListener('click', () => {
    if (priorReenlistmentsCount < 7) {
        priorReenlistmentsCount++;
        const displayValue = priorReenlistmentsCount >= 6 ? '6+' : priorReenlistmentsCount;
        priorReenlistmentsDisplay.value = displayValue;
        priorReenlistmentsValue.textContent = displayValue;
    }
});

// Salary validation
function validateSalary(value) {
    const salary = parseFloat(value);
    return salary >= 0 && salary <= 150000;
}

salaryInput.addEventListener('input', (e) => {
    const value = e.target.value;
    salaryValue.textContent = value;

    const isValid = validateSalary(value);
    if (!isValid && value !== '') {
        salaryError.classList.remove('hidden');
        retentionSubmitBtn.disabled = true;
    } else {
        salaryError.classList.add('hidden');
        // Only enable if bonuses are also valid
        if (validateBonuses(bonusesInput.value) || bonusesInput.value === '') {
            retentionSubmitBtn.disabled = false;
        }
    }
});

// Bonuses validation
function validateBonuses(value) {
    const bonuses = parseFloat(value);
    return bonuses >= 0 && bonuses <= 50000;
}

bonusesInput.addEventListener('input', (e) => {
    const value = e.target.value;
    bonusesValue.textContent = value;

    const isValid = validateBonuses(value);
    if (!isValid && value !== '') {
        bonusesError.classList.remove('hidden');
        retentionSubmitBtn.disabled = true;
    } else {
        bonusesError.classList.add('hidden');
        // Only enable if salary is also valid
        if (validateSalary(salaryInput.value) || salaryInput.value === '') {
            retentionSubmitBtn.disabled = false;
        }
    }
});

// Submit retention prediction
retentionSubmitBtn.addEventListener('click', async () => {
    const age = parseInt(ageSelect.value);
    const gender = genderSelect.value;
    const maritalStatus = maritalStatusSelect.value;
    const dependents = dependentsCount >= 6 ? 6 : dependentsCount;
    const grade = gradeSelect.value;
    const salary = parseFloat(salaryInput.value);
    const yearsService = parseInt(yearsServiceSelect.value);
    const priorReenlistments = priorReenlistmentsCount >= 6 ? 6 : priorReenlistmentsCount;
    const bonuses = parseFloat(bonusesInput.value);

    retentionSubmitBtn.disabled = true;
    retentionSubmitBtn.textContent = 'Predicting...';

    try {
        const response = await fetch(`${API_BASE_URL}/predict-retention`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                age: age,
                gender: gender,
                marital_status: maritalStatus,
                num_dependents: dependents,
                grade_rank: grade,
                salary: salary,
                years_of_service: yearsService,
                num_prior_reenlistments: priorReenlistments,
                bonuses_received: bonuses
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Display retention probability as percentage
        const probability = (result.retention_probability * 100).toFixed(1);
        retentionResultText.textContent = `${probability}%`;
        retentionResultContainer.classList.remove('hidden');
        retentionErrorContainer.classList.add('hidden');

    } catch (error) {
        console.error('Error:', error);
        retentionErrorText.textContent = `Error: ${error.message}. Make sure the Flask API is running at ${API_BASE_URL}`;
        retentionErrorContainer.classList.remove('hidden');
    } finally {
        retentionSubmitBtn.disabled = false;
        retentionSubmitBtn.textContent = 'Predict Retention';
    }
});

// Envision Dataset Query Elements
const datasetRidInput = document.getElementById('dataset-rid');
const rowLimitInput = document.getElementById('row-limit');
const rowLimitValue = document.getElementById('row-limit-value');
const queryDatasetBtn = document.getElementById('query-dataset-btn');
const queryLocalTestBtn = document.getElementById('query-local-test-btn');
const datasetLoadingDiv = document.getElementById('dataset-loading');
const datasetErrorDiv = document.getElementById('dataset-error');
const datasetErrorText = document.getElementById('dataset-error-text');
const datasetTableContainer = document.getElementById('dataset-table-container');
const datasetTableHeader = document.getElementById('dataset-table-header');
const datasetTableBody = document.getElementById('dataset-table-body');

// Update row limit display
rowLimitInput.addEventListener('input', (e) => {
    rowLimitValue.textContent = e.target.value;
});

// Build table from data
function buildDataTable(data) {
    if (data.length === 0) {
        throw new Error('No data found in dataset');
    }

    // Create table headers from the first object's keys
    const headers = Object.keys(data[0]);
    datasetTableHeader.innerHTML = headers.map(header =>
        `<th class="px-4 py-3 text-left font-semibold text-sm uppercase">${header.replace(/_/g, ' ')}</th>`
    ).join('');

    // Create table rows
    datasetTableBody.innerHTML = data.map((row, index) => {
        const bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        return `
            <tr class="${bgColor} hover:bg-indigo-50 transition-colors">
                ${headers.map(header =>
                    `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">${row[header] !== null ? row[header] : ''}</td>`
                ).join('')}
            </tr>
        `;
    }).join('');

    // Show table
    datasetTableContainer.classList.remove('hidden');
}

// Query dataset function
async function queryDataset() {
    const rid = datasetRidInput.value.trim();
    const rowLimit = parseInt(rowLimitInput.value);

    if (!rid) {
        datasetErrorText.textContent = 'Please enter a Dataset RID';
        datasetErrorDiv.classList.remove('hidden');
        return;
    }

    queryDatasetBtn.disabled = true;
    queryDatasetBtn.textContent = 'Querying...';
    datasetLoadingDiv.classList.remove('hidden');
    datasetErrorDiv.classList.add('hidden');
    datasetTableContainer.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/envision-dataset?rid=${encodeURIComponent(rid)}&rowLimit=${rowLimit}`);

        if (!response.ok) {
            if (response.status === 404 || response.status === 403) {
                throw new Error('Envision dataset was not found or you have insufficient permissions');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        // Check if response is JSON (data found)
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            buildDataTable(JSON.parse(data));
        } else {
            // Non-JSON response, likely an error
            throw new Error('Envision dataset was not found or you have insufficient permissions');
        }

    } catch (error) {
        console.error('Error querying dataset:', error);
        datasetErrorText.textContent = error.message;
        datasetErrorDiv.classList.remove('hidden');
    } finally {
        datasetLoadingDiv.classList.add('hidden');
        queryDatasetBtn.disabled = false;
        queryDatasetBtn.textContent = 'Query Envision Dataset';
    }
}

// Query local test dataset function
async function queryLocalTest() {
    queryLocalTestBtn.disabled = true;
    queryLocalTestBtn.textContent = 'Querying...';
    datasetLoadingDiv.classList.remove('hidden');
    datasetErrorDiv.classList.add('hidden');
    datasetTableContainer.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/local-retention-dataset`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Local retention dataset was not found');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        // Check if response is JSON (data found)
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            buildDataTable(data);
        } else {
            // Non-JSON response, likely an error
            throw new Error('Local retention dataset was not found');
        }

    } catch (error) {
        console.error('Error querying local test dataset:', error);
        datasetErrorText.textContent = error.message;
        datasetErrorDiv.classList.remove('hidden');
    } finally {
        datasetLoadingDiv.classList.add('hidden');
        queryLocalTestBtn.disabled = false;
        queryLocalTestBtn.textContent = 'Query Local Test';
    }
}

// Query dataset button click handler
queryDatasetBtn.addEventListener('click', queryDataset);

// Query local test button click handler
queryLocalTestBtn.addEventListener('click', queryLocalTest);

// Ticket Assignment Group Elements
const ticketNumberInput = document.getElementById('ticket-number');
const businessApplicationInput = document.getElementById('business-application');
const categoryInput = document.getElementById('category');
const shortDescriptionInput = document.getElementById('short-description');
const descriptionTextarea = document.getElementById('description');
const ticketAssignmentSubmitBtn = document.getElementById('ticket-assignment-submit-btn');
const ticketAssignmentResultContainer = document.getElementById('ticket-assignment-result-container');
const predictedAssignmentGroup = document.getElementById('predicted-assignment-group');
const predictionConfidence = document.getElementById('prediction-confidence');
const ticketAssignmentErrorContainer = document.getElementById('ticket-assignment-error-container');
const ticketAssignmentErrorText = document.getElementById('ticket-assignment-error-text');
const ticketAssignmentValidationError = document.getElementById('ticket-assignment-validation-error');

// Submit ticket assignment prediction
ticketAssignmentSubmitBtn.addEventListener('click', async () => {
    const ticketNumber = ticketNumberInput.value.trim();
    const businessApplication = businessApplicationInput.value.trim();
    const category = categoryInput.value.trim();
    const shortDescription = shortDescriptionInput.value.trim();
    const description = descriptionTextarea.value.trim();

    // Hide all message containers first
    ticketAssignmentValidationError.classList.add('hidden');
    ticketAssignmentResultContainer.classList.add('hidden');
    ticketAssignmentErrorContainer.classList.add('hidden');

    // Validate that all fields are filled
    if (!ticketNumber || !businessApplication || !category || !shortDescription || !description) {
        ticketAssignmentValidationError.classList.remove('hidden');
        return;
    }

    ticketAssignmentSubmitBtn.disabled = true;
    ticketAssignmentSubmitBtn.textContent = 'Predicting...';

    try {
        const response = await fetch(`${API_BASE_URL}/predict_ticket_assignment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tickets: [
                    {
                        "Ticket_Number": ticketNumber,
                        "Business Application": businessApplication,
                        "Category": category,
                        "Short description": shortDescription,
                        "Description": description
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Display the prediction results
        if (result.predictions && result.predictions.length > 0) {
            const prediction = result.predictions[0];
            predictedAssignmentGroup.textContent = prediction.Predicted_Assignment_Group;
            predictionConfidence.textContent = (prediction.Confidence * 100).toFixed(2) + '%';
            ticketAssignmentResultContainer.classList.remove('hidden');
        } else {
            throw new Error('No prediction data returned');
        }

    } catch (error) {
        console.error('Error:', error);
        ticketAssignmentErrorText.textContent = `Error: ${error.message}. Make sure the Flask API is running at ${API_BASE_URL}`;
        ticketAssignmentErrorContainer.classList.remove('hidden');
    } finally {
        ticketAssignmentSubmitBtn.disabled = false;
        ticketAssignmentSubmitBtn.textContent = 'Predict Assignment Group';
    }
});
