/* =========================================================
   🎄 L'ATELIER DE NOËL 3D
   app.js
   Compatible avec ton index.html actuel
   ========================================================= */


/* =========================================================
   1. SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://sdqtgluhgywedjwgolei.supabase.co";

/*
   ⚠️ COLLE ICI TA PUBLISHABLE KEY SUPABASE

   Elle commence normalement par :
   sb_publishable_

   NE METS PAS la Secret Key.
*/
const SUPABASE_KEY =
    "sb_publishable_zY7V5CoRa2mYRYhZdm8v7Q_lc5U1Lm_";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   2. CONFIGURATION
   ========================================================= */

const COLOR_LIST = [
    "Bleu",
    "Blanc",
    "Noir",
    "Rouge",
    "Jaune",
    "Vert",
    "Argent"
];

const COLOR_SUPPLEMENT = 7;
const DISCOUNT_MIN_QUANTITY = 5;
const DISCOUNT_RATE = 0.15;


/* =========================================================
   3. PRODUITS
   ========================================================= */

let PRODUCTS = [];


/* =========================================================
   4. OUTILS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function show(idOrElement) {

    const element =
        typeof idOrElement === "string"
            ? $(idOrElement)
            : idOrElement;

    if (element) {
        element.classList.remove("hidden");
    }
}


function hide(idOrElement) {

    const element =
        typeof idOrElement === "string"
            ? $(idOrElement)
            : idOrElement;

    if (element) {
        element.classList.add("hidden");
    }
}


function money(value) {

    return Number(value || 0)
        .toFixed(2)
        .replace(".", ",") + " €";
}


/* =========================================================
   5. NAVIGATION
   ========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page = $(pageId);

    if (!page) {
        console.error(
            "Page introuvable :",
            pageId
        );
        return;
    }

    page.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /*
       Si on ouvre l'administration,
       vérifier la session.
    */

    if (pageId === "admin") {
        checkAdminSession();
    }
}


/* =========================================================
   6. FLOCONS
   ========================================================= */

function createSnow() {

    const container = $("snow");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 35; i++) {

        const flake =
            document.createElement("span");

        flake.textContent = "❄";

        flake.style.position = "absolute";
        flake.style.left =
            Math.random() * 100 + "%";

        flake.style.top =
            Math.random() * -100 + "px";

        flake.style.opacity =
            Math.random() * 0.5 + 0.2;

        flake.style.fontSize =
            Math.random() * 12 + 8 + "px";

        flake.style.animation =
            `snowfall ${Math.random() * 8 + 8}s linear infinite`;

        flake.style.animationDelay =
            Math.random() * 8 + "s";

        container.appendChild(flake);
    }
}


/* =========================================================
   7. CHARGEMENT DES PRODUITS SUPABASE
   ========================================================= */

async function loadProducts() {

    console.log("🎄 Chargement des produits...");

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("price", {
            ascending: true
        });

    if (error) {

        console.error(
            "❌ Erreur Supabase produits :",
            error
        );

        const catalog =
            document.getElementById("catalog-products");

        if (catalog) {

            catalog.innerHTML = `
                <div class="message error">
                    <strong>Impossible de charger le catalogue.</strong>
                    <br><br>
                    ${error.message}
                </div>
            `;
        }

        return;
    }

    console.log(
        "✅ Produits récupérés depuis Supabase :",
        data
    );

    PRODUCTS = data || [];

    if (PRODUCTS.length === 0) {

        console.warn(
            "⚠️ Aucun produit récupéré."
        );

        const catalog =
            document.getElementById("catalog-products");

        if (catalog) {

            catalog.innerHTML = `
                <div class="message error">
                    Aucun produit n'a été récupéré depuis Supabase.
                </div>
            `;
        }

        return;
    }

    /*
     * Affichage du catalogue
     */
    renderCatalog();

    /*
     * Produits affichés sur l'accueil
     */
    renderHomeProducts();

    /*
     * Produits disponibles dans le formulaire
     */
    renderOrderProducts();

    /*
     * Produits disponibles pour l'administration
     */
    renderManualProducts();

    console.log(
        `🎄 ${PRODUCTS.length} produits affichés.`
    );
}


/* =========================================================
   8. CARTE PRODUIT
   ========================================================= */

function createProductCard(product) {

    const imageHTML =
        product.image_url
            ? `
                <div class="product-image">
                    <img
                        src="${product.image_url}"
                        alt="${product.name}"
                    >
                </div>
              `
            : `
                <div class="product-image placeholder">
                    <div class="placeholder-ball">
                        ST-WITZ
                    </div>
                </div>
              `;


    let options = "";


    if (product.customizable) {

        options += `
            <span class="product-tag">
                Personnalisable
            </span>
        `;
    }


    if (product.has_year) {

        options += `
            <span class="product-tag">
                Prénom + année
            </span>
        `;
    }


    if (product.two_colors) {

        options += `
            <span class="product-tag">
                2 couleurs
            </span>
        `;
    } else {

        options += `
            <span class="product-tag">
                1 couleur
            </span>
        `;
    }


    return `
        <article
            class="product-card"
            data-product-id="${product.id}"
        >

            ${imageHTML}

            <div class="product-content">

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description || ""}
                </p>

                <div class="product-tags">
                    ${options}
                </div>

                <div class="product-bottom">

                    <strong class="product-price">
                        ${money(product.price)}
                    </strong>

                    <button
                        class="btn primary"
                        onclick="chooseProduct('${product.id}')"
                    >
                        Choisir
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   9. CATALOGUE
   ========================================================= */

function renderCatalog() {

    const container =
        $("catalog-products");

    if (!container) return;


    if (!PRODUCTS.length) {

        container.innerHTML = `
            <div class="message">
                Aucun modèle disponible.
            </div>
        `;

        return;
    }


    container.innerHTML =
        PRODUCTS
            .map(createProductCard)
            .join("");
}


/* =========================================================
   10. PRODUITS ACCUEIL
   ========================================================= */

function renderHomeProducts() {

    const container =
        $("home-products");

    if (!container) return;


    /*
       On affiche les produits sur l'accueil.
       Maximum 8.
    */

    container.innerHTML =
        PRODUCTS
            .map(createProductCard)
            .join("");
}


/* =========================================================
   11. PRODUITS DE LA COMMANDE
   ========================================================= */

function renderOrderProducts() {

    const container =
        $("order-product-grid");

    if (!container) return;


    container.innerHTML = "";


    PRODUCTS.forEach(product => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "choice-card";


        button.dataset.productId =
            product.id;


        button.innerHTML = `

            <div class="choice-card-image">

                ${
                    product.image_url

                    ?

                    `<img
                        src="${product.image_url}"
                        alt="${product.name}"
                    >`

                    :

                    `<div class="choice-placeholder">
                        ST-WITZ
                    </div>`
                }

            </div>

            <div>

                <strong>
                    ${product.name}
                </strong>

                <span>
                    ${money(product.price)}
                </span>

            </div>
        `;


        button.addEventListener(
            "click",
            () => {

                selectOrderProduct(
                    product.id
                );

            }
        );


        container.appendChild(button);
    });
}


/* =========================================================
   12. CHOISIR UN PRODUIT
   ========================================================= */

function chooseProduct(productId) {

    showPage("order");

    setTimeout(() => {

        selectOrderProduct(productId);

    }, 100);
}


function selectOrderProduct(productId) {

    const product =
        PRODUCTS.find(
            p => String(p.id) === String(productId)
        );


    if (!product) {
        console.error(
            "Produit introuvable :",
            productId
        );
        return;
    }


    $("product-id").value =
        product.id;


    /*
       Sélection visuelle
    */

    document
        .querySelectorAll(
            "#order-product-grid .choice-card"
        )
        .forEach(card => {

            card.classList.toggle(
                "selected",
                String(
                    card.dataset.productId
                ) === String(product.id)
            );

        });


    updateOrderOptions(product);

    updatePrice();
}


/* =========================================================
   13. OPTIONS DU PRODUIT
   ========================================================= */

function updateOrderOptions(product) {


    /* -----------------------------------------------------
       MODÈLE VISUEL
       ----------------------------------------------------- */

    const designBlock =
        $("order-design-block");

    const designOptions =
        $("order-design-options");


    /*
       Les modèles disponibles :
       Rennes
       Sapin
       Bonhomme de neige
       Étoile
    */

    if (designBlock && designOptions) {

        designOptions.innerHTML = `

            <button
                type="button"
                class="pill"
                data-design="Renne"
            >
                🦌 Renne
            </button>

            <button
                type="button"
                class="pill"
                data-design="Sapin"
            >
                Sapin
            </button>

            <button
                type="button"
                class="pill"
                data-design="Bonhomme de neige"
            >
                ⛄ Bonhomme de neige
            </button>

            <button
                type="button"
                class="pill"
                data-design="Étoile"
            >
                ⭐ Étoile
            </button>
        `;


        designBlock.classList.remove(
            "hidden"
        );


        designOptions
            .querySelectorAll(".pill")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        designOptions
                            .querySelectorAll(".pill")
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "selected"
                                    )
                            );

                        button.classList.add(
                            "selected"
                        );
                    }
                );
            });
    }


    /* -----------------------------------------------------
       PERSONNALISATION
       ----------------------------------------------------- */

    const personalizationBlock =
        $("order-personalization-block");


    if (
        product.customizable
    ) {

        show(personalizationBlock);

        const help =
            $("personalization-help");

        if (help) {

            if (product.has_year) {

                help.textContent =
                    "Indiquez le prénom et l'année à inscrire sur votre boule.";
            } else {

                help.textContent =
                    "Indiquez le prénom à inscrire sur votre boule.";
            }
        }

    } else {

        hide(personalizationBlock);
    }


    /* -----------------------------------------------------
       ANNÉE
       ----------------------------------------------------- */

    const yearField =
        $("year-field");


    if (
        product.customizable &&
        product.has_year
    ) {

        show(yearField);

    } else {

        hide(yearField);
    }


    /* -----------------------------------------------------
       DEUX COULEURS
       ----------------------------------------------------- */

    const colorsBlock =
        $("order-colors-block");


    if (product.two_colors) {

        show(colorsBlock);

        populateColors(
            "color-1",
            "color-2"
        );

    } else {

        hide(colorsBlock);
    }
}


/* =========================================================
   14. COULEURS
   ========================================================= */

function populateColors(
    firstId,
    secondId
) {

    const first =
        $(firstId);

    const second =
        $(secondId);


    if (!first || !second) return;


    const options =
        `<option value="">
            Choisir...
        </option>` +

        COLOR_LIST
            .map(
                color =>
                    `<option value="${color}">
                        ${color}
                    </option>`
            )
            .join("");


    first.innerHTML =
        options;

    second.innerHTML =
        options;
}


/* =========================================================
   15. PRIX
   ========================================================= */

function calculateOrderPrice() {

    const productId =
        $("product-id")?.value;


    const product =
        PRODUCTS.find(
            p =>
                String(p.id) ===
                String(productId)
        );


    if (!product) {

        return {
            subtotal: 0,
            surcharge: 0,
            discount: 0,
            total: 0,
            deposit: 0,
            delivery: 0,
            quantity: 1
        };
    }


    const quantity =
        Math.max(
            1,
            parseInt(
                $("quantity")?.value || "1"
            )
        );


    const subtotal =
        Number(product.price) *
        quantity;


    let surcharge = 0;


    if (
        $("specific-color")?.checked
    ) {

        surcharge =
            COLOR_SUPPLEMENT;
    }


    let discount = 0;


    if (
        quantity >=
        DISCOUNT_MIN_QUANTITY
    ) {

        discount =
            (subtotal + surcharge) *
            DISCOUNT_RATE;
    }


    const total =
        Math.max(
            0,
            subtotal +
            surcharge -
            discount
        );


    const deposit =
        total / 2;


    const delivery =
        total / 2;


    return {

        subtotal,
        surcharge,
        discount,
        total,
        deposit,
        delivery,
        quantity
    };
}


function updatePrice() {

    const price =
        calculateOrderPrice();


    if ($("subtotal")) {

        $("subtotal").textContent =
            money(price.subtotal);
    }


    if ($("color-surcharge")) {

        $("color-surcharge").textContent =
            money(price.surcharge);
    }


    if ($("discount")) {

        $("discount").textContent =
            price.discount > 0
                ? "- " + money(price.discount)
                : money(0);
    }


    if ($("total")) {

        $("total").textContent =
            money(price.total);
    }


    if ($("deposit")) {

        $("deposit").textContent =
            money(price.deposit);
    }


    if ($("delivery")) {

        $("delivery").textContent =
            money(price.delivery);
    }


    const promo =
        $("promo-message");


    if (promo) {

        if (
            price.quantity >=
            DISCOUNT_MIN_QUANTITY
        ) {

            promo.textContent =
                "🎉 Félicitations ! Vous bénéficiez de -15 %.";

        } else {

            promo.textContent =
                "À partir de 5 boules : -15 % sur les boules.";
        }
    }
}


/* =========================================================
   16. FORMULAIRE COMMANDE
   ========================================================= */

async function submitOrder(event) {

    event.preventDefault();


    const errorBox =
        $("order-error");

    hide(errorBox);


    const productId =
        $("product-id").value;


    const product =
        PRODUCTS.find(
            p =>
                String(p.id) ===
                String(productId)
        );


    if (!product) {

        showOrderError(
            "Veuillez sélectionner un modèle."
        );

        return;
    }


    /*
       Vérification des couleurs
    */

    if (product.two_colors) {

        const color1 =
            $("color-1").value;

        const color2 =
            $("color-2").value;


        if (!color1 || !color2) {

            showOrderError(
                "Veuillez choisir vos deux couleurs."
            );

            return;
        }


        if (color1 === color2) {

            showOrderError(
                "Les deux couleurs doivent être différentes."
            );

            return;
        }
    }


    /*
       Vérification personnalisation
    */

    if (product.customizable) {

        if (
            !$("personalization-name").value.trim()
        ) {

            showOrderError(
                "Veuillez indiquer le prénom à inscrire."
            );

            return;
        }


        if (
            product.has_year &&
            !$("personalization-year").value
        ) {

            showOrderError(
                "Veuillez indiquer l'année."
            );

            return;
        }
    }


    const price =
        calculateOrderPrice();


    const button =
        $("order-submit");


    button.disabled = true;

    button.textContent =
        "Enregistrement...";


    try {

        const data = {

            customer_first_name:
                $("first-name").value.trim(),

            customer_name:
                $("last-name").value.trim(),

            address:
                $("street").value.trim(),

            city:
                $("city").value.trim(),

            address_complement:
                $("complement").value.trim() ||
                null,

            email:
                $("email").value.trim(),

            phone:
                $("phone").value.trim() ||
                null,


            model:
                product.name,

            model_key:
                product.product_key,


            custom_first_name:
                product.customizable
                    ? $("personalization-name").value.trim()
                    : null,


            custom_year:
                product.has_year
                    ? $("personalization-year").value
                    : null,


            color_1:
                product.two_colors
                    ? $("color-1").value
                    : null,


            color_2:
                product.two_colors
                    ? $("color-2").value
                    : null,


            quantity:
                price.quantity,


            specific_color:
                $("specific-color").checked,


            color_supplement:
                price.surcharge,


            base_price:
                price.subtotal,


            discount:
                price.discount,


            total_price:
                price.total,


            deposit_price:
                price.deposit,


            delivery_price:
                price.delivery,


            status:
                "pending"
        };


        const {
            data: order,
            error
        } =
            await supabaseClient
                .from("orders")
                .insert(data)
                .select()
                .single();


        if (error) {

            console.error(error);

            throw error;
        }


        /*
           Afficher le succès
        */

        $("success-number").textContent =
            order.order_number;


        show("order-success");


        $("order-success")
            .scrollIntoView({
                behavior: "smooth"
            });


        /*
           Réinitialiser
        */

        $("order-form").reset();

        $("product-id").value = "";

        document
            .querySelectorAll(
                "#order-product-grid .choice-card"
            )
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );
            });


        hide("order-design-block");
        hide("order-personalization-block");
        hide("order-colors-block");


        updatePrice();


    } catch (error) {

        showOrderError(
            "Impossible d'enregistrer la commande : " +
            error.message
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Valider la commande";
    }
}


function showOrderError(message) {

    const box =
        $("order-error");

    if (!box) {

        alert(message);

        return;
    }


    box.textContent =
        message;

    show(box);
}


/* =========================================================
   17. SUIVI COMMANDE
   ========================================================= */

async function trackOrder() {

    const input =
        $("tracking-number");

    const loading =
        $("tracking-loading");

    const errorBox =
        $("tracking-error");

    const result =
        $("tracking-result");


    hide(errorBox);
    hide(result);


    let number =
        input.value.trim().toUpperCase();


    if (!number) {

        errorBox.textContent =
            "Entrez votre numéro de commande.";

        show(errorBox);

        return;
    }


    if (!number.startsWith("#")) {

        number =
            "#" + number;
    }


    show(loading);


    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .select(
                "order_number,status"
            )
            .eq(
                "order_number",
                number
            )
            .maybeSingle();


    hide(loading);


    if (error) {

        console.error(error);

        errorBox.textContent =
            error.message;

        show(errorBox);

        return;
    }


    if (!data) {

        errorBox.textContent =
            "Commande introuvable.";

        show(errorBox);

        return;
    }


    const statuses = {

        pending: {
            icon: "🔴",
            title:
                "En attente de validation / passage",
            description:
                "Nous allons passer chez vous valider le modèle et récupérer les espèces."
        },

        manufacturing: {
            icon: "🟡",
            title:
                "En cours de fabrication",
            description:
                "L'impression 3D est lancée !"
        },

        ready: {
            icon: "🟢",
            title:
                "Prête pour la livraison !",
            description:
                "Nous repassons chez vous vous apporter votre boule."
        },

        delivered: {
            icon: "⚫",
            title:
                "Livrée",
            description:
                "Commande terminée."
        }
    };


    const status =
        statuses[data.status] ||
        statuses.pending;


    $("tracking-icon").textContent =
        status.icon;


    $("tracking-order-number").textContent =
        data.order_number;


    $("tracking-title").textContent =
        status.title;


    $("tracking-description").textContent =
        status.description;


    show(result);
}


/* =========================================================
   18. ADMIN LOGIN
   ========================================================= */

async function adminLogin() {

    const email =
        $("admin-email").value.trim();

    const password =
        $("admin-password").value;


    const errorBox =
        $("admin-login-error");


    hide(errorBox);


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({
                email,
                password
            });


    if (error) {

        console.error(error);

        errorBox.textContent =
            "E-mail ou mot de passe incorrect.";

        show(errorBox);

        return;
    }


    console.log(
        "Admin connecté :",
        data.user.email
    );


    showPage("admin");

    await loadOrders();
}


/* =========================================================
   19. VÉRIFICATION ADMIN
   ========================================================= */

async function checkAdminSession() {

    const {
        data
    } =
        await supabaseClient.auth
            .getSession();


    if (!data.session) {

        showPage("admin-login");

        return false;
    }


    return true;
}


/* =========================================================
   20. DÉCONNEXION
   ========================================================= */

async function logoutAdmin() {

    await supabaseClient.auth.signOut();

    showPage("home");
}


/* =========================================================
   21. COMMANDES ADMIN
   ========================================================= */

async function loadOrders() {

    const table =
        $("orders-table");


    if (!table) return;


    table.innerHTML = `
        <tr>
            <td colspan="8">
                Chargement...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    ${error.message}
                </td>
            </tr>
        `;

        return;
    }


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    Aucune commande.
                </td>
            </tr>
        `;

        updateStats([]);

        return;
    }


    table.innerHTML = "";


    data.forEach(order => {

        const row =
            document.createElement("tr");


        const personalization =
            [
                order.custom_first_name,
                order.custom_year
            ]
            .filter(Boolean)
            .join(" / ") || "—";


        const colors =
            [
                order.color_1,
                order.color_2
            ]
            .filter(Boolean)
            .join(" / ") || "—";


        row.innerHTML = `

            <td>
                <strong>
                    ${order.order_number}
                </strong>
            </td>

            <td>
                ${order.customer_first_name || ""}
                ${order.customer_name || ""}
                <br>
                <small>
                    ${order.email || ""}
                </small>
            </td>

            <td>
                ${order.address || ""}
                <br>
                ${order.city || ""}
            </td>

            <td>
                ${order.model || ""}
            </td>

            <td>
                ${personalization}
            </td>

            <td>
                ${colors}
            </td>

            <td>
                <strong>
                    ${money(order.total_price)}
                </strong>
            </td>

            <td>

                <select
                    onchange="
                        changeOrderStatus(
                            '${order.id}',
                            this.value
                        )
                    "
                >

                    <option
                        value="pending"
                        ${order.status === "pending" ? "selected" : ""}
                    >
                        🔴 En attente
                    </option>

                    <option
                        value="manufacturing"
                        ${order.status === "manufacturing" ? "selected" : ""}
                    >
                        🟡 Fabrication
                    </option>

                    <option
                        value="ready"
                        ${order.status === "ready" ? "selected" : ""}
                    >
                        🟢 Prête
                    </option>

                    <option
                        value="delivered"
                        ${order.status === "delivered" ? "selected" : ""}
                    >
                        ⚫ Livrée
                    </option>

                </select>

            </td>

        `;


        table.appendChild(row);
    });


    updateStats(data);
}


/* =========================================================
   22. STATISTIQUES ADMIN
   ========================================================= */

function updateStats(orders) {

    const total =
        orders.length;


    const pending =
        orders.filter(
            o => o.status === "pending"
        ).length;


    const production =
        orders.filter(
            o =>
                o.status === "manufacturing"
        ).length;


    const ready =
        orders.filter(
            o =>
                o.status === "ready"
        ).length;


    const revenue =
        orders.reduce(
            (sum, order) =>
                sum +
                Number(
                    order.total_price || 0
                ),
            0
        );


    if ($("stat-total"))
        $("stat-total").textContent =
            total;


    if ($("stat-pending"))
        $("stat-pending").textContent =
            pending;


    if ($("stat-production"))
        $("stat-production").textContent =
            production;


    if ($("stat-ready"))
        $("stat-ready").textContent =
            ready;


    if ($("stat-revenue"))
        $("stat-revenue").textContent =
            money(revenue);
}


/* =========================================================
   23. MODIFICATION STATUT
   ========================================================= */

async function changeOrderStatus(
    orderId,
    status
) {

    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update({
                status: status
            })
            .eq(
                "id",
                orderId
            );


    if (error) {

        console.error(error);

        alert(
            "Impossible de modifier le statut :\n" +
            error.message
        );

        return;
    }


    await loadOrders();
}


/* =========================================================
   24. COMMANDES MANUELLES
   ========================================================= */

function renderManualProducts() {

    const container =
        $("manual-product-grid");


    if (!container) return;


    container.innerHTML = "";


    PRODUCTS.forEach(product => {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "choice-card";


        button.dataset.productId =
            product.id;


        button.innerHTML = `

            <div>

                <strong>
                    ${product.name}
                </strong>

                <span>
                    ${money(product.price)}
                </span>

            </div>

        `;


        button.onclick = () => {

            selectManualProduct(
                product.id
            );
        };


        container.appendChild(button);
    });
}


function selectManualProduct(productId) {

    const product =
        PRODUCTS.find(
            p =>
                String(p.id) ===
                String(productId)
        );


    if (!product) return;


    $("manual-product-id").value =
        product.id;


    document
        .querySelectorAll(
            "#manual-product-grid .choice-card"
        )
        .forEach(card => {

            card.classList.toggle(
                "selected",
                String(
                    card.dataset.productId
                ) === String(product.id)
            );
        });


    if (product.customizable) {

        show("manual-personalization-block");

    } else {

        hide("manual-personalization-block");
    }


    if (product.two_colors) {

        show("manual-colors-block");

        populateColors(
            "manual-color-1",
            "manual-color-2"
        );

    } else {

        hide("manual-colors-block");
    }


    updateManualPrice();
}


function updateManualPrice() {

    const product =
        PRODUCTS.find(
            p =>
                String(p.id) ===
                String(
                    $("manual-product-id")?.value
                )
        );


    if (!product) {

        $("manual-price").textContent =
            "";

        return;
    }


    const quantity =
        Math.max(
            1,
            parseInt(
                $("manual-quantity").value ||
                "1"
            )
        );


    let total =
        Number(product.price) *
        quantity;


    if (
        $("manual-specific-color")?.checked
    ) {

        total +=
            COLOR_SUPPLEMENT;
    }


    if (
        quantity >=
        DISCOUNT_MIN_QUANTITY
    ) {

        total *=
            1 - DISCOUNT_RATE;
    }


    $("manual-price").innerHTML = `

        <strong>
            Total : ${money(total)}
        </strong>

        <span>
            Passage : ${money(total / 2)}
        </span>

        <span>
            Livraison : ${money(total / 2)}
        </span>

    `;
}


function openManualOrder() {

    show("manual-modal");

    renderManualProducts();
}


function closeManualOrder() {

    hide("manual-modal");
}


/* =========================================================
   25. FORMULAIRE MANUEL
   ========================================================= */

async function submitManualOrder(event) {

    event.preventDefault();


    const product =
        PRODUCTS.find(
            p =>
                String(p.id) ===
                String(
                    $("manual-product-id").value
                )
        );


    if (!product) {

        alert(
            "Choisissez un modèle."
        );

        return;
    }


    const quantity =
        Math.max(
            1,
            parseInt(
                $("manual-quantity").value ||
                "1"
            )
        );


    let subtotal =
        Number(product.price) *
        quantity;


    let surcharge = 0;


    if (
        $("manual-specific-color")?.checked
    ) {

        surcharge =
            COLOR_SUPPLEMENT;
    }


    let discount = 0;


    if (
        quantity >=
        DISCOUNT_MIN_QUANTITY
    ) {

        discount =
            (subtotal + surcharge) *
            DISCOUNT_RATE;
    }


    const total =
        subtotal +
        surcharge -
        discount;


    const data = {

        customer_first_name:
            $("manual-first-name").value.trim(),

        customer_name:
            $("manual-last-name").value.trim(),

        address:
            $("manual-street").value.trim(),

        city:
            $("manual-city").value.trim(),

        address_complement:
            $("manual-complement").value.trim() ||
            null,

        email:
            $("manual-email").value.trim(),

        phone:
            $("manual-phone").value.trim() ||
            null,

        model:
            product.name,

        model_key:
            product.product_key,

        custom_first_name:
            $("manual-personalization-name")
                ?.value.trim() || null,

        custom_year:
            $("manual-personalization-year")
                ?.value || null,

        color_1:
            product.two_colors
                ? $("manual-color-1").value
                : null,

        color_2:
            product.two_colors
                ? $("manual-color-2").value
                : null,

        quantity,

        specific_color:
            $("manual-specific-color").checked,

        color_supplement:
            surcharge,

        base_price:
            subtotal,

        discount,

        total_price:
            total,

        deposit_price:
            total / 2,

        delivery_price:
            total / 2,

        status:
            "pending"
    };


    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .insert(data);


    if (error) {

        console.error(error);

        alert(
            "Erreur : " +
            error.message
        );

        return;
    }


    alert(
        "Commande créée avec succès !"
    );


    closeManualOrder();

    $("manual-form").reset();

    await loadOrders();
}


/* =========================================================
   26. INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🎄 L'Atelier de Noël 3D"
        );


        createSnow();


        /*
           Charger les produits
        */

        await loadProducts();


        /*
           Formulaire commande
        */

        const orderForm =
            $("order-form");


        if (orderForm) {

            orderForm.addEventListener(
                "submit",
                submitOrder
            );
        }


        /*
           Quantité
        */

        if ($("quantity")) {

            $("quantity")
                .addEventListener(
                    "input",
                    updatePrice
                );
        }


        /*
           Supplément couleur
        */

        if ($("specific-color")) {

            $("specific-color")
                .addEventListener(
                    "change",
                    updatePrice
                );
        }


        /*
           Couleurs
        */

        if ($("color-1")) {

            $("color-1")
                .addEventListener(
                    "change",
                    () => {

                        const color2 =
                            $("color-2");

                        if (
                            color2 &&
                            color2.value ===
                            $("color-1").value
                        ) {

                            color2.value = "";
                        }
                    }
                );
        }


        /*
           Formulaire manuel
        */

        const manualForm =
            $("manual-form");


        if (manualForm) {

            manualForm.addEventListener(
                "submit",
                submitManualOrder
            );
        }


        if ($("manual-quantity")) {

            $("manual-quantity")
                .addEventListener(
                    "input",
                    updateManualPrice
                );
        }


        if ($("manual-specific-color")) {

            $("manual-specific-color")
                .addEventListener(
                    "change",
                    updateManualPrice
                );
        }


        updatePrice();

        console.log(
            "✅ Site prêt"
        );
    }
);


/* =========================================================
   27. FONCTIONS ACCESSIBLES AU HTML
   ========================================================= */

window.showPage =
    showPage;

window.chooseProduct =
    chooseProduct;

window.selectOrderProduct =
    selectOrderProduct;

window.trackOrder =
    trackOrder;

window.adminLogin =
    adminLogin;

window.logoutAdmin =
    logoutAdmin;

window.loadOrders =
    loadOrders;

window.changeOrderStatus =
    changeOrderStatus;

window.openManualOrder =
    openManualOrder;

window.closeManualOrder =
    closeManualOrder;
