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

        // Show loading spinner while fetching
        document.getElementById('loadingSection').style.display = 'flex';

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

                document.getElementById('loadingSection').style.display = 'none';
                console.log(`Loaded ${patientData.length} patient records from Dataiku`);

                function getParam(name) {
                    try {
                        const s = new URLSearchParams(window.location.search);
                        const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                        return s.get(name) || h.get(name) || null;
                    } catch(e) { return null; }
                }
                const urlPatientId = getParam('patientid') || getParam('patientId');
                if (urlPatientId) {
                    document.getElementById('patientId').value = urlPatientId;
                    searchPatient(urlPatientId);
                } else {
                    // Default: show site risk view
                    showRiskViewDefault();
                }
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


// ── Priority Candidate View ────────────────────────────────────────────────

const SITE_MAP = {
    'SITE-NE-01': { region: 'Northeast', name: 'Boston, MA' },
    'SITE-NE-02': { region: 'Northeast', name: 'New York, NY' },
    'SITE-NE-03': { region: 'Northeast', name: 'Philadelphia, PA' },
    'SITE-NE-04': { region: 'Northeast', name: 'Hartford, CT' },
    'SITE-MW-01': { region: 'Midwest',   name: 'Chicago, IL' },
    'SITE-SE-01': { region: 'Southeast', name: 'Atlanta, GA' },
    'SITE-SW-01': { region: 'Southwest', name: 'Dallas, TX' },
    'SITE-WE-01': { region: 'West',      name: 'Denver, CO' },
    'SITE-PA-01': { region: 'Pacific',   name: 'Seattle, WA' },
};

function renderCandidateList(container, candidates) {
    container.innerHTML = '';
    candidates.forEach((p, i) => {
        const isUrgent = i < 2;
        const likelihood = Math.round(parseFloat(p.proba_1) * 100);
        const contraind = parseInt(p.contraindication_count || 0);
        const history   = parseInt(p.enrollment_history || 0);

        let eligibility, eligibilityClass;
        if (contraind === 0 && history > 0) {
            eligibility = 'High'; eligibilityClass = 'score-high';
        } else if (contraind <= 1) {
            eligibility = 'Medium'; eligibilityClass = 'score-medium';
        } else {
            eligibility = 'Low'; eligibilityClass = 'score-low';
        }

        const dist = parseFloat(p.site_distance_km || 0).toFixed(1);
        const card = document.createElement('div');
        card.className = 'candidate-card' + (isUrgent ? ' candidate-urgent' : '');
        card.innerHTML = `
            <div class="candidate-rank">${i + 1}</div>
            <div class="candidate-info">
                <div class="candidate-id">${p.patient_id}</div>
                <div class="candidate-meta">Age ${p.age} &middot; ${p.gender} &middot; ${dist} km from site</div>
            </div>
            <div class="candidate-scores">
                <div class="score-item">
                    <div class="score-label">Eligibility</div>
                    <div class="score-badge ${eligibilityClass}">${eligibility}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Likelihood</div>
                    <div class="score-bar-wrap">
                        <div class="score-bar"><div class="score-fill" style="width:${likelihood}%"></div></div>
                        <span class="score-pct">${likelihood}%</span>
                    </div>
                </div>
            </div>
            <div class="candidate-contact-badge">${p.contact_status}</div>
            ${isUrgent
                ? '<div class="appointment-tag"><span class="material-symbols-sharp">event</span> Upcoming appointment</div>'
                : '<button class="schedule-btn" onclick="scheduleAppointment(this)"><span class="material-symbols-sharp">calendar_add_on</span> Schedule appointment</button>'
            }
        `;
        container.appendChild(card);
    });
}

function showPriorityView(siteId) {
    const siteInfo = SITE_MAP[siteId] || { region: 'Northeast', name: siteId };

    // Hide search section, show priority section, show tab nav
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('prioritySection').style.display = 'block';
    document.getElementById('riskSection').style.display = 'none';
    document.getElementById('tabNav').style.display = 'flex';

    // Filter active candidates from this region, rank by proba_1
    const candidates = patientData
        .filter(p => p.region === siteInfo.region && p.contact_status === 'Active')
        .sort((a, b) => parseFloat(b.proba_1) - parseFloat(a.proba_1))
        .slice(0, 6);

    if (!candidates.length) {
        document.getElementById('prioritySubtitle').textContent = 'No active candidates found for this site.';
        return;
    }

    document.getElementById('prioritySiteBadge').textContent = siteId + ' · ' + siteInfo.region;
    document.getElementById('priorityTitle').textContent = 'Top Candidates — ' + siteInfo.name;
    document.getElementById('prioritySubtitle').textContent =
        'Ranked by eligibility fit and enrollment likelihood · 2 flagged for urgent outreach';

    renderCandidateList(document.getElementById('priorityCandidates'), candidates);
}

let riskRendered = false;

function showCandidatesView() {
    document.getElementById('prioritySection').style.display = 'block';
    document.getElementById('riskSection').style.display = 'none';
    document.getElementById('tabCandidates').classList.add('tab-btn--active');
    document.getElementById('tabRisk').classList.remove('tab-btn--active');
    // Populate candidates if not yet rendered
    if (!document.getElementById('priorityCandidates').hasChildNodes()) {
        showPriorityView('SITE-NE-01');
    }
}

function showRiskViewDefault() {
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('prioritySection').style.display = 'none';
    document.getElementById('riskSection').style.display = 'block';
    document.getElementById('tabNav').style.display = 'flex';
    document.getElementById('tabRisk').classList.add('tab-btn--active');
    document.getElementById('tabCandidates').classList.remove('tab-btn--active');
    renderRiskProfile('SITE-NE-03');
    riskRendered = true;
}

function showRiskView() {
    document.getElementById('prioritySection').style.display = 'none';
    document.getElementById('riskSection').style.display = 'block';
    document.getElementById('tabRisk').classList.add('tab-btn--active');
    document.getElementById('tabCandidates').classList.remove('tab-btn--active');
    if (!riskRendered) {
        renderRiskProfile('SITE-NE-03');
        riskRendered = true;
    }
}

function switchRiskSite(siteId) {
    riskRendered = false;
    renderRiskProfile(siteId);
    riskRendered = true;
}

// Site-level stats from sites_sf dataset
const SITE_STATS = {
    'SITE-NE-01': { current_enrollment: 8,  target_enrollment: 9,  days_left: 6,  outreach_last_2w: 12, pipeline_size: 3,  risk_score: 13.0 },
    'SITE-NE-02': { current_enrollment: 4,  target_enrollment: 13, days_left: 26, outreach_last_2w: 10, pipeline_size: 15, risk_score: 35.8 },
    'SITE-NE-03': { current_enrollment: 3,  target_enrollment: 12, days_left: 11, outreach_last_2w: 6,  pipeline_size: 18, risk_score: 75.4 },
    'SITE-NE-04': { current_enrollment: 5,  target_enrollment: 14, days_left: 22, outreach_last_2w: 10, pipeline_size: 16, risk_score: 36.2 },
};

function renderRiskProfile(siteId) {
    const siteInfo = SITE_MAP[siteId] || { region: 'Northeast', name: siteId };

    // Use pre-loaded site stats
    const ss = SITE_STATS[siteId] || {};
    const currentEnrollment = ss.current_enrollment || 0;
    const targetEnrollment  = ss.target_enrollment  || 0;
    const pipelineSize      = ss.pipeline_size      || 0;
    const outreachLast2w    = ss.outreach_last_2w   || 0;
    const daysLeft          = ss.days_left          || 0;
    const riskScore         = ss.risk_score         || 0;

    // Active candidates from patient data
    const regionData = patientData.filter(p => p.region === siteInfo.region);
    const activeData = regionData.filter(p => p.contact_status === 'Active');
    const avgDist = regionData.length > 0
        ? Math.round(regionData.reduce((sum, p) => sum + parseFloat(p.site_distance_km || 0), 0) / regionData.length)
        : 0;

    document.getElementById('riskSiteBadge').textContent = siteId + ' · ' + siteInfo.region;
    document.getElementById('riskTitle').textContent = 'Site Risk — ' + siteInfo.name;
    document.getElementById('riskSubtitle').textContent = 'Real-time enrollment health metrics · Northeast region · ' + siteId;
    document.getElementById('riskSiteSelect').value = siteId;

    // Render stat cards — risk score first, flagged in red if elevated
    const statsEl = document.getElementById('riskStats');
    const riskColor = riskScore >= 50 ? 'red' : riskScore >= 20 ? 'orange' : 'green';
    const riskSub   = riskScore >= 50 ? 'critical — immediate action' : riskScore >= 20 ? 'elevated — monitor closely' : 'low risk';
    const stats = [
        {
            icon: 'crisis_alert',
            value: String(riskScore.toFixed(1)),
            label: 'Risk Score',
            sub: riskSub,
            color: riskColor
        },
        {
            icon: 'trending_up',
            value: `${currentEnrollment} / ${targetEnrollment}`,
            label: 'Enrollment Pace',
            sub: `${daysLeft} days left in window`,
            color: daysLeft < 10 ? 'orange' : 'green'
        },
        {
            icon: 'people',
            value: String(pipelineSize),
            label: 'Pipeline',
            sub: `${outreachLast2w} outreached last 2 weeks`,
            color: 'blue'
        },
        {
            icon: 'near_me',
            value: `${avgDist} km`,
            label: 'Avg Distance',
            sub: 'to site',
            color: avgDist > 30 ? 'orange' : 'green'
        }
    ];

    statsEl.innerHTML = stats.map(s => `
        <div class="risk-stat-card risk-stat-card--${s.color}">
            <span class="material-symbols-sharp risk-stat-icon">${s.icon}</span>
            <div class="risk-stat-value">${s.value}</div>
            <div class="risk-stat-label">${s.label}</div>
            <div class="risk-stat-sub">${s.sub}</div>
        </div>
    `).join('');

    // Render action cards
    const actions = [
        {
            severity: 'high',
            dot: '🔴',
            label: 'High',
            title: 'Follow-up overdue',
            desc: '4 candidates haven\'t responded in 14+ days — immediate outreach required.',
            action: 'View'
        },
        {
            severity: 'medium',
            dot: '🟡',
            label: 'Medium',
            title: 'Transport barrier',
            desc: `Avg distance ${avgDist} km — consider launching a transport subsidy program.`,
            action: 'View'
        },
        {
            severity: 'low',
            dot: '🟢',
            label: 'Low',
            title: 'Dropout prevention',
            desc: 'Schedule check-in calls after first contact to improve retention rates.',
            action: 'Dismiss'
        }
    ];

    document.getElementById('riskActionCards').innerHTML = actions.map(a => `
        <div class="risk-action-card risk-action-card--${a.severity}">
            <div class="risk-action-severity">
                <span class="risk-action-dot">${a.dot}</span>
                <span class="risk-action-label">${a.label}</span>
            </div>
            <div class="risk-action-body">
                <div class="risk-action-title">${a.title}</div>
                <div class="risk-action-desc">${a.desc}</div>
            </div>
            <button class="risk-action-btn" onclick="this.closest('.risk-action-card').style.opacity='0.4'; this.disabled=true">${a.action}</button>
        </div>
    `).join('');

    // Render candidates list
    const riskCandidates = activeData
        .sort((a, b) => parseFloat(b.proba_1) - parseFloat(a.proba_1))
        .slice(0, 6);
    renderCandidateList(document.getElementById('riskCandidates'), riskCandidates);
}

function sendOutreach() {
    const btn = document.getElementById('sendOutreachBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-sharp">hourglass_empty</span> Sending...';
    setTimeout(() => {
        btn.style.display = 'none';
        const conf = document.getElementById('outreachConfirmation');
        conf.style.display = 'flex';
    }, 1200);
}

function showSearchView() {
    document.getElementById('prioritySection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'block';
}

function scheduleAppointment(btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-sharp">hourglass_empty</span> Scheduling...';
    setTimeout(() => {
        btn.className = 'schedule-btn schedule-btn--done';
        btn.innerHTML = '<span class="material-symbols-sharp">check</span> Scheduled';
    }, 900);
}

// Expose functions globally for onclick handlers
function sendOutreachRisk() {
    const btn = document.getElementById('sendOutreachRiskBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-sharp">hourglass_empty</span> Sending...';
    setTimeout(() => {
        btn.style.display = 'none';
        document.getElementById('outreachRiskConfirmation').style.display = 'flex';
    }, 1200);
}

window.sendOutreach = sendOutreach;
window.sendOutreachRisk = sendOutreachRisk;
window.showSearchView = showSearchView;
window.showPriorityView = showPriorityView;
window.showCandidatesView = showCandidatesView;
window.showRiskView = showRiskView;
window.switchRiskSite = switchRiskSite;
window.scheduleAppointment = scheduleAppointment;
