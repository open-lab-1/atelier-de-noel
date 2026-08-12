/* ============================================================
   L'ATELIER DE NOËL 3D
   APP.JS
============================================================ */


/* ============================================================
   1. CONFIGURATION SUPABASE
============================================================ */

/*
    IMPORTANT :

    Cette clé est une Publishable key.
    Elle peut être utilisée dans un site GitHub Pages.

    NE JAMAIS mettre ici :
    - sb_secret_...
    - service_role
*/

const SUPABASE_URL =
    "https://sdqtgluhgywedjwgolei.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zY7V5CoRa2mYRYhZdm8v7Q_lc5U1Lm_";


/*
    Création de la connexion Supabase
*/

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ============================================================
   2. NAVIGATION DU SITE
============================================================ */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


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
        Si quelqu'un essaye d'ouvrir
        l'administration sans être connecté,
        on l'envoie vers la connexion.
    */

    if (pageId === "admin") {

        checkAdminAndOpen();

        return;

    }


    page.classList.add("active");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   3. OUVRIR UNE PAGE ADMIN APRÈS VÉRIFICATION
============================================================ */

async function checkAdminAndOpen() {

    const {
        data,
        error
    } = await db.auth.getUser();


    if (
        error ||
        !data ||
        !data.user
    ) {

        showPage("admin-login");

        return;

    }


    /*
        L'utilisateur est connecté.

        La RLS Supabase vérifiera ensuite
        si son UID est bien celui de l'admin.
    */

    document
        .getElementById("admin")
        .classList.add("active");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    await loadOrders();

}


/* ============================================================
   4. CHOIX D'UN MODÈLE
============================================================ */

function selectModel(model) {

    showPage("order");


    const modelInput =
        document.getElementById("model");


    if (modelInput) {

        modelInput.value = model;

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
   5. FORMAT DU NUMÉRO DE COMMANDE
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


            errorBox.classList.add(
                "hidden"
            );


            const button =
                orderForm.querySelector(
                    "button[type='submit']"
                );


            button.disabled = true;

            button.textContent =
                "Création de la commande...";


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
                    Supabase renvoie le numéro
                    créé automatiquement.
                */

                const orderNumber =
                    formatOrderNumber(
                        result.order_number
                    );


                document
                    .getElementById(
                        "success-number"
                    )
                    .textContent =
                    orderNumber;


                /*
                    On cache le formulaire.
                */

                orderForm.classList.add(
                    "hidden"
                );


                /*
                    On affiche le succès.
                */

                document
                    .getElementById(
                        "order-success"
                    )
                    .classList.remove(
                        "hidden"
                    );


                /*
                    On remet le formulaire
                    à zéro pour une prochaine
                    commande.
                */

                orderForm.reset();

            }


            catch(error) {

                console.error(error);


                errorBox.textContent =
                    "Impossible d'enregistrer la commande. Vérifiez votre connexion ou la configuration Supabase.";


                errorBox.classList.remove(
                    "hidden"
                );

            }


            finally {

                button.disabled = false;

                button.textContent =
                    "🎄 Valider la commande";

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


    const raw =
        input.value
            .trim()
            .toUpperCase();


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


    resultBox.classList.add(
        "hidden"
    );


    errorBox.classList.add(
        "hidden"
    );


    loading.classList.remove(
        "hidden"
    );


    /*
        Accepte :

        #SW-042
        SW-042
        042
    */

    const match =
        raw.match(/(\d+)/);


    if (!match) {

        loading.classList.add(
            "hidden"
        );

        errorBox.textContent =
            "Numéro de commande invalide.";

        errorBox.classList.remove(
            "hidden"
        );

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


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                "Commande introuvable"
            );

        }


        displayTracking(data);

    }


    catch(error) {

        console.error(error);


        errorBox.textContent =
            "Commande introuvable. Vérifiez votre numéro de commande.";


        errorBox.classList.remove(
            "hidden"
        );

    }


    finally {

        loading.classList.add(
            "hidden"
        );

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


    if (!status) {

        return;

    }


    icon.textContent =
        status.icon;


    title.textContent =
        status.title;


    description.textContent =
        status.description;


    number.textContent =
        formatOrderNumber(
            order.order_number
        );


    result.classList.remove(
        "hidden"
    );

}


/* ============================================================
   10. CONNEXION ADMIN
============================================================ */

async function adminLogin() {

    const email =
        document
            .getElementById(
                "admin-email"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "admin-password"
            )
            .value;


    const errorBox =
        document.getElementById(
            "admin-login-error"
        );


    errorBox.classList.add(
        "hidden"
    );


    if (!email || !password) {

        errorBox.textContent =
            "Veuillez entrer votre email et votre mot de passe.";

        errorBox.classList.remove(
            "hidden"
        );

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

            email: email,

            password: password

        });


        if (error) {

            throw error;

        }


        console.log(
            "Connexion réussie :",
            data.user.email
        );


        /*
            On ouvre l'administration.
        */

        await checkAdminAndOpen();

    }


    catch(error) {

        console.error(
            "Erreur connexion admin :",
            error
        );


        errorBox.textContent =
            "Email ou mot de passe incorrect.";


        errorBox.classList.remove(
            "hidden"
        );

    }


    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Entrer";

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

        console.error(error);

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


        if (error) {

            throw error;

        }


        renderOrders(data || []);

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


    tbody.innerHTML = "";


    let pending = 0;

    let production = 0;

    let ready = 0;


    orders.forEach(order => {

        if (
            order.status ===
            "pending"
        ) {

            pending++;

        }


        if (
            order.status ===
            "production"
        ) {

            production++;

        }


        if (
            order.status ===
            "ready"
        ) {

            ready++;

        }


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
                            order.status ===
                            "pending"
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
                            order.status ===
                            "production"
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
                            order.status ===
                            "ready"
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
                            order.status ===
                            "delivered"
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


        tbody.appendChild(row);

    });


    /*
        Statistiques
    */

    document
        .getElementById(
            "stat-total"
        )
        .textContent =
        orders.length;


    document
        .getElementById(
            "stat-pending"
        )
        .textContent =
        pending;


    document
        .getElementById(
            "stat-production"
        )
        .textContent =
        production;


    document
        .getElementById(
            "stat-ready"
        )
        .textContent =
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


        if (error) {

            throw error;

        }


        /*
            Actualisation du tableau.
        */

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
   15. OUVRIR COMMANDE MANUELLE
============================================================ */

function openManualOrder() {

    document
        .getElementById(
            "manual-modal"
        )
        .classList.remove(
            "hidden"
        );

}


function closeManualOrder() {

    document
        .getElementById(
            "manual-modal"
        )
        .classList.add(
            "hidden"
        );

}


/* ============================================================
   16. COMMANDE MANUELLE
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

                console.error(error);


                alert(
                    "Impossible de créer la commande."
                );

            }

        }
    );

}


/* ============================================================
   17. ÉCHAPPEMENT HTML
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
   18. DATE
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


/*
    Un flocon toutes les 350 ms
*/

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
            Page d'accueil
        */

        showPage("home");


        /*
            Si une session admin existe déjà,
            elle sera conservée par Supabase.
        */

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
);
