let patientData = [];
let predictionChart = null;
let labChart = null;

// Dataiku configuration
const DATAIKU_PROJECT = 'PATIENTCOHORT';
const DATAIKU_DATASET = 'patient_all_data_joined_sf_scored';

// Load data from Dataiku dataset
async function loadData() {
    try {
        // Set the default project key
        dataiku.setDefaultProjectKey(DATAIKU_PROJECT);

        // Fetch data from Dataiku dataset
        dataiku.fetch(
            DATAIKU_DATASET,
            { sampling: 'full' },
            function(dataframe) {
                // Convert dataframe to array of objects
                const numRows = dataframe.getNbRows();
                patientData = [];

                for (let i = 0; i < numRows; i++) {
                    patientData.push(dataframe.getRecord(i));
                }

                // Populate sample IDs
                const sampleIds = document.getElementById('sampleIds');
                const uniqueIds = [...new Set(patientData.map(p => p.patient_id))].slice(0, 10);
                uniqueIds.forEach(id => {
                    const span = document.createElement('span');
                    span.className = 'sample-id';
                    span.textContent = id;
                    span.onclick = () => {
                        document.getElementById('patientId').value = id;
                        searchPatient(id);
                    };
                    sampleIds.appendChild(span);
                });

                console.log(`Loaded ${patientData.length} patient records from Dataiku`);
            },
            function(error) {
                console.error('Error loading data from Dataiku:', error);
                showError('Failed to load patient data from Dataiku. Please check your connection.');
            }
        );
    } catch (error) {
        console.error('Error initializing Dataiku:', error);
        showError('Failed to initialize Dataiku connection.');
    }
}

// Show error message to user
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    document.getElementById('errorText').textContent = message;
    errorSection.style.display = 'block';
}

// Search for patient
function searchPatient(id) {
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const resultsSection = document.getElementById('resultsSection');

    loadingSection.style.display = 'flex';
    errorSection.style.display = 'none';
    resultsSection.classList.remove('active');

    setTimeout(() => {
        const patient = patientData.find(p => p.patient_id.toLowerCase() === id.toLowerCase());
        loadingSection.style.display = 'none';

        if (!patient) {
            errorSection.style.display = 'block';
            document.getElementById('errorText').textContent = `Patient "${id}" not found in the database.`;
            return;
        }

        displayPatient(patient);
        resultsSection.classList.add('active');
    }, 300);
}

// Display patient data
function displayPatient(patient) {
    // Stats row
    const statsRow = document.getElementById('statsRow');
    const enrollProb = (parseFloat(patient.proba_1) * 100).toFixed(1);
    statsRow.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${patient.patient_id}</div>
            <div class="stat-label">Patient ID</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${patient.age}</div>
            <div class="stat-label">Age (years)</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${enrollProb}%</div>
            <div class="stat-label">Enrollment Probability</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${patient.site_distance_km} km</div>
            <div class="stat-label">Distance to Site</div>
        </div>
    `;

    // Demographics
    const demographicsGrid = document.getElementById('demographicsGrid');
    demographicsGrid.innerHTML = `
        <div class="info-item">
            <div class="info-label">Gender</div>
            <div class="info-value">${patient.gender}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Age</div>
            <div class="info-value">${patient.age} years</div>
        </div>
        <div class="info-item">
            <div class="info-label">Region</div>
            <div class="info-value">${patient.region}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Last Visit</div>
            <div class="info-value">${formatDate(patient.last_visit_date)}</div>
        </div>
    `;

    // Contact badge
    const contactBadge = document.getElementById('contactBadge');
    contactBadge.className = `card-badge badge-${patient.contact_status.toLowerCase()}`;
    contactBadge.textContent = patient.contact_status;

    // Factors grid
    const factorsGrid = document.getElementById('factorsGrid');
    const distance = parseFloat(patient.site_distance_km);
    const contraindications = parseInt(patient.contraindication_count);
    const enrollHistory = parseInt(patient.enrollment_history);

    factorsGrid.innerHTML = `
        <div class="factor-item ${distance < 20 ? 'factor-positive' : distance < 40 ? 'factor-neutral' : 'factor-negative'}">
            <div class="factor-icon">${distance < 20 ? '&#x2705;' : distance < 40 ? '&#x26A0;' : '&#x274C;'}</div>
            <div class="factor-text">
                <div class="factor-label">Site Distance</div>
                <div class="factor-value">${distance} km</div>
            </div>
        </div>
        <div class="factor-item ${contraindications === 0 ? 'factor-positive' : contraindications < 2 ? 'factor-neutral' : 'factor-negative'}">
            <div class="factor-icon">${contraindications === 0 ? '&#x2705;' : contraindications < 2 ? '&#x26A0;' : '&#x274C;'}</div>
            <div class="factor-text">
                <div class="factor-label">Contraindications</div>
                <div class="factor-value">${contraindications}</div>
            </div>
        </div>
        <div class="factor-item ${enrollHistory > 0 ? 'factor-positive' : 'factor-neutral'}">
            <div class="factor-icon">${enrollHistory > 0 ? '&#x2705;' : '&#x2796;'}</div>
            <div class="factor-text">
                <div class="factor-label">Prior Enrollments</div>
                <div class="factor-value">${enrollHistory}</div>
            </div>
        </div>
        <div class="factor-item ${patient.contact_status === 'Active' ? 'factor-positive' : 'factor-negative'}">
            <div class="factor-icon">${patient.contact_status === 'Active' ? '&#x2705;' : '&#x274C;'}</div>
            <div class="factor-text">
                <div class="factor-label">Contact Status</div>
                <div class="factor-value">${patient.contact_status}</div>
            </div>
        </div>
    `;

    // Prediction
    const prediction = parseInt(patient.prediction);
    const proba1 = parseFloat(patient.proba_1);
    const proba0 = parseFloat(patient.proba_0);

    const predictionDetails = document.getElementById('predictionDetails');
    predictionDetails.innerHTML = `
        <div class="prediction-result ${prediction === 1 ? 'prediction-success' : 'prediction-failure'}">
            <div class="prediction-icon">${prediction === 1 ? '&#x2713;' : '&#x2717;'}</div>
            <div class="prediction-text">
                <h3>${prediction === 1 ? 'Likely to Enroll' : 'Unlikely to Enroll'}</h3>
                <p>${prediction === 1 ? 'High probability of successful enrollment' : 'Consider outreach strategies to improve engagement'}</p>
            </div>
        </div>
        <div class="probability-bars">
            <div class="probability-bar">
                <span class="probability-label">Success</span>
                <div class="probability-track">
                    <div class="probability-fill probability-success" style="width: ${proba1 * 100}%">
                        ${(proba1 * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
            <div class="probability-bar">
                <span class="probability-label">Failure</span>
                <div class="probability-track">
                    <div class="probability-fill probability-failure" style="width: ${proba0 * 100}%">
                        ${(proba0 * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    `;

    // Prediction gauge chart
    if (predictionChart) {
        predictionChart.destroy();
    }

    const gaugeCtx = document.getElementById('predictionGauge').getContext('2d');
    predictionChart = new Chart(gaugeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Success Probability', 'Failure Probability'],
            datasets: [{
                data: [proba1 * 100, proba0 * 100],
                backgroundColor: [
                    prediction === 1 ? '#27ae60' : '#e74c3c',
                    '#e8ecef'
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw.toFixed(1) + '%';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

                ctx.save();
                ctx.font = 'bold 24px -apple-system, sans-serif';
                ctx.fillStyle = prediction === 1 ? '#27ae60' : '#e74c3c';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText((proba1 * 100).toFixed(0) + '%', centerX, centerY);
                ctx.restore();
            }
        }]
    });

    // Lab results
    const labBody = document.getElementById('labBody');
    const flagClass = patient.flag === 'Normal' ? 'flag-normal' : patient.flag === 'High' ? 'flag-high' : 'flag-low';
    labBody.innerHTML = `
        <tr>
            <td><strong>${patient.test_name}</strong><br><small style="color: #5d6d7e">${patient.test_type}</small></td>
            <td><strong>${parseFloat(patient.result_value).toFixed(1)}</strong> ${patient.result_unit}</td>
            <td>${patient.reference_low} - ${patient.reference_high}</td>
            <td><span class="lab-flag ${flagClass}">${patient.flag}</span></td>
        </tr>
    `;

    // Lab chart
    if (labChart) {
        labChart.destroy();
    }

    const labCtx = document.getElementById('labChart').getContext('2d');
    const resultValue = parseFloat(patient.result_value);
    const refLow = parseFloat(patient.reference_low);
    const refHigh = parseFloat(patient.reference_high);
    const maxVal = Math.max(resultValue, refHigh) * 1.2;

    labChart = new Chart(labCtx, {
        type: 'bar',
        data: {
            labels: [patient.test_name],
            datasets: [{
                label: 'Result',
                data: [resultValue],
                backgroundColor: patient.flag === 'Normal' ? '#27ae60' : patient.flag === 'High' ? '#e74c3c' : '#f39c12',
                barPercentage: 0.5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                annotation: {
                    annotations: {
                        refRange: {
                            type: 'box',
                            xMin: refLow,
                            xMax: refHigh,
                            backgroundColor: 'rgba(46, 204, 113, 0.1)',
                            borderColor: 'rgba(46, 204, 113, 0.3)',
                            borderWidth: 1
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: maxVal,
                    title: {
                        display: true,
                        text: patient.result_unit
                    }
                }
            }
        }
    });

    // Clinical notes
    const noteContent = document.getElementById('noteContent');
    noteContent.innerHTML = `
        <div class="note-header">
            <span class="note-type">${patient.note_type}</span>
            <span class="note-meta">
                <strong>${patient.provider_id}</strong> &bull; ${formatDate(patient.note_date)}
            </span>
        </div>
        <div class="note-text">${patient.note_text}</div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Event listeners
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('patientId').value.trim();
    if (id) {
        searchPatient(id);
    }
});

// Load data on page load
loadData();
