/* ==========================================
   MUSCLEMAX - MAIN JAVASCRIPT
   ========================================== */


/* ---------- PRODUCTS ---------- */



   const products = [
    {
        id: 1,
        name: "BIOZYME PERFORMANCE WHEY",
        brand: "MuscleBlaze",
        price: 1999,
        weight: "500g",
        flavor: "Rich Chocolate",
        image: "whey.png"
    },

    {
        id: 2,
        name: "CREATINE MONOHYDRATE",
        brand: "MuscleMax",
        price: 1299,
        weight: "250g",
        flavor: "Unflavored",
        image: "whey1.png"
    },

    {
        id: 3,
        name: "PRE-WORKOUT",
        brand: "MuscleMax",
        price: 1499,
        weight: "300g",
        flavor: "Fruit Punch",
        image: "whey2.png"
    }
];


/* ---------- GET CART ---------- */

let cart =
    JSON.parse(
        localStorage.getItem("musclemax_cart")
    ) || [];


/* ---------- GET WISHLIST ---------- */

let wishlist =
    JSON.parse(
        localStorage.getItem("musclemax_wishlist")
    ) || [];


/* ==========================================
   ADD TO CART
   ========================================== */

function addToCart(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        existing.quantity++;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    localStorage.setItem(
        "musclemax_cart",
        JSON.stringify(cart)
    );


    updateCartCount();


   showToast(product.name + " added to your cart!", "🛒");
}


/* ==========================================
   CART COUNT
   ========================================== */

function updateCartCount() {

    const count =
        cart.reduce(

            (total, item) =>
                total + item.quantity,

            0

        );


    const element =
        document.getElementById(
            "cartCount"
        );


    if (element) {

        element.innerText = count;

    }

}


/* ==========================================
   ADD WISHLIST
   ========================================== */

function addWishlist(id) {

    const product =
        products.find(
            p => p.id === id
        );


    if (!product) {
        return;
    }


    const exists =
        wishlist.some(
            item => item.id === id
        );


    if (exists) {

     showToast("This product is already in your wishlist.", "♥");

        return;
    }


    wishlist.push(product);


    localStorage.setItem(
        "musclemax_wishlist",
        JSON.stringify(wishlist)
    );


   showToast(product.name + " added to your wishlist!", "♥");
}


/* ==========================================
   SHOP SCROLL
   ========================================== */

function goToShop() {

    const shop =
        document.getElementById(
            "shop"
        );


    if (shop) {

        shop.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* ==========================================
   ADMIN LOGIN BUTTON
   ========================================== */

function sellerLogin() {

    window.location.href =
        "login.html";

}


/* ==========================================
   LOGOUT
   ========================================== */

function logout() {

    localStorage.removeItem(
        "musclemax_user"
    );


    window.location.href =
        "login.html";

}


/* ==========================================
   SEARCH
   ========================================== */

const search =
    document.getElementById(
        "search"
    );


if (search) {

    search.addEventListener(
        "input",
        function() {

            const value =
                search.value
                .toLowerCase()
                .trim();


            document
                .querySelectorAll(".product")
                .forEach(
                    function(product) {

                        const name =
                            product
                            .querySelector("h3")
                            .innerText
                            .toLowerCase();


                        if (
                            name.includes(value)
                        ) {

                            product.style.display =
                                "block";

                        }

                        else {

                            product.style.display =
                                "none";

                        }

                    }
                );

        }
    );

}


/* ==========================================
   INITIAL CART COUNT
   ========================================== */

updateCartCount();


function openProduct(id) {
    window.location.href = "product.html?id=" + id;
}

function openCategory(category) {

    window.location.href =
        "category.html?category=" + category;

}

function showToast(message, icon = "✓") {

    const oldToast = document.querySelector(".musclemax-toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = "musclemax-toast";

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>

        <div class="toast-content">
            <strong>MuscleMax</strong>
            <span>${message}</span>
        </div>

        <button class="toast-close" onclick="this.parentElement.remove()">
            ×
        </button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 50);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 3000);
}