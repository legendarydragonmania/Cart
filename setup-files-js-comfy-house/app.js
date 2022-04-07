const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "odcx88d1y2gh",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "QPQspcXkp9cYiXkB7iaygSZkke0PMqMQcwnUdk3jxg8"
  });

// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartDOM = document.querySelector(".cart")
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products {
    async getProducts() {
        try {
            let response = await client.getEntries({
                content_type: "comfyHouseProducts"
            });
            let products = response.items;
            products = products.map(product => {
                const { title, price } = product.fields;
                const { id } = product.sys;
                const image = product.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// display products
class UI {
    displayProducts(products) {
        productsDOM.innerHTML = products.map(product => {
            return `<article class="product">
            <div class="img-container">
                <img src="${product.image}" width="270px" height="192px" class="product-img" alt="${product.title}">
                <button class="bag-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>`
        }).join("")
    }
    getButtons () {
        const buttons = [...document.querySelectorAll(".bag-btn")]
        buttonsDOM = buttons;
        buttons.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id === id)
            if(inCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }  
            btn.addEventListener("click", (e) => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                let cartItem = {...Storage.getProduct(id), amount: 1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = ` <img src="${item.image}" alt="${item.title}">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id="${item.id}">remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>
        </div>`;
        cartContent.appendChild(div);
        
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart")
    }
    
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart")
    }

    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart()
        })
        cartContent.addEventListener("click", (e) => {
            if(e.target.classList.contains("remove-item")) {
                const removeable = e.target;
                const id = removeable.dataset.id;
                cartContent.removeChild(removeable.parentElement.parentElement);
                this.removeItem(id)
            } else if(e.target.classList.contains("fa-chevron-up")) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempitem = cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempitem.amount
            } else if(e.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempitem = cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount - 1;
                if(tempitem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempitem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        })
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart)
        this.populate(cart);
        cartBtn.addEventListener("click", this.showCart)
        closeCartBtn.addEventListener("click", this.hideCart)
    }
    populate(cart) {
        cart.forEach(item => this.addCartItem(item))
    }

    clearCart () {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart)
        let button = this.getSingleBtn(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }

    getSingleBtn(id) {
        return buttonsDOM.find(btn => btn.dataset.id === id)
    }
}


// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct (id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    }   
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // get all products
    ui.setupAPP();
    products.getProducts().then(data => {
        ui.displayProducts(data);
        Storage.saveProducts(data)
    })
    .then(() => {
        ui.getButtons();
        ui.cartLogic();
    })
    .catch(err => console.log(err))
})


