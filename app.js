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

const COLOR_SUPPLEMENT = 0; // option supprimée : aucun supplément couleur
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


function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function formatDeliveryDate(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return String(dateKey || "");
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(new Date(dateKey + "T12:00:00Z"));
}

function parisDateKey() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const out = {};
    for (const part of parts) out[part.type] = part.value;
    return `${out.year}-${out.month}-${out.day}`;
}

const DELIVERY_PERIOD_LABELS = {
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Début de soirée"
};

function money(value) {

    return Number(value || 0)
        .toFixed(2)
        .replace(".", ",") + " €";
}


/* =========================================================
   5. NAVIGATION
   ========================================================= */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = $(pageId);
    if (!page) {
        console.error("Page introuvable :", pageId);
        return;
    }

    page.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pageId === "admin") {
        checkAdminSession();
    }
}

// GitHub Pages sert 404.html pour l'URL /atelier-de-noel/admin.
// Ce fichier reprend la même page que index.html : on peut donc garder /admin dans l'adresse.
function handleAdminUrl() {
    const path = window.location.pathname.replace(/\/+$/, "");
    if (path.endsWith("/admin")) {
        showPage("admin-login");
    } else {
        showPage("home");
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

        const message = `
            <div class="message error">
                <strong>Impossible de charger le catalogue.</strong>
                <br><br>${error.message}
                <br>Vérifiez la connexion à Supabase puis actualisez la page.
            </div>`;
        if (catalog) catalog.innerHTML = message;
        const home = $("home-products");
        if (home) home.innerHTML = message;
        const order = $("order-product-grid");
        if (order) order.innerHTML = message;
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


    const deposit = 0;
    const delivery = 0;


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

customer_last_name:
    $("last-name").value.trim(),

street:
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
                $("specific-color")?.checked || false,


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


        const workflowResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/order-workflow`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY
                },
                body: JSON.stringify({ action: "create_order", order: data })
            }
        );
        const workflowResult = await workflowResponse.json().catch(() => ({}));
        if (!workflowResponse.ok || !workflowResult.order) {
            throw new Error(workflowResult.error || "Impossible d'enregistrer la commande.");
        }
        const order = workflowResult.order;


        /*
           Afficher le succès
        */

        $("success-number").textContent = order.order_number;
        const reviewLink = $("success-review-link");
        if (reviewLink) {
            if (workflowResult.review_url) {
                reviewLink.href = workflowResult.review_url;
                reviewLink.hidden = false;
            } else {
                reviewLink.hidden = true;
                reviewLink.removeAttribute("href");
            }
        }

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
            .rpc("track_order_status", {
                p_order_number: number
            });

    // La fonction SQL ne renvoie que le numéro et le statut,
    // jamais les coordonnées ou les informations personnelles.
    const trackedOrder = Array.isArray(data) ? data[0] : data;


    hide(loading);


    if (error) {

        console.error(error);

        errorBox.textContent =
            error.message;

        show(errorBox);

        return;
    }


    if (!trackedOrder) {

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
        statuses[trackedOrder.status] ||
        statuses.pending;


    $("tracking-icon").textContent =
        status.icon;


    $("tracking-order-number").textContent =
        trackedOrder.order_number;


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

    // Revenir à l'accueil public, hors de l'URL /admin.
    const basePath = "/atelier-de-noel/";
    window.location.href = basePath;
}


/* =========================================================
   21. COMMANDES ADMIN
   ========================================================= */

async function loadOrders() {
    const table = $("orders-table");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="10">Chargement...</td></tr>`;

    const { data: orders, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        table.innerHTML = `<tr><td colspan="10">${escapeHtml(error.message)}</td></tr>`;
        return;
    }

    const { data: deliveryRows, error: deliveryError } = await supabaseClient
        .from("order_delivery_availability")
        .select("*");
    if (deliveryError) {
        console.error("Impossible de charger les propositions de livraison", deliveryError);
    }
    const deliveryByOrder = new Map((deliveryRows || []).map(item => [item.order_id, item]));

    if (!orders.length) {
        table.innerHTML = `<tr><td colspan="10">Aucune commande.</td></tr>`;
        updateStats([]);
        await loadDeliveryCalendarExceptions();
        return;
    }

    table.innerHTML = "";
    orders.forEach(order => {
        const row = document.createElement("tr");
        const personalization = [order.custom_first_name, order.custom_year].filter(Boolean).join(" / ") || "—";
        const colors = [order.color_1, order.color_2].filter(Boolean).join(" / ") || "—";

        row.innerHTML = `
            <td><strong>${escapeHtml(order.order_number)}</strong></td>
            <td>${escapeHtml([order.customer_first_name, order.customer_name].filter(Boolean).join(" "))}<br><small>${escapeHtml(order.email)}</small></td>
            <td>${escapeHtml(order.address)}<br>${escapeHtml(order.city)}</td>
            <td>${escapeHtml(order.model)}</td>
            <td>${escapeHtml(personalization)}</td>
            <td>${escapeHtml(colors)}</td>
            <td><strong>${escapeHtml(money(order.total_price))}</strong></td>
        `;

        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");
        statusSelect.setAttribute("aria-label", `Statut de la commande ${order.order_number}`);
        const options = [
            ["pending", "🔴 En attente"],
            ["manufacturing", "🟡 Fabrication"],
            ["ready", "🟢 Prête"],
            ["delivered", "⚫ Livrée"]
        ];
        options.forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value; option.textContent = label; option.selected = order.status === value;
            statusSelect.appendChild(option);
        });
        statusSelect.addEventListener("change", () => changeOrderStatus(order.id, statusSelect.value));
        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        row.appendChild(renderDeliveryAdminCell(order, deliveryByOrder.get(order.id)));

        const qrCell = document.createElement("td");
        const qrButton = document.createElement("button");
        qrButton.type = "button";
        qrButton.className = "btn ghost";
        qrButton.textContent = "QR / avis";
        qrButton.title = "Créer ou imprimer le QR code privé de cette commande";
        qrButton.addEventListener("click", () => printOrderReviewQR(order.id));
        qrCell.appendChild(qrButton);
        row.appendChild(qrCell);
        table.appendChild(row);
    });

    updateStats(orders);
    await loadDeliveryCalendarExceptions();
}

function renderDeliveryAdminCell(order, delivery) {
    const cell = document.createElement("td");
    cell.className = "delivery-admin-cell";
    const periodLabel = period => DELIVERY_PERIOD_LABELS[period] || period;
    const proposals = Array.isArray(delivery?.proposals) ? delivery.proposals : [];

    if (delivery?.status === "proposed" && proposals.length) {
        const summary = document.createElement("div");
        summary.className = "delivery-proposals-summary";
        summary.innerHTML = `<strong>Propositions reçues</strong><ul>${proposals.map(p => `<li>${escapeHtml(formatDeliveryDate(p.date))} — ${escapeHtml(periodLabel(p.period))}</li>`).join("")}</ul>${delivery.comment ? `<p class="delivery-comment"><strong>Précision :</strong> ${escapeHtml(delivery.comment)}</p>` : ""}`;
        cell.appendChild(summary);
        const select = document.createElement("select");
        select.className = "delivery-confirm-choice";
        select.setAttribute("aria-label", "Choisir la date et la période à confirmer");
        select.innerHTML = `<option value="">Choisir le rendez-vous…</option>`;
        proposals.forEach(p => {
            const option = document.createElement("option");
            option.value = `${p.date}|${p.period}`;
            option.textContent = `${formatDeliveryDate(p.date)} — ${periodLabel(p.period)}`;
            select.appendChild(option);
        });
        cell.appendChild(select);
        const confirmButton = document.createElement("button");
        confirmButton.className = "btn primary delivery-button";
        confirmButton.type = "button";
        confirmButton.textContent = "Confirmer la livraison";
        confirmButton.addEventListener("click", () => {
            const parts = select.value.split("|");
            if (parts.length !== 2 || !parts[0] || !parts[1]) {
                alert("Choisis d’abord une date et une période proposées par le client."); return;
            }
            confirmDelivery(order.id, parts[0], parts[1]);
        });
        cell.appendChild(confirmButton);
    } else if (delivery?.status === "confirmed") {
        cell.innerHTML = `<strong class="delivery-confirmed-label">✓ Livraison confirmée</strong><p>${escapeHtml(formatDeliveryDate(delivery.confirmed_date))}<br>${escapeHtml(periodLabel(delivery.confirmed_period))}</p>`;
        const resend = document.createElement("button");
        resend.type = "button"; resend.className = "btn ghost delivery-button"; resend.textContent = "Renvoyer la confirmation";
        resend.addEventListener("click", () => confirmDelivery(order.id, delivery.confirmed_date, delivery.confirmed_period));
        cell.appendChild(resend);
    } else if (order.status === "ready") {
        const label = delivery?.status === "waiting" ? "En attente de réponse du client" : "Pas encore de disponibilités";
        const info = document.createElement("p"); info.textContent = label; cell.appendChild(info);
        const send = document.createElement("button");
        send.type = "button"; send.className = "btn ghost delivery-button"; send.textContent = delivery ? "Renvoyer le lien" : "Envoyer le lien";
        send.addEventListener("click", () => sendDeliveryAvailability(order.id, true));
        cell.appendChild(send);
    } else {
        const info = document.createElement("span");
        info.className = "muted";
        info.textContent = delivery?.status === "waiting" ? "Lien déjà envoyé" : "Sera disponible quand la commande sera prête";
        cell.appendChild(info);
    }
    return cell;
}

async function sendDeliveryAvailability(orderId, force = false, silent = false) {
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error("Reconnecte-toi à l'administration pour envoyer le lien.");
        const response = await fetch(`${SUPABASE_URL}/functions/v1/order-workflow`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify({ action: "send_delivery_availability_email", order_id: orderId, force })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.error || "L’e-mail de disponibilités n’a pas pu être envoyé.");
        if (!silent) alert(result.already_sent ? "Le lien avait déjà été envoyé au client." : "E-mail des disponibilités envoyé au client !");
    } catch (error) {
        console.error("Delivery availability email error", error);
        if (!silent) alert(error.message || "Erreur pendant l’envoi du lien de livraison.");
    } finally {
        await loadOrders();
    }
}

async function confirmDelivery(orderId, date, period) {
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error("Reconnecte-toi à l'administration pour confirmer la livraison.");
        const response = await fetch(`${SUPABASE_URL}/functions/v1/order-workflow`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify({ action: "admin_confirm_delivery", order_id: orderId, date, period })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) throw new Error(result.error || "Impossible de confirmer ce rendez-vous.");
        alert(result.email_sent ? "Livraison confirmée : le client a reçu l’e-mail." : "Rendez-vous enregistré, mais l’e-mail de confirmation n’a pas pu être envoyé. Vérifie le relais e-mail.");
    } catch (error) {
        console.error("Delivery confirmation error", error);
        alert(error.message || "Erreur lors de la confirmation de livraison.");
    }
    await loadOrders();
}

async function loadDeliveryCalendarExceptions() {
    const list = $("delivery-exceptions-list");
    if (!list) return;
    list.innerHTML = `<p class="muted">Chargement des exceptions…</p>`;
    const { data, error } = await supabaseClient.from("delivery_calendar_exceptions")
        .select("delivery_date,is_available,note").gte("delivery_date", parisDateKey()).order("delivery_date", { ascending: true });
    if (error) {
        console.error("Delivery exceptions loading failed", error);
        list.innerHTML = `<p class="message error">Impossible de charger les exceptions : ${escapeHtml(error.message)}</p>`;
        return;
    }
    list.innerHTML = "";
    if (!data?.length) {
        list.innerHTML = `<p class="muted">Aucune exception à venir. Les samedis et dimanches sont proposés par défaut.</p>`;
        return;
    }
    data.forEach(exception => {
        const item = document.createElement("div"); item.className = "delivery-exception-row";
        const info = document.createElement("div");
        const strong = document.createElement("strong"); strong.textContent = formatDeliveryDate(exception.delivery_date);
        const text = document.createElement("p"); text.textContent = (exception.is_available ? "Date exceptionnellement ouverte" : "Date bloquée") + (exception.note ? " — " + exception.note : "");
        info.append(strong, text);
        const remove = document.createElement("button"); remove.type = "button"; remove.className = "btn ghost"; remove.textContent = "Supprimer";
        remove.addEventListener("click", () => deleteDeliveryException(exception.delivery_date));
        item.append(info, remove); list.appendChild(item);
    });
}

async function saveDeliveryException(event) {
    event.preventDefault();
    const date = $("delivery-exception-date").value;
    const mode = $("delivery-exception-mode").value;
    const note = $("delivery-exception-note").value.trim();
    if (!date) { alert("Choisis une date."); return; }
    if (note.length > 180) { alert("La précision doit faire 180 caractères maximum."); return; }
    const { error } = await supabaseClient.from("delivery_calendar_exceptions").upsert({
        delivery_date: date, is_available: mode === "open", note: note || null, updated_at: new Date().toISOString()
    }, { onConflict: "delivery_date" });
    if (error) { console.error(error); alert("Impossible d'enregistrer l'exception : " + error.message); return; }
    $("delivery-exception-note").value = "";
    alert("Exception de livraison enregistrée.");
    await loadDeliveryCalendarExceptions();
}

async function deleteDeliveryException(date) {
    if (!confirm("Supprimer cette exception ? La règle normale (samedi/dimanche) sera rétablie.")) return;
    const { error } = await supabaseClient.from("delivery_calendar_exceptions").delete().eq("delivery_date", date);
    if (error) { alert("Impossible de supprimer cette exception : " + error.message); return; }
    await loadDeliveryCalendarExceptions();
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

async function changeOrderStatus(orderId, status) {
    const { error } = await supabaseClient.from("orders").update({ status }).eq("id", orderId);
    if (error) {
        console.error(error);
        alert("Impossible de modifier le statut :\n" + error.message);
        return;
    }

    if (status === "ready") {
        // Au passage à « Prête », demande les disponibilités du client.
        await sendDeliveryAvailability(orderId, false, false);
    } else if (status === "delivered") {
        // Le sondage est envoyé uniquement après livraison.
        try {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            if (!accessToken) {
                alert("Statut modifié, mais reconnecte-toi à l'administration pour envoyer le sondage.");
            } else {
                const response = await fetch(`${SUPABASE_URL}/functions/v1/order-workflow`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${accessToken}` },
                    body: JSON.stringify({ action: "send_delivery_review_email", order_id: orderId })
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) {
                    alert("Statut passé à « livrée », mais l'e-mail du sondage n'a pas été envoyé.\n" + (result.error || "Vérifie les secrets e-mail dans Supabase."));
                } else if (!result.already_sent) {
                    alert("Commande marquée comme livrée. E-mail du sondage envoyé au client !");
                }
            }
        } catch (emailError) {
            console.error("Delivery survey email error", emailError);
            alert("Statut modifié, mais l'envoi du sondage a échoué. Vérifie la configuration e-mail.");
        }
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

        customer_last_name:
            $("manual-last-name").value.trim(),

        customer_name:
            $("manual-last-name").value.trim(),

        street:
            $("manual-street").value.trim(),

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
            $("manual-specific-color")?.checked || false,

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
   QR PRIVÉ — IMPRESSION DE BON DE REMERCIEMENT
   ========================================================= */

async function printOrderReviewQR(orderId) {
    const printWindow = window.open("", "_blank", "width=760,height=900");
    if (!printWindow) {
        alert("La fenêtre d'impression a été bloquée. Autorise les fenêtres surgissantes pour ce site puis réessaie.");
        return;
    }
    printWindow.document.open();
    printWindow.document.write("<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>Bon de remerciement</title><style>body{font-family:system-ui,-apple-system,sans-serif;color:#183b2c;margin:0;padding:32px;text-align:center}.sheet{max-width:620px;margin:0 auto;border:2px solid #d5a947;border-radius:22px;padding:36px}h1{font-size:28px;margin:10px 0}p{line-height:1.6;color:#43564b}canvas{display:block;margin:24px auto;max-width:100%}.number{font-weight:800;font-size:18px}.print{background:#173e30;color:#fff;border:0;border-radius:10px;padding:12px 20px;font:inherit;cursor:pointer}@media print{body{padding:0}.sheet{border:2px solid #d5a947;box-shadow:none}.print{display:none}}</style></head><body><main class='sheet'><div style='font-weight:800;letter-spacing:.06em'>🎄 L'ATELIER DE NOËL 3D</div><h1>Merci pour votre commande !</h1><p class='number' id='number'>Préparation du bon…</p><canvas id='qr' width='280' height='280'></canvas><p>Scannez ce QR code pour donner votre avis <strong>après la livraison</strong>.</p><p>Votre avis nous aide à améliorer nos créations et notre service.</p><p>Saint-Witz &amp; alentours</p><button class='print' onclick='window.print()'>Imprimer le bon</button><p id='error' style='color:#a83232'></p></main></body></html>");
    printWindow.document.close();

    try {
        await new Promise((resolve, reject) => {
            const qrScript = printWindow.document.createElement("script");
            qrScript.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";
            qrScript.onload = resolve;
            qrScript.onerror = () => reject(new Error("La bibliothèque QR n'a pas pu se charger. Vérifie la connexion Internet."));
            printWindow.document.head.appendChild(qrScript);
        });
    } catch (scriptError) {
        printWindow.document.getElementById("error").textContent = scriptError.message || "Chargement du QR impossible.";
        return;
    }

    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) throw new Error("Reconnecte-toi à l'administration pour imprimer ce QR code.");
        const response = await fetch(`${SUPABASE_URL}/functions/v1/order-workflow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ action: "admin_create_review_link", order_id: orderId })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.review_url) throw new Error(result.error || "Impossible de générer le QR code.");
        const number = String(result.order_number || "");
        printWindow.document.getElementById("number").textContent = `Commande ${number}`;
        const qrCanvas = printWindow.document.getElementById("qr");
        if (!printWindow.QRCode) throw new Error("La bibliothèque QR n'a pas pu se charger. Vérifie la connexion Internet et réessaie.");
        await new Promise((resolve, reject) => {
            printWindow.QRCode.toCanvas(qrCanvas, result.review_url, { width: 280, margin: 2, errorCorrectionLevel: "H" }, error => error ? reject(error) : resolve());
        });
    } catch (error) {
        console.error(error);
        const errorBox = printWindow.document.getElementById("error");
        if (errorBox) errorBox.textContent = error.message || "Une erreur est survenue.";
        else alert(error.message || "Impossible de préparer le bon d'impression.");
    }
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

        // Affiche la connexion si l'adresse se termine par /admin.
        handleAdminUrl();

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


        const exceptionForm = $("delivery-exception-form");
        if (exceptionForm) exceptionForm.addEventListener("submit", saveDeliveryException);
        const exceptionDate = $("delivery-exception-date");
        if (exceptionDate) exceptionDate.min = parisDateKey();

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

window.handleAdminUrl =
    handleAdminUrl;

window.chooseProduct =
    chooseProduct;

window.printOrderReviewQR = printOrderReviewQR;

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

window.sendDeliveryAvailability = sendDeliveryAvailability;
window.confirmDelivery = confirmDelivery;

window.openManualOrder =
    openManualOrder;

window.closeManualOrder =
    closeManualOrder;
