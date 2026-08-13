/* =========================================================
   L'ATELIER DE NOËL 3D
   app.js
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIGURATION SUPABASE
   --------------------------------------------------------- */

// Ton URL Supabase
const SUPABASE_URL = "https://sdqtgluhgywedjwgolei.supabase.co";

// ⚠️ COLLE ICI TA CLÉ "Publishable key"
// Elle commence par : sb_publishable_
const SUPABASE_PUBLISHABLE_KEY = "COLLE_TA_CLE_ICI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ---------------------------------------------------------
   2. PRODUITS
   --------------------------------------------------------- */

const PRODUCTS = {
    simple_1: {
        name: "Modèle simple — 1 couleur",
        price: 3,
        customizable: false,
        twoColors: false
    },

    simple_2: {
        name: "Modèle simple — 2 couleurs",
        price: 4,
        customizable: false,
        twoColors: true
    },

    prenom_1: {
        name: "Personnalisable — prénom — 1 couleur",
        price: 5,
        customizable: true,
        year: false,
        twoColors: false
    },

    prenom_2: {
        name: "Personnalisable — prénom — 2 couleurs",
        price: 6,
        customizable: true,
        year: false,
        twoColors: true
    },

    prenom_annee_1: {
        name: "Personnalisable — prénom + année — 1 couleur",
        price: 6,
        customizable: true,
        year: true,
        twoColors: false
    },

    prenom_annee_2: {
        name: "Personnalisable — prénom + année — 2 couleurs",
        price: 7,
        customizable: true,
        year: true,
        twoColors: true
    },

    premier_noel_1: {
        name: "Mon premier Noël — 1 couleur",
        price: 7,
        customizable: true,
        year: true,
        twoColors: false
    },

    premier_noel_2: {
        name: "Mon premier Noël — 2 couleurs",
        price: 8,
        customizable: true,
        year: true,
        twoColors: true
    }
};

const COLOR_OPTIONS = [
    "Bleu",
    "Blanc",
    "Noir",
    "Rouge",
    "Jaune",
    "Vert",
    "Argent"
];

const COLOR_SUPPLEMENT = 7;
const BULK_DISCOUNT_MIN = 5;
const BULK_DISCOUNT = 0.15;


/* ---------------------------------------------------------
   3. OUTILS
   --------------------------------------------------------- */

function $(id) {
    return document.getElementById(id);
}

function show(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}

function hide(element) {
    if (element) {
        element.classList.add("hidden");
    }
}

function euro(value) {
    return Number(value || 0).toFixed(2).replace(".", ",") + " €";
}


/* ---------------------------------------------------------
   4. FLOCONS
   --------------------------------------------------------- */

function createSnowflakes() {

    const container = document.createElement("div");

    container.id = "snow-container";

    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.overflow = "hidden";
    container.style.zIndex = "0";

    document.body.appendChild(container);

    for (let i = 0; i < 35; i++) {

        const snow = document.createElement("div");

        snow.textContent = "❄";

        snow.style.position = "absolute";
        snow.style.top = "-30px";
        snow.style.left = Math.random() * 100 + "%";
        snow.style.opacity = Math.random() * 0.5 + 0.2;
        snow.style.fontSize =
            Math.random() * 10 + 8 + "px";

        const duration =
            Math.random() * 8 + 8;

        snow.style.animation =
            `snowfall ${duration}s linear infinite`;

        snow.style.animationDelay =
            Math.random() * 8 + "s";

        container.appendChild(snow);
    }
}


/* ---------------------------------------------------------
   5. NAVIGATION
   --------------------------------------------------------- */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page = $(pageId);

    if (page) {
        page.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ---------------------------------------------------------
   6. CHOIX DU PRODUIT
   --------------------------------------------------------- */

function updateProductOptions() {

    const select = $("model");

    if (!select) return;

    const product = PRODUCTS[select.value];

    if (!product) return;

    const personalization =
        $("personalization-options");

    const colors =
        $("color-options");

    const color1 =
        $("color-1");

    const color2 =
        $("color-2");

    /* Personnalisation */

    if (product.customizable) {

        show(personalization);

        const firstName =
            $("custom-first-name");

        if (firstName) {
            firstName.required = true;
        }

        const year =
            $("custom-year");

        if (product.year) {

            show($("year-field"));

            if (year) {
                year.required = true;
            }

        } else {

            hide($("year-field"));

            if (year) {
                year.required = false;
            }
        }

    } else {

        hide(personalization);

        if ($("custom-first-name")) {
            $("custom-first-name").required = false;
        }

        if ($("custom-year")) {
            $("custom-year").required = false;
        }
    }


    /* Deux couleurs */

    if (product.twoColors) {

        show(colors);

        if (color1) color1.required = true;
        if (color2) color2.required = true;

    } else {

        hide(colors);

        if (color1) color1.required = false;
        if (color2) color2.required = false;
    }

    updateTotal();
}


/* ---------------------------------------------------------
   7. CALCUL DU PRIX
   --------------------------------------------------------- */

function calculatePrice() {

    const select = $("model");

    if (!select) {
        return {
            base: 0,
            supplement: 0,
            discount: 0,
            total: 0,
            deposit: 0,
            delivery: 0
        };
    }

    const product = PRODUCTS[select.value];

    if (!product) {
        return {
            base: 0,
            supplement: 0,
            discount: 0,
            total: 0,
            deposit: 0,
            delivery: 0
        };
    }

    const quantityInput =
        $("quantity");

    const quantity =
        Math.max(
            1,
            parseInt(quantityInput?.value || "1")
        );

    let base =
        product.price * quantity;

    let supplement = 0;

    const specificColor =
        $("specific-color");

    if (
        specificColor &&
        specificColor.checked
    ) {
        supplement = COLOR_SUPPLEMENT;
    }

    let subtotal =
        base + supplement;

    let discount = 0;

    if (quantity >= BULK_DISCOUNT_MIN) {
        discount =
            subtotal * BULK_DISCOUNT;
    }

    const total =
        Math.max(
            0,
            subtotal - discount
        );

    const deposit =
        total / 2;

    const delivery =
        total / 2;

    return {
        quantity,
        base,
        supplement,
        discount,
        total,
        deposit,
        delivery
    };
}


/* ---------------------------------------------------------
   8. AFFICHAGE DU PRIX
   --------------------------------------------------------- */

function updateTotal() {

    const price =
        calculatePrice();

    if ($("price-base")) {
        $("price-base").textContent =
            euro(price.base);
    }

    if ($("price-supplement")) {
        $("price-supplement").textContent =
            euro(price.supplement);
    }

    if ($("price-discount")) {
        $("price-discount").textContent =
            "- " + euro(price.discount);
    }

    if ($("price-total")) {
        $("price-total").textContent =
            euro(price.total);
    }

    if ($("price-deposit")) {
        $("price-deposit").textContent =
            euro(price.deposit);
    }

    if ($("price-delivery")) {
        $("price-delivery").textContent =
            euro(price.delivery);
    }
}


/* ---------------------------------------------------------
   9. COULEURS
   --------------------------------------------------------- */

function preventSameColors() {

    const c1 = $("color-1");
    const c2 = $("color-2");

    if (!c1 || !c2) return;

    Array.from(c2.options).forEach(option => {

        option.disabled =
            option.value !== "" &&
            option.value === c1.value;

    });

    if (c2.value === c1.value) {
        c2.value = "";
    }
}


/* ---------------------------------------------------------
   10. COMMANDE CLIENT
   --------------------------------------------------------- */

async function submitOrder(event) {

    event.preventDefault();

    const form =
        $("order-form");

    if (!form) return;

    const button =
        form.querySelector("button[type='submit']");

    if (button) {
        button.disabled = true;
        button.textContent = "Enregistrement...";
    }

    try {

        const productKey =
            $("model")?.value;

        const product =
            PRODUCTS[productKey];

        if (!product) {
            throw new Error(
                "Veuillez sélectionner un modèle."
            );
        }

        const price =
            calculatePrice();

        const specificColor =
            $("specific-color")?.checked || false;

        const data = {

            customer_name:
                $("customer-name")?.value.trim(),

            customer_first_name:
                $("customer-first-name")?.value.trim(),

            address:
                $("address")?.value.trim(),

            city:
                $("city")?.value.trim(),

            address_complement:
                $("address-complement")?.value.trim(),

            email:
                $("email")?.value.trim(),

            phone:
                $("phone")?.value.trim(),

            model:
                product.name,

            model_key:
                productKey,

            custom_first_name:
                $("custom-first-name")?.value.trim() || null,

            custom_year:
                $("custom-year")?.value || null,

            color_1:
                $("color-1")?.value || null,

            color_2:
                $("color-2")?.value || null,

            quantity:
                price.quantity,

            specific_color:
                specificColor,

            color_supplement:
                price.supplement,

            base_price:
                price.base,

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


        const { data: result, error } =
            await supabaseClient
                .from("orders")
                .insert(data)
                .select()
                .single();


        if (error) {
            console.error(error);
            throw error;
        }


        showOrderSuccess(result);


        form.reset();

        hide($("personalization-options"));
        hide($("color-options"));

        updateTotal();

    } catch (error) {

        console.error(
            "Erreur commande :",
            error
        );

        alert(
            "Impossible d'enregistrer la commande.\n\n" +
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent =
                "Valider la commande";
        }
    }
}


/* ---------------------------------------------------------
   11. SUCCÈS
   --------------------------------------------------------- */

function showOrderSuccess(order) {

    const success =
        $("order-success");

    if (!success) {
        alert(
            "Commande reçue ! Numéro : " +
            order.order_number
        );

        return;
    }

    const number =
        $("success-order-number");

    const total =
        $("success-total");

    const deposit =
        $("success-deposit");

    const delivery =
        $("success-delivery");

    if (number) {
        number.textContent =
            order.order_number;
    }

    if (total) {
        total.textContent =
            euro(order.total_price);
    }

    if (deposit) {
        deposit.textContent =
            euro(order.deposit_price);
    }

    if (delivery) {
        delivery.textContent =
            euro(order.delivery_price);
    }

    show(success);

    success.scrollIntoView({
        behavior: "smooth"
    });
}


/* ---------------------------------------------------------
   12. SUIVI DE COMMANDE
   --------------------------------------------------------- */

async function trackOrder() {

    const input =
        $("tracking-number");

    const result =
        $("tracking-result");

    if (!input || !result) return;

    let number =
        input.value.trim().toUpperCase();

    if (!number) {
        alert(
            "Entrez votre numéro de commande."
        );

        return;
    }

    if (!number.startsWith("#")) {
        number = "#" + number;
    }

    result.innerHTML =
        "Recherche en cours...";

    const { data, error } =
        await supabaseClient
            .from("orders")
            .select(
                "order_number,status,model,total_price"
            )
            .eq(
                "order_number",
                number
            )
            .maybeSingle();

    if (error) {

        console.error(error);

        result.innerHTML =
            "<p>Une erreur est survenue.</p>";

        return;
    }

    if (!data) {

        result.innerHTML =
            "<p>❌ Commande introuvable.</p>";

        return;
    }

    const statuses = {

        pending: {
            icon: "🔴",
            title: "En attente de passage",
            text:
                "Nous allons passer chez vous valider le modèle et récupérer les espèces.",
            className: "status-red"
        },

        manufacturing: {
            icon: "🟡",
            title: "En cours de fabrication",
            text:
                "L'impression 3D est lancée !",
            className: "status-yellow"
        },

        ready: {
            icon: "🟢",
            title: "Prête pour la livraison !",
            text:
                "Nous repassons chez vous vous apporter votre boule.",
            className: "status-green"
        },

        delivered: {
            icon: "⚫",
            title: "Livrée",
            text:
                "Commande terminée.",
            className: "status-black"
        }
    };

    const status =
        statuses[data.status] ||
        statuses.pending;

    result.innerHTML = `

        <div class="tracking-status ${status.className}">

            <div class="tracking-icon">
                ${status.icon}
            </div>

            <h3>
                ${status.title}
            </h3>

            <p>
                ${status.text}
            </p>

            <strong>
                ${data.order_number}
            </strong>

        </div>
    `;
}


/* ---------------------------------------------------------
   13. ADMINISTRATION
   --------------------------------------------------------- */

async function adminLogin() {

    const email =
        $("admin-email")?.value.trim();

    const password =
        $("admin-password")?.value;

    const errorBox =
        $("admin-login-error");

    hide(errorBox);

    if (!email || !password) {

        if (errorBox) {
            errorBox.textContent =
                "Veuillez remplir tous les champs.";
            show(errorBox);
        }

        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        console.error(error);

        if (errorBox) {

            errorBox.textContent =
                "E-mail ou mot de passe incorrect.";

            show(errorBox);
        }

        return;
    }

    console.log(
        "Connexion admin réussie",
        data.user
    );

    showPage("admin-dashboard");

    await loadAdminOrders();
}


/* ---------------------------------------------------------
   14. DÉCONNEXION ADMIN
   --------------------------------------------------------- */

async function adminLogout() {

    await supabaseClient.auth.signOut();

    showPage("home");
}


/* ---------------------------------------------------------
   15. CHARGEMENT DES COMMANDES ADMIN
   --------------------------------------------------------- */

async function loadAdminOrders() {

    const table =
        $("admin-orders-body");

    if (!table) return;

    table.innerHTML =
        `<tr>
            <td colspan="10">
                Chargement...
            </td>
        </tr>`;

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

        table.innerHTML =
            `<tr>
                <td colspan="10">
                    Erreur : ${error.message}
                </td>
            </tr>`;

        return;
    }

    if (!data || data.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="10">
                    Aucune commande.
                </td>
            </tr>`;

        return;
    }

    table.innerHTML = "";

    data.forEach(order => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <strong>
                    ${order.order_number}
                </strong>
            </td>

            <td>
                ${order.customer_first_name || ""}
                ${order.customer_name || ""}
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
                ${order.custom_first_name || "-"}
            </td>

            <td>
                ${order.custom_year || "-"}
            </td>

            <td>
                ${order.quantity || 1}
            </td>

            <td>
                ${euro(order.total_price)}
            </td>

            <td>

                <select
                    onchange="changeOrderStatus('${order.id}', this.value)"
                >

                    <option value="pending"
                        ${order.status === "pending" ? "selected" : ""}>
                        🔴 En attente
                    </option>

                    <option value="manufacturing"
                        ${order.status === "manufacturing" ? "selected" : ""}>
                        🟡 Fabrication
                    </option>

                    <option value="ready"
                        ${order.status === "ready" ? "selected" : ""}>
                        🟢 Prête
                    </option>

                    <option value="delivered"
                        ${order.status === "delivered" ? "selected" : ""}>
                        ⚫ Livrée
                    </option>

                </select>

            </td>

        `;

        table.appendChild(row);
    });
}


/* ---------------------------------------------------------
   16. CHANGEMENT DE STATUT
   --------------------------------------------------------- */

async function changeOrderStatus(
    orderId,
    newStatus
) {

    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update({
                status: newStatus
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

    console.log(
        "Statut modifié"
    );
}


/* ---------------------------------------------------------
   17. INITIALISATION
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🎄 L'Atelier de Noël 3D chargé"
        );


        createSnowflakes();


        /* Modèle */

        const model =
            $("model");

        if (model) {

            model.addEventListener(
                "change",
                updateProductOptions
            );
        }


        /* Quantité */

        const quantity =
            $("quantity");

        if (quantity) {

            quantity.addEventListener(
                "input",
                updateTotal
            );
        }


        /* Supplément couleur */

        const specificColor =
            $("specific-color");

        if (specificColor) {

            specificColor.addEventListener(
                "change",
                updateTotal
            );
        }


        /* Couleurs */

        const color1 =
            $("color-1");

        if (color1) {

            color1.addEventListener(
                "change",
                preventSameColors
            );
        }


        /* Formulaire */

        const orderForm =
            $("order-form");

        if (orderForm) {

            orderForm.addEventListener(
                "submit",
                submitOrder
            );
        }


        /* Vérifier session admin */

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth.getSession();

        if (session) {

            console.log(
                "Session administrateur active"
            );
        }


        updateTotal();

    }
);


/* ---------------------------------------------------------
   18. FONCTIONS DISPONIBLES DANS LE HTML
   --------------------------------------------------------- */

window.showPage = showPage;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.trackOrder = trackOrder;
window.changeOrderStatus = changeOrderStatus;
window.loadAdminOrders = loadAdminOrders;
window.updateProductOptions = updateProductOptions;
window.updateTotal = updateTotal;
