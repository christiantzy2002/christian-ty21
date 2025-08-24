document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('logForm');
    const tableBody = document.querySelector('#logTable tbody');
    const setCurrentTimeBtn = document.getElementById('setCurrentTime');
    const dateReceivedInput = document.getElementById('dateReceived');
    const hourInput = document.getElementById('hour');
    const minuteInput = document.getElementById('minute');
    const ampmSelect = document.getElementById('ampm');
    const truckerSelect = document.getElementById('truckerSelect');
    const truckerInput = document.getElementById('truckerInput');
    const truckerOther = document.getElementById('truckerOther');
    const boCheckBySelect = document.getElementById('boCheckBySelect');
    const boInput = document.getElementById('boInput');
    const boOther = document.getElementById('boOther');
    const addTab = document.getElementById('addTab');
    const viewTab = document.getElementById('viewTab');
    const addModal = document.getElementById('addModal');
    const viewModal = document.getElementById('viewModal');
    const exportBtn = document.getElementById('exportExcel');
    const clearAllDataBtn = document.getElementById('clearAllData');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const removeModal = document.getElementById('removeModal');
    const clearAllModal = document.getElementById('clearAllModal');
    const confirmRemoveBtn = document.getElementById('confirmRemove');
    const cancelRemoveBtn = document.getElementById('cancelRemove');
    const confirmClearAllBtn = document.getElementById('confirmClearAll');
    const cancelClearAllBtn = document.getElementById('cancelClearAll');
    const closeModals = document.querySelectorAll('.close');

    // Set current date automatically
    const now = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dateReceivedInput.value = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // Load existing logs from localStorage
    let logs = JSON.parse(localStorage.getItem('truckLogs')) || [];
    renderLogs();

    // Handle trucker select change
    truckerSelect.addEventListener('change', () => {
        if (truckerSelect.value === 'Others') {
            truckerOther.style.display = 'block';
            truckerInput.required = true;
        } else {
            truckerOther.style.display = 'none';
            truckerInput.required = false;
            truckerInput.value = '';
        }
    });

    // Handle boCheckBy select change
    boCheckBySelect.addEventListener('change', () => {
        if (boCheckBySelect.value === 'Others') {
            boOther.style.display = 'block';
            boInput.required = true;
        } else {
            boOther.style.display = 'none';
            boInput.required = false;
            boInput.value = '';
        }
    });

    // Set current time in 12-hour format
    setCurrentTimeBtn.addEventListener('click', () => {
        const now = new Date();
        let hours = now.getHours() % 12 || 12;
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        hourInput.value = hours;
        minuteInput.value = minutes;
        ampmSelect.value = now.getHours() >= 12 ? 'PM' : 'AM';
    });

    // Tab switching
    addTab.addEventListener('click', () => {
        addModal.style.display = 'block';
        viewModal.style.display = 'none';
        removeModal.style.display = 'none';
        editModal.style.display = 'none';
        clearAllModal.style.display = 'none';
        addTab.classList.add('active');
        viewTab.classList.remove('active');
    });

    viewTab.addEventListener('click', () => {
        addModal.style.display = 'none';
        viewModal.style.display = 'block';
        removeModal.style.display = 'none';
        editModal.style.display = 'none';
        clearAllModal.style.display = 'none';
        viewTab.classList.add('active');
        addTab.classList.remove('active');
        renderLogs();
    });

    // Show Add Modal by default
    addModal.style.display = 'block';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate others inputs if selected
        if (truckerSelect.value === 'Others' && !truckerInput.value.trim()) {
            alert('Please specify the other trucker.');
            return;
        }
        if (boCheckBySelect.value === 'Others' && !boInput.value.trim()) {
            alert('Please specify the other BO Checked By.');
            return;
        }

        const log = {
            dateReceived: dateReceivedInput.value,
            arrivalTime: `${hourInput.value}:${minuteInput.value} ${ampmSelect.value}`,
            trucker: truckerSelect.value === 'Others' ? truckerInput.value : truckerSelect.value,
            plateNo: document.getElementById('plateNo').value,
            cluster: document.getElementById('cluster').value,
            crates: document.getElementById('crates').value,
            bo: document.getElementById('bo').value,
            boCheckBy: boCheckBySelect.value === 'Others' ? boInput.value : boCheckBySelect.value,
            remarks: document.getElementById('remarks').value
        };

        logs.push(log);
        localStorage.setItem('truckLogs', JSON.stringify(logs));
        form.reset();
        dateReceivedInput.value = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        truckerOther.style.display = 'none';
        boOther.style.display = 'none';
        truckerInput.required = false;
        boInput.required = false;
        renderLogs();
        addModal.style.display = 'none';
        viewModal.style.display = 'block';
        viewTab.classList.add('active');
        addTab.classList.remove('active');
    });

    exportBtn.addEventListener('click', () => {
        exportToCSV();
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (logs.length === 0) {
            alert('No data to clear.');
            return;
        }
        clearAllModal.style.display = 'block';
    });

    function renderLogs() {
        tableBody.innerHTML = '';
        logs.forEach((log, index) => {
            const row = document.createElement('tr');
            Object.values(log).forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });
            const actionCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'action-btn edit';
            actionCell.appendChild(editBtn);
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'action-btn remove';
            removeBtn.dataset.index = index;
            actionCell.appendChild(removeBtn);
            row.appendChild(actionCell);

            editBtn.addEventListener('click', () => editLog(index));
            removeBtn.addEventListener('click', () => showRemoveModal(index));
            tableBody.appendChild(row);
        });
    }

    function showRemoveModal(index) {
        removeModal.style.display = 'block';
        confirmRemoveBtn.dataset.index = index;
    }

    function editLog(index) {
        const log = logs[index];
        editModal.style.display = 'block';
        document.getElementById('editDateReceived').value = log.dateReceived;
        const [time, period] = log.arrivalTime.split(' ');
        const [hours, minutes] = time.split(':');
        document.getElementById('editHour').value = hours;
        document.getElementById('editMinute').value = minutes;
        document.getElementById('editAmpm').value = period;
        const editTruckerSelect = document.getElementById('editTruckerSelect');
        editTruckerSelect.value = log.trucker === 'Others' || !['DREAM', 'LLEYTON', 'AIR SPEED', 'PCL', 'FAST'].includes(log.trucker) ? 'Others' : log.trucker;
        const editTruckerOther = document.getElementById('editTruckerOther');
        const editTruckerInput = document.getElementById('editTruckerInput');
        if (editTruckerSelect.value === 'Others') {
            editTruckerOther.style.display = 'block';
            editTruckerInput.value = log.trucker;
            editTruckerInput.required = true;
        } else {
            editTruckerOther.style.display = 'none';
            editTruckerInput.required = false;
            editTruckerInput.value = '';
        }
        document.getElementById('editPlateNo').value = log.plateNo;
        document.getElementById('editCluster').value = log.cluster;
        document.getElementById('editCrates').value = log.crates;
        document.getElementById('editBo').value = log.bo;
        const editBoCheckBySelect = document.getElementById('editBoCheckBySelect');
        editBoCheckBySelect.value = log.boCheckBy === 'Others' || !['C.Datingaling', 'A. Gonzales', 'C. Factor'].includes(log.boCheckBy) ? 'Others' : log.boCheckBy;
        const editBoOther = document.getElementById('editBoOther');
        const editBoInput = document.getElementById('editBoInput');
        if (editBoCheckBySelect.value === 'Others') {
            editBoOther.style.display = 'block';
            editBoInput.value = log.boCheckBy;
            editBoInput.required = true;
        } else {
            editBoOther.style.display = 'none';
            editBoInput.required = false;
            editBoInput.value = '';
        }
        document.getElementById('editRemarks').value = log.remarks;

        editForm.dataset.index = index;
    }

    function removeLog(index) {
        logs.splice(index, 1);
        localStorage.setItem('truckLogs', JSON.stringify(logs));
        renderLogs();
        removeModal.style.display = 'none';
    }

    function clearAllLogs() {
        logs = [];
        localStorage.setItem('truckLogs', JSON.stringify(logs));
        renderLogs();
        clearAllModal.style.display = 'none';
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = editForm.dataset.index;
        const editTruckerSelect = document.getElementById('editTruckerSelect');
        const editTruckerInput = document.getElementById('editTruckerInput');
        const editBoCheckBySelect = document.getElementById('editBoCheckBySelect');
        const editBoInput = document.getElementById('editBoInput');

        if ((editTruckerSelect.value === 'Others' && !editTruckerInput.value.trim()) || (editBoCheckBySelect.value === 'Others' && !editBoInput.value.trim())) {
            alert('Please specify the other trucker or BO Checked By.');
            return;
        }

        logs[index] = {
            dateReceived: document.getElementById('editDateReceived').value,
            arrivalTime: `${document.getElementById('editHour').value}:${document.getElementById('editMinute').value} ${document.getElementById('editAmpm').value}`,
            trucker: editTruckerSelect.value === 'Others' ? editTruckerInput.value : editTruckerSelect.value,
            plateNo: document.getElementById('editPlateNo').value,
            cluster: document.getElementById('editCluster').value,
            crates: document.getElementById('editCrates').value,
            bo: document.getElementById('editBo').value,
            boCheckBy: editBoCheckBySelect.value === 'Others' ? editBoInput.value : editBoCheckBySelect.value,
            remarks: document.getElementById('editRemarks').value
        };

        localStorage.setItem('truckLogs', JSON.stringify(logs));
        editModal.style.display = 'none';
        renderLogs();
    });

    confirmRemoveBtn.addEventListener('click', () => {
        const index = confirmRemoveBtn.dataset.index;
        removeLog(index);
    });

    cancelRemoveBtn.addEventListener('click', () => {
        removeModal.style.display = 'none';
    });

    confirmClearAllBtn.addEventListener('click', () => {
        clearAllLogs();
    });

    cancelClearAllBtn.addEventListener('click', () => {
        clearAllModal.style.display = 'none';
    });

    closeModals.forEach(close => {
        close.addEventListener('click', () => {
            addModal.style.display = 'none';
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
            removeModal.style.display = 'none';
            clearAllModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === addModal || e.target === viewModal || e.target === editModal || e.target === removeModal || e.target === clearAllModal) {
            addModal.style.display = 'none';
            viewModal.style.display = 'none';
            editModal.style.display = 'none';
            removeModal.style.display = 'none';
            clearAllModal.style.display = 'none';
        }
    });

    function exportToCSV() {
        const csv = [
            ['Date Received', 'Arrival Time', 'Trucker', 'Plate No.', 'Cluster', 'Crates', 'BO', 'BO Checked By', 'Remarks'],
            ...logs.map(log => Object.values(log))
        ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const exportDate = new Date();
        const fileName = `TRUCK RETURN LOGBOOK - ${months[exportDate.getMonth()]} ${exportDate.getDate()} ${exportDate.getFullYear()}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});