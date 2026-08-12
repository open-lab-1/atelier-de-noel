/* ============================================================
   L'ATELIER DE NOËL 3D
   APP.JS
============================================================ */


/* ============================================================
   1. CONFIGURATION SUPABASE
============================================================ */

/*
    URL de ton projet Supabase
*/

const SUPABASE_URL =
    "https://sdqtgluhgywedjwgolei.supabase.co";


/*
    COLLE ICI TA PUBLISHABLE KEY

    Elle commence par :

    sb_publishable_...

    NE METS JAMAIS :
    - sb_secret_...
    - service_role
*/

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zY7V5CoRa2mYRYhZdm8v7Q_lc5U1Lm_";


/*
    Connexion à Supabase
*/

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ============================================================
   2. NAVIGATION DU SITE
============================================================ */

function showPage(pageId) {

    const page =
        document.getElementById(pageId);


    if (!page) {

        console.error(
            "Page introuvable :",
            pageId
        );

        return;
    }


    /*
        L'administration possède sa propre
        vérification de connexion.
    */

    if (pageId === "admin") {

        checkAdminAndOpen();

        return;

    }


    /*
        Navigation normale du site.

        IMPORTANT :
        Cette partie permet aux catégories
        et aux boutons du catalogue de fonctionner.
    */

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    page.classList.add("active");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   3. OUVRIR L'ADMINISTRATION
============================================================ */

async function checkAdminAndOpen() {

    try {

        const {
            data,
            error
        } = await db.auth.getUser();


        /*
            Pas connecté
        */

        if (
            error ||
            !data ||
            !data.user
        ) {

            showPage("admin-login");

            return false;

        }


        /*
            Utilisateur connecté.

            On cache TOUTES les pages avant
            d'afficher l'administration.
        */

        document
            .querySelectorAll(".page")
            .forEach(page => {

                page.classList.remove("active");

            });


        const adminPage =
            document.getElementById("admin");


        if (!adminPage) {

            console.error(
                "La section #admin est introuvable."
            );

            return false;

        }


        /*
            Afficher le dashboard
        */

        adminPage.classList.add("active");


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
            Charger les commandes
        */

        await loadOrders();


        return true;

    }


    catch(error) {

        console.error(
            "Erreur ouverture administration :",
            error
        );


        showPage("admin-login");

        return false;

    }

}


/* ============================================================
   4. CHOIX D'UN MODÈLE
============================================================ */

function selectModel(model) {

    showPage("order");


    const modelInput =
        document.getElementById(
            "model"
        );


    if (modelInput) {

        modelInput.value =
            model;

    }


    const personalization =
        document.getElementById(
            "personalization"
        );


    if (personalization) {

        personalization.focus();

    }

}


/* ============================================================
   5. NUMÉRO DE COMMANDE
============================================================ */

function formatOrderNumber(number) {

    return "#SW-" +
        String(number).padStart(3, "0");

}


/* ============================================================
   6. CRÉER UNE COMMANDE
============================================================ */

async function createOrder(data) {

    const {
        data: result,
        error
    } = await db.rpc(
        "create_order",
        {

            p_first_name:
                data.firstName,

            p_last_name:
                data.lastName,

            p_street:
                data.street,

            p_city:
                data.city,

            p_complement:
                data.complement,

            p_email:
                data.email,

            p_phone:
                data.phone,

            p_model:
                data.model,

            p_personalization:
                data.personalization,

            p_specific_color:
                data.specificColor

        }
    );


    if (error) {

        console.error(
            "Erreur Supabase :",
            error
        );

        throw error;

    }


    return result;

}


/* ============================================================
   7. FORMULAIRE CLIENT
============================================================ */

const orderForm =
    document.getElementById(
        "order-form"
    );


if (orderForm) {

    orderForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const errorBox =
                document.getElementById(
                    "order-error"
                );


            if (errorBox) {

                errorBox.classList.add(
                    "hidden"
                );

            }


            const button =
                orderForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Création de la commande...";

            }


            try {

                const result =
                    await createOrder({

                        firstName:
                            document
                                .getElementById(
                                    "first-name"
                                )
                                .value,

                        lastName:
                            document
                                .getElementById(
                                    "last-name"
                                )
                                .value,

                        street:
                            document
                                .getElementById(
                                    "street"
                                )
                                .value,

                        city:
                            document
                                .getElementById(
                                    "city"
                                )
                                .value,

                        complement:
                            document
                                .getElementById(
                                    "complement"
                                )
                                .value,

                        email:
                            document
                                .getElementById(
                                    "email"
                                )
                                .value,

                        phone:
                            document
                                .getElementById(
                                    "phone"
                                )
                                .value,

                        model:
                            document
                                .getElementById(
                                    "model"
                                )
                                .value,

                        personalization:
                            document
                                .getElementById(
                                    "personalization"
                                )
                                .value,

                        specificColor:
                            document
                                .getElementById(
                                    "specific-color"
                                )
                                .checked

                    });


                /*
                    Numéro créé par Supabase
                */

                const orderNumber =
                    formatOrderNumber(
                        result.order_number
                    );


                const successNumber =
                    document.getElementById(
                        "success-number"
                    );


                if (successNumber) {

                    successNumber.textContent =
                        orderNumber;

                }


                orderForm.classList.add(
                    "hidden"
                );


                const success =
                    document.getElementById(
                        "order-success"
                    );


                if (success) {

                    success.classList.remove(
                        "hidden"
                    );

                }


                orderForm.reset();

            }


            catch(error) {

                console.error(
                    "Erreur commande :",
                    error
                );


                if (errorBox) {

                    errorBox.textContent =
                        "Impossible d'enregistrer la commande. Vérifiez votre connexion ou la configuration Supabase.";

                    errorBox.classList.remove(
                        "hidden"
                    );

                }

            }


            finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "🎄 Valider la commande";

                }

            }

        }
    );

}


/* ============================================================
   8. SUIVI DE COMMANDE
============================================================ */

async function trackOrder() {

    const input =
        document.getElementById(
            "tracking-number"
        );


    const resultBox =
        document.getElementById(
            "tracking-result"
        );


    const errorBox =
        document.getElementById(
            "tracking-error"
        );


    const loading =
        document.getElementById(
            "tracking-loading"
        );


    if (!input)
        return;


    const raw =
        input.value
            .trim()
            .toUpperCase();


    if (resultBox)
        resultBox.classList.add("hidden");


    if (errorBox)
        errorBox.classList.add("hidden");


    if (loading)
        loading.classList.remove("hidden");


    /*
        Accepte :

        #SW-042
        SW-042
        042
    */

    const match =
        raw.match(/(\d+)/);


    if (!match) {

        if (loading)
            loading.classList.add("hidden");


        if (errorBox) {

            errorBox.textContent =
                "Numéro de commande invalide.";

            errorBox.classList.remove(
                "hidden"
            );

        }

        return;

    }


    const orderNumber =
        parseInt(
            match[1],
            10
        );


    try {

        const {
            data,
            error
        } = await db.rpc(
            "get_order_status",
            {

                p_order_number:
                    orderNumber

            }
        );


        if (error)
            throw error;


        if (!data)
            throw new Error(
                "Commande introuvable"
            );


        displayTracking(data);

    }


    catch(error) {

        console.error(
            "Erreur suivi :",
            error
        );


        if (errorBox) {

            errorBox.textContent =
                "Commande introuvable. Vérifiez votre numéro de commande.";

            errorBox.classList.remove(
                "hidden"
            );

        }

    }


    finally {

        if (loading)
            loading.classList.add("hidden");

    }

}


/* ============================================================
   9. AFFICHER LE STATUT
============================================================ */

function displayTracking(order) {

    const result =
        document.getElementById(
            "tracking-result"
        );


    const icon =
        document.getElementById(
            "tracking-icon"
        );


    const title =
        document.getElementById(
            "tracking-title"
        );


    const description =
        document.getElementById(
            "tracking-description"
        );


    const number =
        document.getElementById(
            "tracking-order-number"
        );


    const statuses = {

        pending: {

            icon: "🔴",

            title:
                "En attente de validation / Passage",

            description:
                "Nous allons passer chez vous pour valider le modèle et récupérer les espèces."

        },


        production: {

            icon: "🟡",

            title:
                "En cours de fabrication",

            description:
                "L'impression 3D est lancée ! Votre décoration est actuellement en fabrication."

        },


        ready: {

            icon: "🟢",

            title:
                "Prête pour la livraison !",

            description:
                "Votre boule est prête. Nous repassons chez vous pour vous la remettre."

        },


        delivered: {

            icon: "⚫",

            title:
                "Livrée",

            description:
                "Votre commande est terminée. Merci pour votre confiance !"

        }

    };


    const status =
        statuses[order.status];


    if (!status)
        return;


    if (icon)
        icon.textContent =
            status.icon;


    if (title)
        title.textContent =
            status.title;


    if (description)
        description.textContent =
            status.description;


    if (number)
        number.textContent =
            formatOrderNumber(
                order.order_number
            );


    if (result)
        result.classList.remove(
            "hidden"
        );

}


/* ============================================================
   10. CONNEXION ADMIN
============================================================ */

async function adminLogin() {

    const emailInput =
        document.getElementById(
            "admin-email"
        );


    const passwordInput =
        document.getElementById(
            "admin-password"
        );


    const errorBox =
        document.getElementById(
            "admin-login-error"
        );


    if (!emailInput || !passwordInput) {

        console.error(
            "Champs admin introuvables."
        );

        return;

    }


    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );

    }


    if (!email || !password) {

        if (errorBox) {

            errorBox.textContent =
                "Veuillez entrer votre email et votre mot de passe.";

            errorBox.classList.remove(
                "hidden"
            );

        }

        return;

    }


    const button =
        document.querySelector(
            "#admin-login .btn.primary"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Connexion...";

    }


    try {

        const {
            data,
            error
        } = await db.auth.signInWithPassword({

            email:
                email,

            password:
                password

        });


        if (error)
            throw error;


        console.log(
            "Connexion réussie :",
            data.user.email
        );


        /*
            IMPORTANT :

            On enlève la page de connexion
            AVANT d'ouvrir l'administration.
        */

        document
            .querySelectorAll(".page")
            .forEach(page => {

                page.classList.remove(
                    "active"
                );

            });


        /*
            Afficher le dashboard
        */

        const adminPage =
            document.getElementById(
                "admin"
            );


        if (!adminPage) {

            throw new Error(
                "La section #admin n'existe pas dans index.html"
            );

        }


        adminPage.classList.add(
            "active"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
            Charger les commandes
        */

        await loadOrders();

    }


    catch(error) {

        console.error(
            "Erreur connexion admin :",
            error
        );


        if (errorBox) {

            /*
                Message plus précis si Supabase
                renvoie une erreur connue.
            */

            if (
                error.message &&
                error.message.length < 150
            ) {

                errorBox.textContent =
                    error.message;

            }
            else {

                errorBox.textContent =
                    "Email ou mot de passe incorrect.";

            }


            errorBox.classList.remove(
                "hidden"
            );

        }

    }


    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "🔐 Se connecter";

        }

    }

}


/* ============================================================
   11. DÉCONNEXION ADMIN
============================================================ */

async function logoutAdmin() {

    try {

        await db.auth.signOut();

    }


    catch(error) {

        console.error(
            "Erreur déconnexion :",
            error
        );

    }


    showPage("home");

}


/* ============================================================
   12. CHARGER LES COMMANDES ADMIN
============================================================ */

async function loadOrders() {

    const {
        data: userData,
        error: userError
    } = await db.auth.getUser();


    if (
        userError ||
        !userData ||
        !userData.user
    ) {

        showPage("admin-login");

        return;

    }


    const tbody =
        document.getElementById(
            "orders-table"
        );


    if (!tbody)
        return;


    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                Chargement des commandes...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } = await db
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error)
            throw error;


        renderOrders(
            data || []
        );

    }


    catch(error) {

        console.error(
            "Erreur chargement commandes :",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Impossible de charger les commandes.
                    Vérifie les règles RLS Supabase.
                </td>
            </tr>
        `;

    }

}


/* ============================================================
   13. AFFICHER LES COMMANDES
============================================================ */

function renderOrders(orders) {

    const tbody =
        document.getElementById(
            "orders-table"
        );


    if (!tbody)
        return;


    tbody.innerHTML = "";


    let pending = 0;

    let production = 0;

    let ready = 0;


    orders.forEach(order => {

        if (order.status === "pending")
            pending++;


        if (order.status === "production")
            production++;


        if (order.status === "ready")
            ready++;


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>

                <strong>
                    ${formatOrderNumber(
                        order.order_number
                    )}
                </strong>

                <br>

                <small>
                    ${formatDate(
                        order.created_at
                    )}
                </small>

            </td>


            <td>

                <strong>
                    ${escapeHTML(
                        order.customer_first_name
                    )}
                    ${escapeHTML(
                        order.customer_last_name
                    )}
                </strong>

                <br>

                <small>
                    ${escapeHTML(
                        order.email
                    )}
                </small>

                ${
                    order.phone
                    ?
                    `
                    <br>
                    <small>
                        📞 ${escapeHTML(
                            order.phone
                        )}
                    </small>
                    `
                    :
                    ""
                }

            </td>


            <td>

                ${escapeHTML(
                    order.street
                )}

                <br>

                ${escapeHTML(
                    order.city
                )}

                ${
                    order.address_complement
                    ?
                    `
                    <br>
                    ${escapeHTML(
                        order.address_complement
                    )}
                    `
                    :
                    ""
                }

            </td>


            <td>

                ${escapeHTML(
                    order.model
                )}

            </td>


            <td>

                ${
                    order.personalization
                    ?
                    escapeHTML(
                        order.personalization
                    )
                    :
                    "-"
                }

            </td>


            <td>

                ${
                    order.specific_color
                    ?
                    "🎨 Oui"
                    :
                    "Non"
                }

            </td>


            <td>

                <select
                    class="status-select"
                    onchange="changeStatus(
                        '${order.id}',
                        this.value
                    )">

                    <option
                        value="pending"
                        ${
                            order.status === "pending"
                            ?
                            "selected"
                            :
                            ""
                        }>

                        🔴 En attente

                    </option>


                    <option
                        value="production"
                        ${
                            order.status === "production"
                            ?
                            "selected"
                            :
                            ""
                        }>

                        🟡 Fabrication

                    </option>


                    <option
                        value="ready"
                        ${
                            order.status === "ready"
                            ?
                            "selected"
                            :
                            ""
                        }>

                        🟢 Prête

                    </option>


                    <option
                        value="delivered"
                        ${
                            order.status === "delivered"
                            ?
                            "selected"
                            :
                            ""
                        }>

                        ⚫ Livrée

                    </option>

                </select>

            </td>

        `;


        tbody.appendChild(
            row
        );

    });


    const total =
        document.getElementById(
            "stat-total"
        );

    const pendingElement =
        document.getElementById(
            "stat-pending"
        );

    const productionElement =
        document.getElementById(
            "stat-production"
        );

    const readyElement =
        document.getElementById(
            "stat-ready"
        );


    if (total)
        total.textContent =
            orders.length;


    if (pendingElement)
        pendingElement.textContent =
            pending;


    if (productionElement)
        productionElement.textContent =
            production;


    if (readyElement)
        readyElement.textContent =
            ready;

}


/* ============================================================
   14. CHANGER LE STATUT
============================================================ */

async function changeStatus(
    id,
    newStatus
) {

    try {

        const {
            error
        } = await db
            .from("orders")
            .update({

                status:
                    newStatus

            })
            .eq(
                "id",
                id
            );


        if (error)
            throw error;


        await loadOrders();

    }


    catch(error) {

        console.error(
            "Erreur changement statut :",
            error
        );


        alert(
            "Impossible de modifier le statut."
        );

    }

}


/* ============================================================
   15. COMMANDE MANUELLE
============================================================ */

function openManualOrder() {

    const modal =
        document.getElementById(
            "manual-modal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


function closeManualOrder() {

    const modal =
        document.getElementById(
            "manual-modal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* ============================================================
   16. FORMULAIRE COMMANDE MANUELLE
============================================================ */

const manualForm =
    document.getElementById(
        "manual-form"
    );


if (manualForm) {

    manualForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            try {

                const result =
                    await createOrder({

                        firstName:
                            document
                                .getElementById(
                                    "manual-first-name"
                                )
                                .value,

                        lastName:
                            document
                                .getElementById(
                                    "manual-last-name"
                                )
                                .value,

                        street:
                            document
                                .getElementById(
                                    "manual-street"
                                )
                                .value,

                        city:
                            document
                                .getElementById(
                                    "manual-city"
                                )
                                .value,

                        complement:
                            document
                                .getElementById(
                                    "manual-complement"
                                )
                                .value,

                        email:
                            document
                                .getElementById(
                                    "manual-email"
                                )
                                .value,

                        phone:
                            document
                                .getElementById(
                                    "manual-phone"
                                )
                                .value,

                        model:
                            document
                                .getElementById(
                                    "manual-model"
                                )
                                .value,

                        personalization:
                            document
                                .getElementById(
                                    "manual-personalization"
                                )
                                .value,

                        specificColor:
                            document
                                .getElementById(
                                    "manual-color"
                                )
                                .checked

                    });


                alert(
                    "Commande créée : " +
                    formatOrderNumber(
                        result.order_number
                    )
                );


                manualForm.reset();


                closeManualOrder();


                await loadOrders();

            }


            catch(error) {

                console.error(
                    "Erreur commande manuelle :",
                    error
                );


                alert(
                    "Impossible de créer la commande."
                );

            }

        }
    );

}


/* ============================================================
   17. PROTECTION CONTRE L'HTML INJECTÉ
============================================================ */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ============================================================
   18. FORMAT DATE
============================================================ */

function formatDate(date) {

    if (!date)
        return "";


    return new Date(date)
        .toLocaleDateString(
            "fr-FR",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }
        );

}


/* ============================================================
   19. FLOCONS DE NEIGE
============================================================ */

function createSnowflake() {

    const container =
        document.getElementById(
            "snow-container"
        );


    if (!container)
        return;


    const snow =
        document.createElement(
            "div"
        );


    snow.className =
        "snowflake";


    snow.textContent =
        Math.random() > 0.5
        ? "❄"
        : "•";


    snow.style.left =
        Math.random() * 100 +
        "%";


    snow.style.fontSize =
        (
            Math.random() * 10 +
            7
        ) +
        "px";


    snow.style.animationDuration =
        (
            Math.random() * 8 +
            7
        ) +
        "s";


    snow.style.opacity =
        Math.random() * 0.5 +
        0.3;


    container.appendChild(
        snow
    );


    setTimeout(
        () => snow.remove(),
        16000
    );

}


setInterval(
    createSnowflake,
    350
);


/* ============================================================
   20. INITIALISATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        /*
            Accueil
        */

        showPage("home");


        /*
            Vérifier s'il existe déjà
            une session Supabase.
        */

        try {

            const {
                data
            } = await db.auth.getUser();


            if (
                data &&
                data.user
            ) {

                console.log(
                    "Session Supabase active."
                );

            }

        }


        catch(error) {

            console.error(
                "Erreur initialisation Supabase :",
                error
            );

        }

    }
);
