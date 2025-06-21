// the idea is to have a side menu next to a display menu that displays the item picked on the side menu, then have an order summary below with the order information that allows one to edit their order

document.addEventListener('DOMContentLoaded', function() {

    const menuList = document.getElementById('menu-list');
    const menuDisplay = document.getElementById('menu-display');
    const orderSummary = document.getElementById('order-summary');
    document.getElementById('userEmail').addEventListener('input', handleOrderTotal);
    const BASE_URL = "http://localhost:3000";
    const currentOrders = [];

    const checkoutBtn = document.querySelector('#checkoutButton');
    checkoutBtn.textContent = 'Checkout';
    checkoutBtn.addEventListener('click', handleCheckout);


    fetch(`${BASE_URL}/menu`)
    .then(res => res.json())
    .then((menuItems) => {
        menuItems.forEach(dish => {
            renderDishList(dish);
        });

        if (menuItems.length > 0) {
            renderDishDisplay(menuItems[0]);
        }
    })

    function renderDishList(dish) {
        const dishLink = document.createElement('li')
        dishLink.innerHTML = `<a href= "#">${dish.name}</a>`;

        dishLink.addEventListener('click', () => renderDishDisplay(dish));

        menuList.appendChild(dishLink)
    }

    function renderDishDisplay(dish) {
        menuDisplay.innerHTML = '';

        const card = document.createElement('div');
        card.innerHTML = `
            <img src="${dish.image} ">
            <h4>${dish.name}</h4>
            <p>${dish.description}</p>
        `
        card.className = 'dishCard'


        const orderBtn = document.createElement('button');
        orderBtn.textContent = 'Order Now';
        orderBtn.className = 'orderButton'
        orderBtn.addEventListener('click', () => handleOrderSummary(dish))

        const orderBtnAndPrice = document.createElement('div')
        const priceTag = document.createElement('p');
        priceTag.textContent = `kes. ${dish.price}`;

        orderBtnAndPrice.append(priceTag, orderBtn);

        card.append(orderBtnAndPrice);
        menuDisplay.appendChild(card);
    }


    function handleOrderSummary(dish) {
        console.log("Order button clicked for:", dish.name);
        currentOrders.push(dish);
        console.log(currentOrders)
        
        const orderedDishes = document.createElement('li');
        const index = currentOrders.length - 1;
        orderedDishes.innerHTML = `
            <span>${dish.name}</span>
            <span>${dish.price}</span>
        `;

        const removeButton = document.createElement('button')
        removeButton.textContent = 'Remove'
        removeButton.addEventListener('click', () => handleOrderDelete(index, orderedDishes))
        orderedDishes.appendChild(removeButton);
        document.getElementById('ordered-list').appendChild(orderedDishes);

        handleOrderTotal();


        if (orderedDishes.children.length >0) {
            orderSummary.classList.remove('hidden')
        }
    }


    function handleOrderDelete(index,listItem) {
        currentOrders.splice(index, 1); // removes the specific item from the array
        listItem.remove();  

        handleOrderTotal();
    }

    function handleOrderTotal() {
        console.log('Total calculated!!');

        const subtotalPrice = currentOrders.reduce((sum, dish) => sum + Number(dish.price), 0);

        const ordersubTotal = document.querySelector('#order-subtotal');
        ordersubTotal.textContent = `Sub-Total : kes ${subtotalPrice}`;

        const welcomeDiscount = document.getElementById('welcome-discount');

        let discount = 0;
        let discountPercent = 0;
        let discountMsg = '';

        // Check if subtotal qualifies for 8% discount
        if (subtotalPrice >= 750) {
            discount += 0.08;
            discountPercent += 8;
        }

        // Check for first-time customer
        const email = document.getElementById('userEmail').value.trim();

        if (email) {
            fetch(`${BASE_URL}/orders`)
                .then(res => res.json())
                .then(existingOrders => {
                    const isFirstTime = !existingOrders.some(order => order.email === email);

                    if (isFirstTime) {
                        discount += 0.15;
                        discountPercent += 15;
                        discountMsg = '🎁 To welcome you to the Little Lemon family, we gave you an additional 15% discount!';
                        welcomeDiscount.textContent = discountMsg;
                        welcomeDiscount.classList.remove('hidden');
                    } else {
                        welcomeDiscount.textContent = '';
                        welcomeDiscount.classList.add('hidden');
                    }

                    updateSummary(discount, discountPercent, subtotalPrice);
                })
                .catch(err => {
                    console.error("Error checking first-time status:", err);
                    updateSummary(discount, discountPercent, subtotalPrice);
                });
        } else {
            // No email yet, just update with basic discount if any
            welcomeDiscount.textContent = '';
            welcomeDiscount.classList.add('hidden');
            updateSummary(discount, discountPercent, subtotalPrice);
        }
    }

    function updateSummary(discount, discountPercent, subtotalPrice) {
        const appliedDiscount = document.querySelector('#applied-discount');
        const total = document.querySelector('#total');

        if (discount > 0) {
            appliedDiscount.textContent = ` Discount Applied: ${discountPercent}%`;
            appliedDiscount.classList.remove('hidden');
        } else {
            appliedDiscount.textContent = '';
            appliedDiscount.classList.add('hidden');
        }

        const totalAmount = subtotalPrice - (subtotalPrice * discount);
        total.textContent = `Total kes: ${totalAmount.toFixed(2)}`;

        console.log(`Subtotal: ${subtotalPrice}, Discount: ${discount}, Total: ${totalAmount}`);

        if (currentOrders.length === 0) {
            orderSummary.classList.add('hidden');
        }
    }

    function handleCheckout() {
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();

        if (!name || !email) {
            alert("Please enter both your name and email.");
            return;
        }

        fetch(`${BASE_URL}/orders`)
        .then(res => res.json())
        .then(existingOrders => {
            const isFirstTime = !existingOrders.some(order => order.email === email);

            const subtotal = currentOrders.reduce((sum, dish) => sum + Number(dish.price), 0);
            let discount = 0;
            let discountPercent = 0;
            let discountMsg = '';

            if (subtotal >= 750) {
                discount += 0.08;
                discountPercent += 8;
            }

            if (isFirstTime) {
                discount += 0.15;
                discountPercent += 15;
                discountMsg = '🎁 To welcome you to the Little Lemon family, we gave you an additional 15% discount!';
                document.getElementById('welcome-discount').classList.remove('hidden');
                document.getElementById('welcome-discount').textContent = discountMsg;
            } else {
                document.getElementById('welcome-discount').classList.add('hidden');
                document.getElementById('welcome-discount').textContent = '';
            }

            const discountAmount = subtotal * discount;
            const total = subtotal - discountAmount;

            // Update DOM
            const appliedDiscount = document.querySelector('#applied-discount');
            const totalDisplay = document.querySelector('#total');
            appliedDiscount.textContent = ` Discount Applied: ${discountPercent}%`;
            appliedDiscount.classList.remove('hidden');
            totalDisplay.textContent = `Total kes: ${total.toFixed(2)}`;

            const orderTime = new Date().toLocaleString();

            const orderData = {
                name,
                email,
                order: currentOrders.map(dish => dish.name),
                total: total.toFixed(2),
                discountApplied: discount.toFixed(2),
                firstTimeCustomer: isFirstTime,
                status: "paid",
                time: orderTime
            };

            return fetch(`${BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        })
        .then(res => res.json())
        .then(() => {
            const welcomeNote = document.getElementById('welcome-discount').textContent;
            alert(`🎉 Order complete! Thank you for trusting Little Lemon with your food, ${name}! 🍋\n\n${welcomeNote}`);

            // Reset UI
            document.getElementById('ordered-list').innerHTML = '';
            document.getElementById('order-subtotal').textContent = '';
            document.getElementById('applied-discount').classList.add('hidden');
            document.getElementById('applied-discount').textContent = '';
            document.getElementById('welcome-discount').classList.add('hidden');
            document.getElementById('welcome-discount').textContent = '';
            document.getElementById('total').textContent = '';
            orderSummary.classList.add('hidden');
            currentOrders.length = 0;
        })
        .catch(err => {
            console.error("Order failed:", err);
            alert("Oops! Something went wrong. Please try again.");
        });
    }

})