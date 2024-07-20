"use strict";


import { db, collection, getDocs, addDoc } from './firebaseConfig.js';

// Initialize data
let inventory = {};
let recipients = [];

// Initialize Chart.js
const inventoryChart = document.getElementById('inventoryChart').getContext('2d');
const chart = new Chart(inventoryChart, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Inventory Quantity',
            data: [],
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
        }
    }
});

// Fetch inventory data
const fetchInventory = async () => {
    try {
        const inventoryCollection = collection(db, 'inventory');
        const inventorySnapshot = await getDocs(inventoryCollection);
        const inventoryData = inventorySnapshot.docs.map(doc => doc.data());
        return inventoryData.reduce((acc, item) => {
            if (item.product && typeof item.quantity === 'number') {
                acc[item.product] = item.quantity;
            }
            return acc;
        }, {});
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return {};
    }
};

// Fetch recipients data
const fetchRecipients = async () => {
    try {
        const recipientsCollection = collection(db, 'recipients');
        const recipientsSnapshot = await getDocs(recipientsCollection);
        return recipientsSnapshot.docs.map(doc => doc.data()).filter(r => r.product && r.recipient && typeof r.quantity === 'number');
    } catch (error) {
        console.error("Error fetching recipients:", error);
        return [];
    }
};

// Initialize UI and data from Firebase
const initializeData = async () => {
    try {
        inventory = await fetchInventory();
        recipients = await fetchRecipients();
        updateUI();
    } catch (error) {
        console.error("Error initializing data:", error);
    }
};

// Save inventory and recipients to Firebase
const saveToFirebase = async () => {
    try {
        const inventoryCollection = collection(db, 'inventory');
        await Promise.all(Object.keys(inventory).map(product => {
            return addDoc(inventoryCollection, { product, quantity: inventory[product] });
        }));

        const recipientsCollection = collection(db, 'recipients');
        await Promise.all(recipients.map(r => {
            return addDoc(recipientsCollection, r);
        }));
    } catch (error) {
        console.error("Error saving data to Firebase:", error);
    }
};

// Update UI function
const updateUI = () => {
    // Update Highest Quantity Products
    const highestProducts = Object.entries(inventory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const productsList = document.getElementById('highestQuantityProducts');
    if (productsList) {
        productsList.innerHTML = highestProducts.map(([product, quantity]) => `
            <div class="product-item">
                <div>${product}</div>
                <div>Quantity: ${quantity || 0}</div>
            </div>
        `).join('');
    }

    // Update Bar Chart
    chart.data.labels = Object.keys(inventory);
    chart.data.datasets[0].data = Object.values(inventory);
    chart.update();

    // Update Recipient Table
    const recipientTableBody = document.getElementById('recipientTableBody');
    if (recipientTableBody) {
        recipientTableBody.innerHTML = recipients.map(r => `
            <tr>
                <td>${r.product || 'N/A'}</td>
                <td>${r.recipient || 'N/A'}</td>
                <td>${r.quantity || 0}</td>
            </tr>
        `).join('');
    }

    // Save to Firebase
    saveToFirebase();
};

// Add Product Modal
const addProductBtn = document.getElementById('addProductBtn');
const addProductModal = document.getElementById('addProductModal');
const closeAddProduct = document.getElementById('closeAddProduct');
const addProductSubmit = document.getElementById('addProductSubmit');

addProductBtn.onclick = () => addProductModal.style.display = 'flex';
closeAddProduct.onclick = () => addProductModal.style.display = 'none';
addProductSubmit.onclick = async () => {
    const name = document.getElementById('addProductName').value.trim();
    const quantity = parseInt(document.getElementById('addProductQuantity').value, 10);

    if (name && quantity > 0) {
        inventory[name] = (inventory[name] || 0) + quantity;
        updateUI();
        addProductModal.style.display = 'none';
    } else {
        alert('Please enter valid product name and quantity.');
    }
};

// Update Inventory Modal
const updateInventoryBtn = document.getElementById('updateInventoryBtn');
const updateInventoryModal = document.getElementById('updateInventoryModal');
const closeUpdateInventory = document.getElementById('closeUpdateInventory');
const updateInventorySubmit = document.getElementById('updateInventorySubmit');

updateInventoryBtn.onclick = () => updateInventoryModal.style.display = 'flex';
closeUpdateInventory.onclick = () => updateInventoryModal.style.display = 'none';
updateInventorySubmit.onclick = async () => {
    const name = document.getElementById('updateProductName').value.trim();
    const quantity = parseInt(document.getElementById('updateProductQuantity').value, 10);
    const recipient = document.getElementById('updateRecipient').value.trim();

    if (name && quantity > 0 && recipient) {
        if (inventory[name] !== undefined) {
            // Decrease the quantity
            inventory[name] = Math.max(0, inventory[name] - quantity); // Prevent negative inventory
            recipients.push({ product: name, recipient: recipient, quantity: quantity });
            updateUI();
            updateInventoryModal.style.display = 'none';
        } else {
            alert('Product not found in inventory.');
        }
    } else {
        alert('Please enter valid product name, quantity, and recipient.');
    }
};

// Initial data load
initializeData();
